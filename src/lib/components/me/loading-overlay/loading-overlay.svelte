<script lang="ts">
	import { loadingStore } from '$lib/store';
	import { Logo } from '$lib/components/me/logo';
</script>

{#if $loadingStore}
	<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
		<div class="flex flex-col items-center justify-center">
			<Logo size="lg" class="mb-4 animate-pulse text-white" />
			<span class="text-lg font-semibold text-white">Cargando...</span>
		</div>
	</div>
{/if}
