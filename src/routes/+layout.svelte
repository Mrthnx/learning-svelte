<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { LoadingOverlay } from '$lib/components/me/loading-overlay';
	import { UnauthorizedAlert } from '$lib/components/me/unauthorized-alert';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from '$lib/services/api';
	import { authStore } from '$lib/store';
	import { get as getStoreValue } from 'svelte/store';

	let { children } = $props();

	onMount(() => {
		const unsubscribe = page.subscribe(async ($page) => {
			const token = getStoreValue(authStore).token;
			if (!$page.route.id?.startsWith('/auth') && token) {
				try {
					await get('ping');
					console.log('Ping successful');
				} catch (error) {
					console.error('Ping failed', error);
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

<LoadingOverlay />
<UnauthorizedAlert />
