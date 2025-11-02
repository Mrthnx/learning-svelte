import { onMount } from 'svelte';
import { browser } from '$app/environment';

/**
 * Hook to warn users about unsaved changes before leaving the page
 * @param isDirty - Svelte derived/state that tracks if there are unsaved changes
 * @param message - Optional custom warning message
 */
export function useUnsavedChanges(isDirty: () => boolean, message?: string) {
	onMount(() => {
		if (!browser) return;

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isDirty()) {
				e.preventDefault();
				if (message) {
					e.returnValue = message;
				} else {
					e.returnValue = '';
				}
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});
}
