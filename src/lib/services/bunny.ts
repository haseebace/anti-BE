import axios from 'axios';
import fs from 'fs';
import { logger } from '../logger';

const BUNNY_BASE_URL = 'https://video.bunnycdn.com/library'; 

function getBunnyConfig() {
  const apiKey = process.env.BUNNY_API_KEY;
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  
  if (!apiKey || !libraryId) {
    logger.error('BunnyCDN API Key or Library ID is missing');
    throw new Error("BunnyCDN API Key or Library ID is missing in environment variables.");
  }
  
  return { apiKey, libraryId };
}

export const bunnyService = {
  async createVideo(title: string) {
    const { apiKey, libraryId } = getBunnyConfig();
    logger.info({ title, libraryId }, 'Creating new video placeholder in BunnyCDN');
    
    try {
        const response = await axios.post(
          `${BUNNY_BASE_URL}/${libraryId}/videos`,
          { title },
          { headers: { AccessKey: apiKey } }
        );
        logger.info({ guid: response.data.guid }, 'Video placeholder created successfully');
        return response.data; // { guid: "video-id", ... }
    } catch (error: any) {
        logger.error({ err: error.response?.data || error, status: error.response?.status }, 'Failed to create video placeholder');
        throw error;
    }
  },

  async uploadVideo(videoId: string, filePath: string) {
    const { apiKey, libraryId } = getBunnyConfig();
    
    try {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        logger.info({ videoId, filePath, size: fileSizeInBytes }, 'Starting upload to BunnyCDN');
        
        const fileStream = fs.createReadStream(filePath);
        
        const response = await axios.put(
          `${BUNNY_BASE_URL}/${libraryId}/videos/${videoId}`,
          fileStream,
          {
            headers: {
              AccessKey: apiKey,
              'Content-Type': 'application/octet-stream',
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                // Log every 10% to avoid spamming
                if (percentCompleted % 10 === 0) {
                     logger.debug({ videoId, percent: percentCompleted }, `Upload progress: ${percentCompleted}%`);
                }
            }
          }
        );
        
        logger.info({ videoId, status: response.status }, 'Upload completed successfully');
        return response.data;
    } catch (error: any) {
         logger.error({ err: error.response?.data || error, status: error.response?.status, videoId }, 'Failed to upload video');
         throw error;
    }
  },
  
  // Helper to fetch directly from URL (if we want to use Bunny's fetch API)
  async fetchVideo(videoId: string, url: string) {
     const { apiKey, libraryId } = getBunnyConfig();
     logger.info({ videoId, url }, 'Initiating BunnyCDN Fetch API');
     
     try {
         const response = await axios.post(
          `${BUNNY_BASE_URL}/${libraryId}/videos/${videoId}/fetch`,
          { url },
          { headers: { AccessKey: apiKey } }
        );
        logger.info({ videoId, response: response.data }, 'Fetch API request sent');
        return response.data;
     } catch (error: any) {
         logger.error({ err: error.response?.data || error }, 'Failed to initiate Fetch API');
         throw error;
     }
  },
};

