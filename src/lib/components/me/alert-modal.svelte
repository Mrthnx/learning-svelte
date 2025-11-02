<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import {
		CheckCircle2,
		XCircle,
		AlertTriangle,
		Info,
		Trash2,
		Save,
		type Icon
	} from 'lucide-svelte';
	import type { ComponentType } from 'svelte';

	type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';
	type ButtonAction = 'close' | 'confirm' | 'cancel' | 'primary' | 'secondary';

	interface ActionButton {
		label: string;
		action: ButtonAction;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
		icon?: ComponentType<Icon>;
	}

	interface Props {
		open?: boolean;
		type?: AlertType;
		title: string;
		description?: string;
		buttons?: ActionButton[];
		onAction?: (action: ButtonAction) => void;
		icon?: ComponentType<Icon>;
		class?: string;
	}

	let {
		open = $bindable(false),
		type = 'info',
		title,
		description,
		buttons,
		onAction,
		icon,
		class: className = ''
	}: Props = $props();

	// Configuración por tipo de alerta
	const alertConfig = $derived.by(() => {
		const configs = {
			success: {
				icon: CheckCircle2,
				iconClass: 'text-green-600 dark:text-green-400',
				defaultButtons: [
					{ label: 'Close', action: 'close' as ButtonAction, variant: 'default' as const }
				]
			},
			error: {
				icon: XCircle,
				iconClass: 'text-red-600 dark:text-red-400',
				defaultButtons: [
					{ label: 'Close', action: 'close' as ButtonAction, variant: 'default' as const }
				]
			},
			warning: {
				icon: AlertTriangle,
				iconClass: 'text-yellow-600 dark:text-yellow-400',
				defaultButtons: [
					{ label: 'Cancel', action: 'cancel' as ButtonAction, variant: 'outline' as const },
					{ label: 'Continue', action: 'confirm' as ButtonAction, variant: 'default' as const }
				]
			},
			info: {
				icon: Info,
				iconClass: 'text-blue-600 dark:text-blue-400',
				defaultButtons: [
					{ label: 'Close', action: 'close' as ButtonAction, variant: 'default' as const }
				]
			},
			confirm: {
				icon: AlertTriangle,
				iconClass: 'text-orange-600 dark:text-orange-400',
				defaultButtons: [
					{ label: 'Cancel', action: 'cancel' as ButtonAction, variant: 'outline' as const },
					{ label: 'Confirm', action: 'confirm' as ButtonAction, variant: 'destructive' as const }
				]
			}
		};
		return configs[type];
	});

	const displayButtons = $derived(buttons || alertConfig.defaultButtons);
	const displayIcon = $derived(icon || alertConfig.icon);

	function handleAction(action: ButtonAction) {
		if (action === 'close' || action === 'cancel') {
			open = false;
		}
		onAction?.(action);
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			handleAction('close');
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="z-[9999] sm:max-w-md {className}">
		<Dialog.Header>
			<div class="flex items-start gap-4">
				<div class="flex-shrink-0">
					<svelte:component this={displayIcon} class="h-6 w-6 {alertConfig.iconClass}" />
				</div>
				<div class="flex-1">
					<Dialog.Title>{title}</Dialog.Title>
					{#if description}
						<Dialog.Description class="mt-2">{description}</Dialog.Description>
					{/if}
				</div>
			</div>
		</Dialog.Header>

		<Dialog.Footer class="flex-col gap-2 sm:flex-row sm:justify-end">
			{#each displayButtons as button}
				{@const btn = button as ActionButton}
				<Button
					variant={btn.variant || 'default'}
					onclick={() => handleAction(btn.action)}
					class="gap-2"
				>
					{#if btn.icon}
						<svelte:component this={btn.icon} class="h-4 w-4" />
					{/if}
					{btn.label}
				</Button>
			{/each}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
