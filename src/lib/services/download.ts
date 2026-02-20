// import WebTorrent from 'webtorrent';
import path from 'path';
import { logger } from '../logger';

// Helper to get client dynamically
async function getClient() {
  // @ts-ignore
  const { default: WebTorrent } = await import('webtorrent');
  return new WebTorrent();
}

export const downloadService = {
  downloadTorrent(magnetLink: string, downloadDir: string, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const client = await getClient();
        
        // Log client errors
        client.on('error', (err: any) => {
            logger.error({ err }, 'WebTorrent Client Error');
        });

        client.add(magnetLink, { path: downloadDir }, (torrent: any) => {
          logger.info({ infoHash: torrent.infoHash, name: torrent.name }, 'Torrent added');

          torrent.on('infoHash', () => logger.debug('Torrent infoHash event received'));
          torrent.on('metadata', () => logger.info('Torrent metadata received'));
          torrent.on('ready', () => {
              logger.info({ files: torrent.files.map((f: any) => f.name) }, 'Torrent ready');

              // Logic to select ONLY the largest video file
              const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'];
              
              // Find all video files
              const videoFiles = torrent.files.filter((file: any) => {
                  const ext = path.extname(file.name).toLowerCase();
                  return videoExtensions.includes(ext);
              });
              
              if (videoFiles.length === 0) {
                  logger.warn('No video files found in torrent! Falling back to largest file of any type.');
                  // Fallback: use ALL files to find the largest one
                  videoFiles.push(...torrent.files);
              }

              // Sort by size descending
              videoFiles.sort((a: any, b: any) => b.length - a.length);

              const largestFile = videoFiles[0];
              logger.info({ 
                  fileName: largestFile.name, 
                  size: largestFile.length 
              }, 'Selected largest file for download');

              // Deselect ALL files first
              torrent.files.forEach((file: any) => file.deselect());

              // Select ONLY the largest file
              largestFile.select();
          });
          
          if (onProgress) {
              torrent.on('download', (bytes: number) => {
                  onProgress(torrent.progress * 100);
              });
          }

          torrent.on('warning', (err: any) => logger.warn({ err }, 'Torrent warning'));
          torrent.on('error', (err: any) => {
            logger.error({ err }, 'Torrent error');
            try { client.destroy(); } catch (e) { /* ignore */ }
            reject(err);
          });

          torrent.on('noPeers', (announceType: string) => {
             logger.warn({ announceType }, 'No peers found');
          });

          torrent.on('wire', (wire: any, addr: string) => {
             logger.debug({ addr }, 'Connected to peer');
          });

          torrent.on('done', () => {
             logger.info({ infoHash: torrent.infoHash }, 'Download finished');
             if (onProgress) onProgress(100);

             // We only care about the largest video file we selected
             // If we fell back to "all files", we still just try to find a video to return path for
             const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'];
             
             // Try to find the file we selected (largest video)
             // or just the first video file found if our selection logic didn't run for some reason
             const videoFiles = torrent.files.filter((file: any) => {
                  const ext = path.extname(file.name).toLowerCase();
                  return videoExtensions.includes(ext);
              });
             
             videoFiles.sort((a: any, b: any) => b.length - a.length);
             const targetFile = videoFiles[0] || torrent.files[0];
             
             const resultPath = path.join(downloadDir, targetFile.path);
             logger.info({ resultPath }, 'Download result path');

             // Destroy client to free resources/ports (delayed to prevent socket resets)
             setTimeout(() => {
                 try { client.destroy(); } catch (e) { /* ignore */ }
             }, 5000);
             resolve(resultPath);
          });
        });
      } catch (err) {
        logger.error({ err }, 'Exception in downloadTorrent');
        reject(err);
      }
    });
  },
  
  // Deprecated: creates a separate client which is often disconnected from the main download
  async onProgress(magnetLink: string, callback: (progress: number) => void) {
      logger.warn('Calling deprecated onProgress method. Use the callback in downloadTorrent instead.');
  }
};

