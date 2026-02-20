import pino from 'pino';
import path from 'path';

const streams = [
  { stream: process.stdout },
  { stream: pino.destination(path.resolve(process.cwd(), 'logs', 'worker.log')) },
];

export const logger = pino({
  level: process.env.LOG_LEVEL || 'debug', // Default to debug for now
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
      {
        target: 'pino/file',
        options: {
            destination: path.resolve(process.cwd(), 'logs', 'worker.log'),
            mkdir: true
        }
      }
    ],
  },
});
