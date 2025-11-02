/**
 * Creates a debounced version of a callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced function and cleanup
 */
export function debounce<T extends (...args: any[]) => any>(
	callback: T,
	delay: number = 500
): {
	debounced: (...args: Parameters<T>) => void;
	clear: () => void;
} {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const debounced = (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			callback(...args);
		}, delay);
	};

	const clear = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	return { debounced, clear };
}

/**
 * Svelte $effect compatible debounce
 * Use this in a $effect to debounce reactive changes
 * @param value - The value to watch
 * @param callback - The function to call when value changes (after delay)
 * @param delay - Delay in milliseconds (default: 500ms)
 */
export function useDebounce<T>(value: T, callback: (value: T) => void, delay: number = 500) {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const cleanup = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	// Clear existing timeout
	cleanup();

	// Set new timeout
	timeoutId = setTimeout(() => {
		callback(value);
	}, delay);

	return cleanup;
}
