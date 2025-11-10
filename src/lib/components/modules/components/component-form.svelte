<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Save, X } from 'lucide-svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AssetModalTable from '../assets/asset-modal-table.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import type { Component, Asset } from '$lib/types';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { onMount } from 'svelte';
	import { isRequired, validationMessages } from '$lib/shared';

	interface Props {
		component?: Component;
		onSubmit: (data: Component) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
	}

	let {
		component,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
	}: Props = $props();

	let formData = $state<Component>({
		id: component?.id ?? null,
		code: component?.code ?? '',
		description: component?.description ?? '',
		image: component?.image ?? '',
		mawoi: component?.mawoi,
		componentType: component?.componentType
	});

	let originalData = $state<Component>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);

	// SearchInput values
	let assetSearchValue = $state<{ id: number | null; description: string; readonly?: boolean }>({
		id: component?.mawoi?.id ?? null,
		description: component?.mawoi?.description || '',
		readonly: false
	});

	const isDirty = $derived(
		formData.code !== originalData.code ||
			formData.description !== originalData.description ||
			formData.image !== originalData.image ||
			formData.mawoi?.id !== originalData.mawoi?.id ||
			imageFile !== null
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	// Auto-initialize with asset based on system hierarchy when creating (not editing)
	onMount(() => {
		if (!isEdit) {
			// For components, we don't auto-initialize asset since it's at the component level
			// But we could consider if the hierarchy store had specific asset info
		}
	});


	function validateForm(): boolean {
		errors = {};

		if (!isRequired(formData.code)) {
			errors.code = validationMessages.required('Code');
		}

		if (!isRequired(formData.description)) {
			errors.description = validationMessages.required('Description');
		}

		if (!assetSearchValue.id) {
			errors.mawoi = validationMessages.required('Asset (Mawoi)');
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Set asset from SearchInput
		if (assetSearchValue.id) {
			formData.mawoi = {
				id: assetSearchValue.id,
				description: assetSearchValue.description
			};
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			originalData = { ...formData };
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleFileChange(
		event: CustomEvent<{ file: File | null; preview: string | null; url: string | null }>
	) {
		imageFile = event.detail.file;
		if (event.detail.url) {
			formData.image = event.detail.url;
		} else if (event.detail.preview) {
			formData.image = event.detail.preview;
		} else {
			formData.image = '';
		}
	}

	function handleFileError(event: CustomEvent<{ message: string }>) {
		toast.error(event.detail.message);
	}

	function handleAssetSelect(asset: Asset) {
		assetSearchValue = {
			id: asset.id!,
			description: asset.description || '',
			readonly: false
		};
		// Note: We don't update hierarchy store for asset selection in components
		// since components are at the bottom of the hierarchy
	}

	function handleAssetClear() {
		assetSearchValue = { id: null, description: '', readonly: false };
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>{isEdit ? 'Edit Component' : 'Create Component'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit ? 'Update the component information' : 'Fill in the details for the new component'}
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Asset (Mawoi) Selection -->
			<div class="space-y-2">
				<label for="mawoi" class="text-sm font-medium">
					Asset (Mawoi) <span class="text-destructive">*</span>
				</label>
				<SearchInput
					bind:value={assetSearchValue}
					placeholder="Select an asset"
					modalTitle="Select Asset"
					modalDescription="Choose an asset from the list below"
					modalContent={AssetModalTable}
					modalContentProps={{ onselect: handleAssetSelect }}
					onclear={handleAssetClear}
					width="w-full"
				/>
				{#if errors.mawoi}
					<p class="text-sm text-destructive">{errors.mawoi}</p>
				{/if}
			</div>

			<!-- Code -->
			<div class="space-y-2">
				<label for="code" class="text-sm font-medium">
					Code <span class="text-destructive">*</span>
				</label>
				<Input
					id="code"
					bind:value={formData.code}
					placeholder="Enter component code"
					disabled={isSubmitting || isLoading}
					class={errors.code ? 'border-destructive' : ''}
					oninput={() => {
						if (errors.code) validateForm();
					}}
				/>
				{#if errors.code}
					<p class="text-sm text-destructive">{errors.code}</p>
				{/if}
			</div>

			<!-- Description -->
			<div class="space-y-2">
				<label for="description" class="text-sm font-medium">
					Description <span class="text-destructive">*</span>
				</label>
				<Textarea
					id="description"
					bind:value={formData.description}
					placeholder="Enter component description"
					rows={4}
					disabled={isSubmitting || isLoading}
					class={errors.description ? 'border-destructive' : ''}
					oninput={() => {
						if (errors.description) validateForm();
					}}
				/>
				{#if errors.description}
					<p class="text-sm text-destructive">{errors.description}</p>
				{/if}
			</div>

			<!-- Image Upload -->
			<FileUpload
				fileType="image"
				label="Component Image"
				maxSize={5}
				existingFileUrl={component?.image}
				disabled={isSubmitting || isLoading}
				on:fileChange={handleFileChange}
				on:error={handleFileError}
			/>
		</form>
	</Card.CardContent>
	<Card.CardFooter class="flex justify-end gap-2">
		<Button variant="outline" onclick={onCancel} disabled={isSubmitting || isLoading} class="gap-2">
			<X class="h-4 w-4" />
			Cancel
		</Button>
		<Button onclick={handleSubmit} disabled={isSubmitting || isLoading} class="gap-2">
			{#if isSubmitting || isLoading}
				<div
					class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
				></div>
				{isEdit ? 'Saving...' : 'Creating...'}
			{:else}
				<Save class="h-4 w-4" />
				{isEdit ? 'Save Changes' : 'Create Component'}
			{/if}
		</Button>
	</Card.CardFooter>
</Card.Card>
