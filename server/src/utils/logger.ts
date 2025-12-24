import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Centralized logger using Pino
 * Works both during startup and throughout the application lifecycle
 */
const logger = pino({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
        },
    } : undefined,
});

export default logger;
