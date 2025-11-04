<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { ComponentType } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		actionLabel?: string;
		actionIcon?: ComponentType;
		onAction?: () => void;
		children?: import('svelte').Snippet;
	}

	let {
		title,
		description,
		actionLabel,
		actionIcon,
		onAction,
		children
	}: Props = $props();
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
	<!-- Title and Description -->
	<div class="space-y-1">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
		{#if description}
			<p class="text-sm text-muted-foreground sm:text-base">{description}</p>
		{/if}
	</div>

	<!-- Action Button or Custom Content -->
	{#if children}
		{@render children()}
	{:else if onAction && actionIcon}
		<Button onclick={onAction} size="default" class="w-full gap-2 sm:w-auto">
			<svelte:component this={actionIcon} class="h-4 w-4" />
			<span class="sm:inline">{actionLabel}</span>
		</Button>
	{/if}
</div>
