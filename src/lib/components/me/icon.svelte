<script lang="ts">
	import type { ComponentType } from 'svelte';

	interface Props {
		name: 'menu' | 'close' | 'logo' | 'chevron-right' | 'archive';
		class?: string;
	}

	let { name, class: className = '' }: Props = $props();

	const icons = {
		menu: 'M4 6h16M4 12h16M4 18h16',
		close: 'M6 18L18 6M6 6l12 12',
		logo: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3',
		'chevron-right': 'M9 5l7 7-7 7',
		archive:
			'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
	};

	const basePath = icons[name];
</script>

<svg
	class={className}
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	stroke="currentColor"
>
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={basePath} />
	{#if name === 'logo'}
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12 16a4 4 0 100-8 4 4 0 000 8z"
		/>
	{/if}
</svg>
