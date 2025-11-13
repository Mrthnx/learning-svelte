<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		isdraweropen?: boolean;
	}

	let { isdraweropen = $bindable(false) }: Props = $props();

	function toggledrawer() {
		isdraweropen = !isdraweropen;
	}
</script>

<!-- FAB - Botón rectangular vertical pegado al borde derecho inferior -->
<button
	onclick={toggledrawer}
	class="fixed right-0 bottom-4 z-[60] flex h-20 w-8 items-center justify-center rounded-l-lg bg-primary text-primary-foreground shadow-lg ring-offset-background transition-all duration-300 hover:w-10 hover:shadow-xl hover:ring-2 hover:ring-ring hover:ring-offset-2 active:scale-95 md:hidden"
	aria-label={isdraweropen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
	type="button"
>
	{#if !isdraweropen}
		<!-- ChevronLeft icon cuando está cerrado (para abrir) -->
		<ChevronLeft class="h-5 w-5 transition-transform duration-200" />
	{:else}
		<!-- ChevronRight icon cuando está abierto (para cerrar) -->
		<ChevronRight class="h-5 w-5 transition-transform duration-200" />
	{/if}
</button>
