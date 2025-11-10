<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Save, X, MapPin } from 'lucide-svelte';
	import LocationMap from '$lib/components/me/location-map.svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import SystemModalTable from '../systems/system-modal-table.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import type { Asset, System } from '$lib/types';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { onMount } from 'svelte';
	import { isRequired, isValidLatitude, isValidLongitude, validationMessages } from '$lib/shared';

	interface Props {
		asset?: Asset;
		onSubmit: (data: Asset) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
	}

	let {
		asset,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
	}: Props = $props();

	let formData = $state<Asset>({
		id: asset?.id ?? null,
		code: asset?.code ?? '',
		description: asset?.description ?? '',
		latitude: asset?.latitude,
		longitude: asset?.longitude,
		image: asset?.image ?? '',
		rpm: asset?.rpm ?? 0,
		system: asset?.system
	});

	let originalData = $state<Asset>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);

	// SearchInput values
	let systemSearchValue = $state<{ id: number | null; description: string; readonly?: boolean }>({
		id: asset?.system?.id ?? null,
		description: asset?.system?.description || '',
		readonly: false
	});

	const isDirty = $derived(
		formData.code !== originalData.code ||
			formData.description !== originalData.description ||
			formData.latitude !== originalData.latitude ||
			formData.longitude !== originalData.longitude ||
			formData.image !== originalData.image ||
			formData.rpm !== originalData.rpm ||
			formData.system?.id !== originalData.system?.id ||
			imageFile !== null
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	// Auto-initialize hierarchy values from store when creating (not editing)
	onMount(() => {
		if (!isEdit) {
			const hierarchy = $hierarchyStore;

			// Auto-set system if available and not already set
			if (hierarchy.system.id && !systemSearchValue.id) {
				systemSearchValue = {
					id: hierarchy.system.id,
					description: hierarchy.system.description,
					readonly: false
				};
			}
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

		if (!systemSearchValue.id) {
			errors.system = validationMessages.required('System');
		}

		if (!isValidLatitude(formData.latitude)) {
			errors.latitude = validationMessages.invalidLatitude;
		}

		if (!isValidLongitude(formData.longitude)) {
			errors.longitude = validationMessages.invalidLongitude;
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Set system from SearchInput
		if (systemSearchValue.id) {
			formData.system = {
				id: systemSearchValue.id,
				description: systemSearchValue.description
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

	function handleLocationChange(event: CustomEvent<{ latitude: number; longitude: number }>) {
		formData.latitude = event.detail.latitude;
		formData.longitude = event.detail.longitude;
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

	function handleSystemSelect(system: System) {
		systemSearchValue = {
			id: system.id!,
			description: system.description || '',
			readonly: false
		};
		// Update hierarchy store with the selected system
		hierarchyStore.updateSystem(system);
	}

	function handleSystemClear() {
		systemSearchValue = { id: null, description: '', readonly: false };
		hierarchyStore.clearSystem();
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>{isEdit ? 'Edit Asset' : 'Create Asset'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit ? 'Update the asset information' : 'Fill in the details for the new asset'}
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handleSubmit} class="space-y-6">
			<div class="grid gap-6 lg:grid-cols-2">
				<div class="space-y-6">
					<!-- System Selection -->
					<div class="space-y-2">
						<label for="system" class="text-sm font-medium">
							System <span class="text-destructive">*</span>
						</label>
						<SearchInput
							bind:value={systemSearchValue}
							placeholder="Select a system"
							modalTitle="Select System"
							modalDescription="Choose a system from the list below"
							modalContent={SystemModalTable}
							modalContentProps={{ onselect: handleSystemSelect }}
							onclear={handleSystemClear}
							hierarchyLevel="system"
							width="w-full"
						/>
						{#if errors.system}
							<p class="text-sm text-destructive">{errors.system}</p>
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
							placeholder="Enter asset code"
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
							placeholder="Enter asset description"
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

					<!-- RPM Field -->
					<div class="space-y-2">
						<label for="rpm" class="text-sm font-medium">RPM</label>
						<Input
							id="rpm"
							type="number"
							bind:value={formData.rpm}
							placeholder="Revolutions per minute"
							disabled={isSubmitting || isLoading}
						/>
					</div>

					<!-- Image Upload -->
					<FileUpload
						fileType="image"
						label="Asset Image"
						maxSize={5}
						existingFileUrl={asset?.image}
						disabled={isSubmitting || isLoading}
						on:fileChange={handleFileChange}
						on:error={handleFileError}
					/>
				</div>

				<!-- Right Column -->
				<div class="space-y-6">
					<!-- Location Section with Map -->
					<div class="rounded-lg border">
						<div class="border-b p-4">
							<div class="flex items-center gap-2">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<h3 class="text-sm font-semibold">Location</h3>
							</div>
						</div>

						<div class="p-4">
							<div class="mb-4 grid gap-4 sm:grid-cols-2">
								<!-- Latitude -->
								<div class="space-y-2">
									<label for="latitude" class="text-sm font-medium">Latitude</label>
									<Input
										id="latitude"
										type="number"
										step="0.000001"
										bind:value={formData.latitude}
										placeholder="-90 to 90"
										disabled={isSubmitting || isLoading}
										class={errors.latitude ? 'border-destructive' : ''}
										oninput={() => {
											if (errors.latitude) validateForm();
										}}
									/>
									{#if errors.latitude}
										<p class="text-sm text-destructive">{errors.latitude}</p>
									{/if}
								</div>

								<!-- Longitude -->
								<div class="space-y-2">
									<label for="longitude" class="text-sm font-medium">Longitude</label>
									<Input
										id="longitude"
										type="number"
										step="0.000001"
										bind:value={formData.longitude}
										placeholder="-180 to 180"
										disabled={isSubmitting || isLoading}
										class={errors.longitude ? 'border-destructive' : ''}
										oninput={() => {
											if (errors.longitude) validateForm();
										}}
									/>
									{#if errors.longitude}
										<p class="text-sm text-destructive">{errors.longitude}</p>
									{/if}
								</div>
							</div>

							<!-- Map Component -->
							<LocationMap
								latitude={formData.latitude || 0}
								longitude={formData.longitude || 0}
								height="400px"
								disabled={isSubmitting || isLoading}
								on:locationChange={handleLocationChange}
							/>
						</div>
					</div>
				</div>
			</div>
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
				{isEdit ? 'Save Changes' : 'Create Asset'}
			{/if}
		</Button>
	</Card.CardFooter>
</Card.Card>
