import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { logger } from '../src/lib/logger'; // Import shared logger

import { downloadService } from '../src/lib/services/download';
import { bunnyService } from '../src/lib/services/bunny';
import { webhookService } from '../src/lib/services/webhook';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});
logger.debug({ redisUrl: process.env.REDIS_URL }, 'DEBUG: REDIS_URL');
connection.config('GET', 'maxmemory-policy').then((res) => {
    logger.debug({ config: res }, 'DEBUG: Redis config');
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.warn('Using Anon Key for Supabase. Ensure RLS policies allow updates or provide SUPABASE_SERVICE_ROLE_KEY.');
}

logger.info('Worker started...');

// Ensure downloads directory exists
const DOWNLOAD_DIR = path.resolve(process.cwd(), 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

const worker = new Worker('media-ingestion', async (job: Job) => {
  logger.info({ jobId: job.id, type: job.name }, `Processing job ${job.id} of type ${job.name}`);
  const { jobId, sourceUrl, type, metadata } = job.data;
  
  try {
    // 1. Downloading
    await updateJobStatus(jobId, 'DOWNLOADING', 0);
    let filePath = '';

    if (type === 'MAGNET') {
       // Pass a progress callback directly to downloadTorrent
       let lastProgress = -1;
       
       const onProgress = (progress: number) => {
          const currentProgress = Math.round(progress);
          
          // Only update if percentage has actually changed
          if (currentProgress !== lastProgress) {
              lastProgress = currentProgress;
              
              job.updateProgress(currentProgress); // Keep BullMQ updated
              logger.info({ jobId: job.id, progress: currentProgress }, `Job ${job.id} progress: ${currentProgress}%`);

              // Only update DB status every 5% to reduce write load and network saturation
              if (currentProgress % 5 === 0) {
                 updateJobStatus(jobId, 'DOWNLOADING', currentProgress);
              }
          }
       };

       // Since I haven't updated the signature yet, I'll update download.ts NEXT.
       // But for this file, I'll call it as if it supports it.
       // @ts-ignore
       filePath = await downloadService.downloadTorrent(sourceUrl, DOWNLOAD_DIR, onProgress);
    } else {
       // Direct download handling...
       throw new Error("Direct download worker logic not yet implemented");
    }

    // 2. Uploading to Bunny
    await updateJobStatus(jobId, 'UPLOADING', 0);
    const videoTitle = metadata?.title || `Video ${jobId}`;
    
    // Create Video Placeholder
    const video = await bunnyService.createVideo(videoTitle);
    
    // Upload File
    await bunnyService.uploadVideo(video.guid, filePath);

    // 3. Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 4. Complete
    await updateJobStatus(jobId, 'COMPLETED', 100);
    
    // 5. Webhook
    if (metadata?.webhookUrl) {
      await webhookService.sendStatusUpdate(metadata.webhookUrl, {
        jobId,
        status: 'COMPLETED',
        bunnyVideoId: video.guid,
        metadata
      });
    }

    logger.info({ jobId: job.id }, `Job ${job.id} completed!`);
  } catch (error) {
    logger.error({ err: error, jobId: job.id }, `Job ${job.id} failed`);
    await updateJobStatus(jobId, 'FAILED', 0, error instanceof Error ? error.message : 'Unknown error');
    
    if (metadata?.webhookUrl) {
        await webhookService.sendStatusUpdate(metadata.webhookUrl, {
          jobId,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata
        });
      }
      
    throw error;
  }
}, {
  connection: connection as any,
  concurrency: 2, // Lower concurrency for heavy downloads
});

async function updateJobStatus(jobId: string, status: string, progress: number, error?: string) {
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
    logger.error({ err: dbError }, 'Failed to update job status in Supabase');
  }
}

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, `Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  logger.error({ err, jobId: job?.id }, `Job ${job?.id} has failed`);
});
