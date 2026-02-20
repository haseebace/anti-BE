"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadService = void 0;
// import WebTorrent from 'webtorrent';
const path_1 = __importDefault(require("path"));
const logger_1 = require("../logger");
// Helper to get client dynamically
async function getClient() {
    // @ts-ignore
    const { default: WebTorrent } = await import('webtorrent');
    return new WebTorrent();
}
exports.downloadService = {
    downloadTorrent(magnetLink, downloadDir, onProgress) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await getClient();
                // Log client errors
                client.on('error', (err) => {
                    logger_1.logger.error({ err }, 'WebTorrent Client Error');
                });
                client.add(magnetLink, { path: downloadDir }, (torrent) => {
                    logger_1.logger.info({ infoHash: torrent.infoHash, name: torrent.name }, 'Torrent added');
                    torrent.on('infoHash', () => logger_1.logger.debug('Torrent infoHash event received'));
                    torrent.on('metadata', () => logger_1.logger.info('Torrent metadata received'));
                    torrent.on('ready', () => {
                        logger_1.logger.info({ files: torrent.files.map((f) => f.name) }, 'Torrent ready');
                        // Logic to select ONLY the largest video file
                        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'];
                        // Find all video files
                        const videoFiles = torrent.files.filter((file) => {
                            const ext = path_1.default.extname(file.name).toLowerCase();
                            return videoExtensions.includes(ext);
                        });
                        if (videoFiles.length === 0) {
                            logger_1.logger.warn('No video files found in torrent! Falling back to largest file of any type.');
                            // Fallback: use ALL files to find the largest one
                            videoFiles.push(...torrent.files);
                        }
                        // Sort by size descending
                        videoFiles.sort((a, b) => b.length - a.length);
                        const largestFile = videoFiles[0];
                        logger_1.logger.info({
                            fileName: largestFile.name,
                            size: largestFile.length
                        }, 'Selected largest file for download');
                        // Deselect ALL files first
                        torrent.files.forEach((file) => file.deselect());
                        // Select ONLY the largest file
                        largestFile.select();
                    });
                    if (onProgress) {
                        torrent.on('download', (bytes) => {
                            onProgress(torrent.progress * 100);
                        });
                    }
                    torrent.on('warning', (err) => logger_1.logger.warn({ err }, 'Torrent warning'));
                    torrent.on('error', (err) => {
                        logger_1.logger.error({ err }, 'Torrent error');
                        try {
                            client.destroy();
                        }
                        catch (e) { /* ignore */ }
                        reject(err);
                    });
                    torrent.on('noPeers', (announceType) => {
                        logger_1.logger.warn({ announceType }, 'No peers found');
                    });
                    torrent.on('wire', (wire, addr) => {
                        logger_1.logger.debug({ addr }, 'Connected to peer');
                    });
                    torrent.on('done', () => {
                        logger_1.logger.info({ infoHash: torrent.infoHash }, 'Download finished');
                        if (onProgress)
                            onProgress(100);
                        // We only care about the largest video file we selected
                        // If we fell back to "all files", we still just try to find a video to return path for
                        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'];
                        // Try to find the file we selected (largest video)
                        // or just the first video file found if our selection logic didn't run for some reason
                        const videoFiles = torrent.files.filter((file) => {
                            const ext = path_1.default.extname(file.name).toLowerCase();
                            return videoExtensions.includes(ext);
                        });
                        videoFiles.sort((a, b) => b.length - a.length);
                        const targetFile = videoFiles[0] || torrent.files[0];
                        const resultPath = path_1.default.join(downloadDir, targetFile.path);
                        logger_1.logger.info({ resultPath }, 'Download result path');
                        // Destroy client to free resources/ports (delayed to prevent socket resets)
                        setTimeout(() => {
                            try {
                                client.destroy();
                            }
                            catch (e) { /* ignore */ }
                        }, 5000);
                        resolve(resultPath);
                    });
                });
            }
            catch (err) {
                logger_1.logger.error({ err }, 'Exception in downloadTorrent');
                reject(err);
            }
        });
    },
    // Deprecated: creates a separate client which is often disconnected from the main download
    async onProgress(magnetLink, callback) {
        logger_1.logger.warn('Calling deprecated onProgress method. Use the callback in downloadTorrent instead.');
    }
};
