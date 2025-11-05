<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Save, X } from 'lucide-svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import type { Component, Asset } from '$lib/types';
	import { assetService } from '$lib/services/asset.service';
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
		order: component?.order ?? 0,
		image: component?.image ?? '',
		mawoi: component?.mawoi,
		componentType: component?.componentType
	});

	let originalData = $state<Component>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);
	let assets: Asset[] = $state([]);
	let selectedAsset = $state<{ value: string; label: string } | undefined>(
		component?.mawoi
			? { value: component.mawoi.id!.toString(), label: component.mawoi.code || '' }
			: undefined
	);

	const isDirty = $derived(
		formData.code !== originalData.code ||
			formData.description !== originalData.description ||
			formData.order !== originalData.order ||
			formData.image !== originalData.image ||
			formData.mawoi?.id !== originalData.mawoi?.id ||
			imageFile !== null
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	$effect(() => {
		loadAssets();
	});

	async function loadAssets() {
		try {
			const response = await assetService.getAll({ pageSize: 100 });
			assets = response.rows;
		} catch (error) {
			console.error('Error loading assets:', error);
			toast.error('Failed to load assets');
		}
	}

	function validateForm(): boolean {
		errors = {};

		if (!isRequired(formData.code)) {
			errors.code = validationMessages.required('Code');
		}

		if (!isRequired(formData.description)) {
			errors.description = validationMessages.required('Description');
		}

		if (!selectedAsset?.value) {
			errors.mawoi = validationMessages.required('Asset (Mawoi)');
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const selectedAssetData = assets.find((a) => a.id?.toString() === selectedAsset?.value);
		if (selectedAssetData) {
			formData.mawoi = {
				id: selectedAssetData.id!,
				code: selectedAssetData.code,
				description: selectedAssetData.description
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

	function handleAssetSelect(value: { value: string; label: string } | undefined) {
		selectedAsset = value;
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
				<Select.Root onSelectedChange={handleAssetSelect} selected={selectedAsset}>
					<Select.Trigger class={errors.mawoi ? 'border-destructive' : ''}>
						<Select.Value placeholder="Select an asset" />
					</Select.Trigger>
					<Select.Content>
						{#each assets as asset (asset.id)}
							<Select.Item value={asset.id?.toString() || ''}>
								{asset.code} - {asset.description}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
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

			<!-- Order -->
			<div class="space-y-2">
				<label for="order" class="text-sm font-medium">Order</label>
				<Input
					id="order"
					type="number"
					bind:value={formData.order}
					placeholder="Display order"
					disabled={isSubmitting || isLoading}
				/>
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
