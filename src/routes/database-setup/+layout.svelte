<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/store';
	import { Navbar, Sidebar } from '$lib/components/me';

	onMount(() => {
		const unsubscribe = authStore.subscribe((auth) => {
			if (!auth.isAuthenticated) {
				goto('/auth');
			}
		});

		return () => unsubscribe();
	});
</script>

<div class="dashboard-background min-h-screen">
	<Navbar />

	<!-- Sidebar Wrapper (Desktop + Mobile) -->
	<Sidebar />

	<main class="md:ml-20">
		<div class="p-3 sm:p-6 md:p-8">
			<!-- <DynamicBreadcrumb /> -->
			<slot />
		</div>
	</main>
</div>
