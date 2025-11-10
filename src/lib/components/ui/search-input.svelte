<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Search, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { hierarchyStore } from '$lib/store/hierarchy.store';

	interface SearchValue {
		id: number | null;
		description: string;
		readonly?: boolean;
	}

	type HierarchyLevel = 'account' | 'plant' | 'area' | 'system' | 'asset';

	interface Props {
		value?: SearchValue;
		placeholder?: string;
		width?: string;
		modalTitle?: string;
		modalDescription?: string;
		modalContent?: any;
		modalContentProps?: Record<string, any>;
		onclear?: () => void;
		onopenmodal?: () => void;
		onclosemodal?: () => void;
		hierarchyLevel?: HierarchyLevel; // New prop to identify which hierarchy level this input represents
	}

	let {
		value = $bindable({ id: null, description: '', readonly: false }),
		placeholder = 'Search...',
		width = 'max-w-md',
		modalTitle = 'Search',
		modalDescription = 'Select an item from the list below',
		modalContent,
		modalContentProps = {},
		onclear,
		onopenmodal,
		onclosemodal,
		hierarchyLevel
	}: Props = $props();

	let isModalOpen = $state(false);

	// Auto-initialize from hierarchy store if hierarchyLevel is provided and value is empty
	onMount(() => {
		if (hierarchyLevel && hierarchyLevel !== 'asset' && !value.id && !value.description) {
			try {
				let unsubscribe: (() => void) | null = null;
				
				unsubscribe = hierarchyStore.subscribe((hierarchy) => {
					if (!hierarchy) {
						if (unsubscribe) unsubscribe();
						return;
					}
					
					const hierarchyValue = hierarchy[hierarchyLevel as keyof typeof hierarchy];
					if (hierarchyValue && hierarchyValue.id && hierarchyValue.description) {
						value = {
							id: hierarchyValue.id,
							description: hierarchyValue.description,
							readonly: hierarchyValue.readonly || false
						};
						// Unsubscribe after initialization to avoid continuous updates
						if (unsubscribe) unsubscribe();
					}
				});

				// Return cleanup function in case component is destroyed before subscription completes
				return () => {
					if (unsubscribe) unsubscribe();
				};
			} catch (error) {
				console.warn('Error initializing search input from hierarchy store:', error);
			}
		}
	});

	function clearSearch() {
		value = { id: null, description: '', readonly: false };
		onclear?.();
	}

	function openModal() {
		isModalOpen = true;
		onopenmodal?.();
	}

	function closeModal() {
		isModalOpen = false;
		onclosemodal?.();
	}

	// Wrap the onselect callback from modalContentProps to close modal after selection
	const wrappedModalContentProps = $derived({
		...modalContentProps,
		onselect: (item: any) => {
			// Call the original onselect callback
			modalContentProps.onselect?.(item);
			// Close the modal
			closeModal();
		}
	});
</script>

<div class="search-input-container flex items-center {width}">
	<!-- Input group unificado -->
	<div class="relative flex flex-1">
		<!-- Input con bordes redondeados solo a la izquierda -->
		<div class="relative flex-1">
			<Input
				value={value.description}
				{placeholder}
				readonly
				class="h-10 pl-4 {value.readonly
					? 'cursor-default rounded pr-4'
					: 'rounded-r-none border-r-0 pr-9 focus:border-r-0'}"
			/>
			{#if value.description && !value.readonly}
				<button
					type="button"
					class="absolute top-1/2 right-2 z-10 -translate-y-1/2 transform text-gray-400 hover:text-gray-300"
					onclick={clearSearch}
					aria-label="Clear search"
				>
					<X class="h-4 w-4" />
				</button>
			{/if}
		</div>

		{#if !value.readonly}
			<!-- Botón de búsqueda avanzada pegado al input -->
			<Button
				variant="outline"
				size="icon"
				onclick={openModal}
				class="h-10 w-10 rounded-l-none border-l-0 hover:border-l-0 focus:border-l-0"
				title="Advanced search"
			>
				<Search class="h-4 w-4 text-primary" />
			</Button>
		{/if}
	</div>

	<Dialog.Root bind:open={isModalOpen} onOpenChange={closeModal}>
		<Dialog.Content class="w-[95vw] max-w-4xl sm:w-[90vw] md:min-w-[70dvw]">
			<Dialog.Header>
				<Dialog.Title class="text-base sm:text-lg">{modalTitle}</Dialog.Title>
				<Dialog.Description class="text-sm">{modalDescription}</Dialog.Description>
			</Dialog.Header>
			<div class="max-h-[60vh] overflow-x-hidden overflow-y-auto py-4 pr-2 sm:py-6 sm:pr-4">
				{#if modalContent}
					<svelte:component this={modalContent} {...wrappedModalContentProps} />
				{:else}
					<div class="py-10 text-center text-muted-foreground">
						No content provided for this modal
					</div>
				{/if}
			</div>
			<Dialog.Footer>
				<!-- Additional footer buttons can be added here if needed -->
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
