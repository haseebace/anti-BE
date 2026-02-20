"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../src/lib/logger"); // Import shared logger
const download_1 = require("../src/lib/services/download");
const bunny_1 = require("../src/lib/services/bunny");
const webhook_1 = require("../src/lib/services/webhook");
const fs_1 = __importDefault(require("fs"));
// Load environment variables from .env.local
dotenv.config({ path: path_1.default.resolve(process.cwd(), '.env.local'), override: true });
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});
logger_1.logger.debug({ redisUrl: process.env.REDIS_URL }, 'DEBUG: REDIS_URL');
connection.config('GET', 'maxmemory-policy').then((res) => {
    logger_1.logger.debug({ config: res }, 'DEBUG: Redis config');
});
const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logger_1.logger.warn('Using Anon Key for Supabase. Ensure RLS policies allow updates or provide SUPABASE_SERVICE_ROLE_KEY.');
}
logger_1.logger.info('Worker started...');
// Ensure downloads directory exists
const DOWNLOAD_DIR = path_1.default.resolve(process.cwd(), 'downloads');
if (!fs_1.default.existsSync(DOWNLOAD_DIR)) {
    fs_1.default.mkdirSync(DOWNLOAD_DIR);
}
const worker = new bullmq_1.Worker('media-ingestion', async (job) => {
    logger_1.logger.info({ jobId: job.id, type: job.name }, `Processing job ${job.id} of type ${job.name}`);
    const { jobId, sourceUrl, type, metadata } = job.data;
    try {
        // 1. Downloading
        await updateJobStatus(jobId, 'DOWNLOADING', 0);
        let filePath = '';
        if (type === 'MAGNET') {
            // Pass a progress callback directly to downloadTorrent
            let lastProgress = -1;
            const onProgress = (progress) => {
                const currentProgress = Math.round(progress);
                // Only update if percentage has actually changed
                if (currentProgress !== lastProgress) {
                    lastProgress = currentProgress;
                    job.updateProgress(currentProgress); // Keep BullMQ updated
                    logger_1.logger.info({ jobId: job.id, progress: currentProgress }, `Job ${job.id} progress: ${currentProgress}%`);
                    // Only update DB status every 5% to reduce write load and network saturation
                    if (currentProgress % 5 === 0) {
                        updateJobStatus(jobId, 'DOWNLOADING', currentProgress);
                    }
                }
            };
            // Since I haven't updated the signature yet, I'll update download.ts NEXT.
            // But for this file, I'll call it as if it supports it.
            // @ts-ignore
            filePath = await download_1.downloadService.downloadTorrent(sourceUrl, DOWNLOAD_DIR, onProgress);
        }
        else {
            // Direct download handling...
            throw new Error("Direct download worker logic not yet implemented");
        }
        // 2. Uploading to Bunny
        await updateJobStatus(jobId, 'UPLOADING', 0);
        const videoTitle = metadata?.title || `Video ${jobId}`;
        // Create Video Placeholder
        const video = await bunny_1.bunnyService.createVideo(videoTitle);
        // Upload File
        await bunny_1.bunnyService.uploadVideo(video.guid, filePath);
        // 3. Cleanup
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // 4. Complete
        await updateJobStatus(jobId, 'COMPLETED', 100);
        // 5. Webhook
        if (metadata?.webhookUrl) {
            await webhook_1.webhookService.sendStatusUpdate(metadata.webhookUrl, {
                jobId,
                status: 'COMPLETED',
                bunnyVideoId: video.guid,
                metadata
            });
        }
        logger_1.logger.info({ jobId: job.id }, `Job ${job.id} completed!`);
    }
    catch (error) {
        logger_1.logger.error({ err: error, jobId: job.id }, `Job ${job.id} failed`);
        await updateJobStatus(jobId, 'FAILED', 0, error instanceof Error ? error.message : 'Unknown error');
        if (metadata?.webhookUrl) {
            await webhook_1.webhookService.sendStatusUpdate(metadata.webhookUrl, {
                jobId,
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata
            });
        }
        throw error;
    }
}, {
    connection: connection,
    concurrency: 2, // Lower concurrency for heavy downloads
});
async function updateJobStatus(jobId, status, progress, error) {
    const { error: dbError } = await supabase
        .from('jobs')
        .update({
        status,
        progress,
        updated_at: new Date().toISOString(),
        error_message: error
    })
        .eq('id', jobId);
    if (dbError) {
        logger_1.logger.error({ err: dbError }, 'Failed to update job status in Supabase');
    }
}
worker.on('completed', (job) => {
    logger_1.logger.info({ jobId: job.id }, `Job ${job.id} has completed!`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error({ err, jobId: job?.id }, `Job ${job?.id} has failed`);
});
