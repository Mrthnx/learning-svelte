import { dev } from '$app/environment';

/**
 * Logger utility for development and production environments
 * Only logs in development mode by default
 */
export const logger = {
	/**
	 * Log informational messages (only in development)
	 */
	log: (message: string, ...args: unknown[]): void => {
		if (dev) {
			console.log(`[INFO] ${message}`, ...args);
		}
	},

	/**
	 * Log error messages (always logged)
	 */
	error: (message: string, ...args: unknown[]): void => {
		console.error(`[ERROR] ${message}`, ...args);
	},

	/**
	 * Log warning messages (only in development)
	 */
	warn: (message: string, ...args: unknown[]): void => {
		if (dev) {
			console.warn(`[WARN] ${message}`, ...args);
		}
	},

	/**
	 * Log debug messages (only in development)
	 */
	debug: (message: string, ...args: unknown[]): void => {
		if (dev) {
			console.debug(`[DEBUG] ${message}`, ...args);
		}
	}
};
