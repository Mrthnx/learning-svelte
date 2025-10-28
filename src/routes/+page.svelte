<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/store';
	import { AnimatedBackground } from '$lib/components/me';

	onMount(() => {
		const unsubscribe = authStore.subscribe((auth) => {
			if (auth.isAuthenticated) {
				goto('/dashboard');
			} else {
				goto('/auth');
			}
		});

		// Detener la suscripción cuando el componente se desmonte para evitar fugas de memoria
		return () => unsubscribe();
	});
</script>

<div class="relative flex min-h-screen w-full items-center justify-center p-4">
	<AnimatedBackground />

	<div class="relative z-10 grid w-full max-w-6xl grid-cols-1 md:grid-cols-2">
		<!-- Left Column: Branding -->
		<div class="flex flex-col justify-center p-10 text-white">
			<!-- Placeholder SVG Logo -->
			<svg
				class="mb-4 h-16 w-16"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 16a4 4 0 100-8 4 4 0 000 8z"
				/>
			</svg>
			<h1 class="text-4xl font-bold">PDM Director</h1>
			<p class="mt-2 text-lg text-gray-300">Precisión en cada vibración.</p>
		</div>

		<!-- Right Column: Empty or additional content if needed -->
		<div class="flex w-full flex-col items-center justify-center p-8 md:p-10">
			<!-- You can add more content here if desired, or leave it empty for a simpler layout -->
		</div>
	</div>
</div>
