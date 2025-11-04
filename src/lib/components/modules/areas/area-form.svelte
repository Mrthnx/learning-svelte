<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Save, X, MapPin } from 'lucide-svelte';
	import LocationMap from '$lib/components/me/location-map.svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import { plantService, type Plant } from '$lib/services/plant.service';
	import {
		isRequired,
		isValidEmail,
		isValidPhone,
		isValidLatitude,
		isValidLongitude,
		validationMessages
	} from '$lib/shared';

	interface Area {
		id?: number | null;
		code?: string;
		description?: string;
		nameContactor?: string;
		telephoneContactor?: string;
		mailContactor?: string;
		order?: number;
		latitude?: number;
		longitude?: number;
		image?: string;
		plant?: {
			id?: number;
			code?: string;
			description?: string;
		};
	}

	interface Props {
		area?: Area;
		onSubmit: (data: Area) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
	}

	let {
		area,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
	}: Props = $props();

	let formData = $state<Area>({
		id: area?.id ?? null,
		code: area?.code ?? '',
		description: area?.description ?? '',
		nameContactor: area?.nameContactor ?? '',
		telephoneContactor: area?.telephoneContactor ?? '',
		mailContactor: area?.mailContactor ?? '',
		order: area?.order ?? 0,
		latitude: area?.latitude,
		longitude: area?.longitude,
		image: area?.image ?? '',
		plant: area?.plant
	});

	let originalData = $state<Area>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);
	let plants: Plant[] = $state([]);
	let selectedPlant = $state<{ value: string; label: string } | undefined>(
		area?.plant ? { value: area.plant.id!.toString(), label: area.plant.code || '' } : undefined
	);

	const isDirty = $derived(
		formData.code !== originalData.code ||
			formData.description !== originalData.description ||
			formData.nameContactor !== originalData.nameContactor ||
			formData.telephoneContactor !== originalData.telephoneContactor ||
			formData.mailContactor !== originalData.mailContactor ||
			formData.order !== originalData.order ||
			formData.latitude !== originalData.latitude ||
			formData.longitude !== originalData.longitude ||
			formData.image !== originalData.image ||
			formData.plant?.id !== originalData.plant?.id ||
			imageFile !== null
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	$effect(() => {
		loadPlants();
	});

	async function loadPlants() {
		try {
			const response = await plantService.getAll({ pageSize: 100 });
			plants = response.rows;
		} catch (error) {
			console.error('Error loading plants:', error);
			toast.error('Failed to load plants');
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

		if (!selectedPlant?.value) {
			errors.plant = validationMessages.required('Plant');
		}

		if (formData.mailContactor && !isValidEmail(formData.mailContactor)) {
			errors.mailContactor = validationMessages.invalidEmail;
		}

		if (formData.telephoneContactor && !isValidPhone(formData.telephoneContactor)) {
			errors.telephoneContactor = validationMessages.invalidPhone;
		}

		if (formData.latitude !== undefined && !isValidLatitude(formData.latitude)) {
			errors.latitude = validationMessages.invalidLatitude;
		}

		if (formData.longitude !== undefined && !isValidLongitude(formData.longitude)) {
			errors.longitude = validationMessages.invalidLongitude;
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const selectedPlantData = plants.find(p => p.id?.toString() === selectedPlant?.value);
		if (selectedPlantData) {
			formData.plant = {
				id: selectedPlantData.id!,
				code: selectedPlantData.code,
				description: selectedPlantData.description
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

	function handlePlantSelect(value: { value: string; label: string } | undefined) {
		selectedPlant = value;
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>{isEdit ? 'Edit Area' : 'Create Area'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit ? 'Update the area information' : 'Fill in the details for the new area'}
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handleSubmit} class="space-y-6">
			<div class="grid gap-6 lg:grid-cols-2">
				<div class="space-y-6">
					<!-- Code -->
					<div class="space-y-2">
						<label for="code" class="text-sm font-medium">
							Code <span class="text-destructive">*</span>
						</label>
						<Input
							id="code"
							bind:value={formData.code}
							placeholder="Enter area code"
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
						<Input
							id="description"
							bind:value={formData.description}
							placeholder="Enter area description"
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

					<!-- Plant Selection -->
					<div class="space-y-2">
						<label for="plant" class="text-sm font-medium">
							Plant <span class="text-destructive">*</span>
						</label>
						<Select.Root onSelectedChange={handlePlantSelect} selected={selectedPlant}>
							<Select.Trigger class={errors.plant ? 'border-destructive' : ''}>
								<Select.Value placeholder="Select a plant" />
							</Select.Trigger>
							<Select.Content>
								{#each plants as plant}
									<Select.Item value={plant.id?.toString() || ''}>
										{plant.code} - {plant.description}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if errors.plant}
							<p class="text-sm text-destructive">{errors.plant}</p>
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

					<!-- Contact Information -->
					<div class="space-y-2">
						<label for="nameContactor" class="text-sm font-medium">Contact Name</label>
						<Input
							id="nameContactor"
							bind:value={formData.nameContactor}
							placeholder="Enter contact name"
							disabled={isSubmitting || isLoading}
						/>
					</div>

					<div class="space-y-2">
						<label for="telephoneContactor" class="text-sm font-medium">Contact Phone</label>
						<Input
							id="telephoneContactor"
							type="tel"
							bind:value={formData.telephoneContactor}
							placeholder="+1 234 567 8900"
							disabled={isSubmitting || isLoading}
							class={errors.telephoneContactor ? 'border-destructive' : ''}
							oninput={() => {
								if (errors.telephoneContactor) validateForm();
							}}
						/>
						{#if errors.telephoneContactor}
							<p class="text-sm text-destructive">{errors.telephoneContactor}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label for="mailContactor" class="text-sm font-medium">Contact Email</label>
						<Input
							id="mailContactor"
							type="email"
							bind:value={formData.mailContactor}
							placeholder="contact@example.com"
							disabled={isSubmitting || isLoading}
							class={errors.mailContactor ? 'border-destructive' : ''}
							oninput={() => {
								if (errors.mailContactor) validateForm();
							}}
						/>
						{#if errors.mailContactor}
							<p class="text-sm text-destructive">{errors.mailContactor}</p>
						{/if}
					</div>

					<!-- Image Upload -->
					<FileUpload
						fileType="image"
						label="Area Image"
						maxSize={5}
						existingFileUrl={area?.image}
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
				{isEdit ? 'Save Changes' : 'Create Area'}
			{/if}
		</Button>
	</Card.CardFooter>
</Card.Card>
