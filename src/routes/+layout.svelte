<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { LoadingOverlay, UnauthorizedAlert } from '$lib/components/me';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from '$lib/services/api';
	import { authStore } from '$lib/store';
	import { logger } from '$lib/utils/logger';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		if (!browser) return;

		const unsubscribe = page.subscribe(async ($page) => {
			const auth = $authStore;
			if (!$page.route.id?.startsWith('/auth') && auth.token) {
				try {
					await get('ping');
					logger.debug('Ping successful');
				} catch (error) {
					logger.error('Ping failed', error);
				}
			}
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<Toaster richColors position="top-right" />
<LoadingOverlay />
<UnauthorizedAlert />
