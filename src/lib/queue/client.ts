import { Queue } from 'bullmq';
import connection from '@/lib/redis';

export const mediaQueue = new Queue('media-ingestion', {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 1000 },
  },
});
