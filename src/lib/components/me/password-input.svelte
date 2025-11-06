<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { Eye, EyeOff } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> & {
			showPassword?: boolean;
			onToggleVisibility?: () => void;
		}
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		showPassword = $bindable(false),
		onToggleVisibility,
		class: className,
		'data-slot': dataSlot = 'input',
		...restProps
	}: Props = $props();

	function handleToggle() {
		showPassword = !showPassword;
		onToggleVisibility?.();
	}
</script>

<div class="relative w-full">
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			'flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 pr-10 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
			'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
			'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
			className
		)}
		type={showPassword ? 'text' : 'password'}
		bind:value
		{...restProps}
	/>
	<Button
		type="button"
		variant="ghost"
		size="sm"
		class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
		on:click={handleToggle}
		tabindex="-1"
	>
		{#if showPassword}
			<EyeOff class="h-4 w-4 text-muted-foreground" />
			<span class="sr-only">Hide password</span>
		{:else}
			<Eye class="h-4 w-4 text-muted-foreground" />
			<span class="sr-only">Show password</span>
		{/if}
	</Button>
</div>
