<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/store';
	// import Navbar from '$lib/components/layout/Navbar.svelte';
	// import DynamicBreadcrumb from '$lib/components/ui/dynamic-breadcrumb/DynamicBreadcrumb.svelte';

	onMount(() => {
		const unsubscribe = authStore.subscribe((auth) => {
			if (!auth.isAuthenticated) {
				goto('/auth');
			}
		});

		return () => unsubscribe();
	});
</script>

<div class="min-h-screen">
	<!-- <Navbar /> -->
	<main class="md:ml-20">
		<div class="p-4 sm:p-6 md:p-8">
			<!-- <DynamicBreadcrumb /> -->
			<slot />
		</div>
	</main>
</div>
