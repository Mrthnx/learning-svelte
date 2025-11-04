<script lang="ts">
	import { Menu, X } from 'lucide-svelte';

	interface Props {
		isdraweropen?: boolean;
	}

	let { isdraweropen = $bindable(false) }: Props = $props();

	function toggledrawer() {
		isdraweropen = !isdraweropen;
	}
</script>

<!-- FAB - Solo visible en móvil -->
<button
	onclick={toggledrawer}
	class="fixed bottom-4 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-offset-background transition-all duration-300 hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-ring hover:ring-offset-2 active:scale-95 md:hidden"
	aria-label={isdraweropen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
	type="button"
>
	{#if !isdraweropen}
		<!-- Menu icon cuando está cerrado -->
		<Menu class="h-6 w-6 transition-transform duration-200" />
	{:else}
		<!-- X icon cuando está abierto -->
		<X class="h-6 w-6 rotate-90 transition-transform duration-200" />
	{/if}
</button>
