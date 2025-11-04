<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		'flex flex-col gap-4 rounded-xl border bg-card py-4 text-card-foreground shadow-sm sm:gap-6 sm:py-6',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
