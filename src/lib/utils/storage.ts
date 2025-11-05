import { browser } from '$app/environment';
import { logger } from '../utils/logger';

const STORAGE_PREFIX = 'app_';

/**
 * Safe wrapper for localStorage operations
 * Handles errors and provides fallback behavior
 */
export const storage = {
	/**
	 * Get item from localStorage
	 */
	get<T>(key: string, defaultValue?: T): T | null {
		if (!browser) return defaultValue ?? null;

		try {
			const item = localStorage.getItem(STORAGE_PREFIX + key);
			if (item === null) return defaultValue ?? null;
			return JSON.parse(item) as T;
		} catch (error) {
			logger.error(`Error reading from localStorage (key: ${key})`, error);
			return defaultValue ?? null;
		}
	},

	/**
	 * Set item in localStorage
	 */
	set<T>(key: string, value: T): boolean {
		if (!browser) return false;

		try {
			const serialized = JSON.stringify(value);
			// Check size (localStorage limit is typically 5-10MB)
			if (serialized.length > 5_000_000) {
				logger.warn(`Storage value too large for key: ${key}`);
				return false;
			}
			localStorage.setItem(STORAGE_PREFIX + key, serialized);
			return true;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'QuotaExceededError') {
				logger.error('localStorage quota exceeded');
			} else {
				logger.error(`Error writing to localStorage (key: ${key})`, error);
			}
			return false;
		}
	},

	/**
	 * Remove item from localStorage
	 */
	remove(key: string): void {
		if (!browser) return;

		try {
			localStorage.removeItem(STORAGE_PREFIX + key);
		} catch (error) {
			logger.error(`Error removing from localStorage (key: ${key})`, error);
		}
	},

	/**
	 * Clear all app items from localStorage
	 */
	clear(): void {
		if (!browser) return;

		try {
			const keys = Object.keys(localStorage);
			keys.forEach((key) => {
				if (key.startsWith(STORAGE_PREFIX)) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			logger.error('Error clearing localStorage', error);
		}
	}
};
