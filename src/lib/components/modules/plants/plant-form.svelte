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
	import type { Plant, Account } from '$lib/types';
	import { accountService } from '$lib/services/account.service';
	import {
		isRequired,
		isValidEmail,
		isValidPhone,
		isValidLatitude,
		isValidLongitude,
		validationMessages
	} from '$lib/shared';

	interface Props {
		plant?: Plant;
		onSubmit: (data: Plant) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
	}

	let {
		plant,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
	}: Props = $props();

	let formData = $state<Plant>({
		id: plant?.id ?? null,
		code: plant?.code ?? '',
		description: plant?.description ?? '',
		nameContactor: plant?.nameContactor ?? '',
		telephoneContactor: plant?.telephoneContactor ?? '',
		mailContactor: plant?.mailContactor ?? '',
		order: plant?.order ?? 0,
		latitude: plant?.latitude,
		longitude: plant?.longitude,
		image: plant?.image ?? '',
		account: plant?.account
	});

	let originalData = $state<Plant>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);
	let accounts: Account[] = $state([]);
	let selectedAccount = $state<{ value: string; label: string } | undefined>(
		plant?.account
			? { value: plant.account.id!.toString(), label: plant.account.code || '' }
			: undefined
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
			formData.account?.id !== originalData.account?.id ||
			imageFile !== null
	);

	// Warn about unsaved changes
	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	// Load accounts on mount
	$effect(() => {
		loadAccounts();
	});

	async function loadAccounts() {
		try {
			const response = await accountService.getAll({ pageSize: 100 });
			accounts = response.rows;
		} catch (error) {
			console.error('Error loading accounts:', error);
			toast.error('Failed to load accounts');
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

		if (!selectedAccount?.value) {
			errors.account = validationMessages.required('Account');
		}

		if (formData.mailContactor && !isValidEmail(formData.mailContactor)) {
			errors.mailContactor = validationMessages.invalidEmail;
		}

		if (formData.telephoneContactor && !isValidPhone(formData.telephoneContactor)) {
			errors.telephoneContactor = validationMessages.invalidPhone;
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

		// Set account from selection
		const selectedAccountData = accounts.find(
			(acc) => acc.id?.toString() === selectedAccount?.value
		);
		if (selectedAccountData) {
			formData.account = {
				id: selectedAccountData.id!,
				code: selectedAccountData.code,
				description: selectedAccountData.description
			};
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			// Update original data after successful submit
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
		// Use the uploaded URL if available, otherwise use preview for display
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

	function handleAccountSelect(value: { value: string; label: string } | undefined) {
		selectedAccount = value;
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>{isEdit ? 'Edit Plant' : 'Create Plant'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit ? 'Update the plant information' : 'Fill in the details for the new plant'}
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Grid Layout: 2 columns -->
			<div class="grid gap-6 lg:grid-cols-2">
				<!-- Left Column -->
				<div class="space-y-6">
					<!-- Code -->
					<div class="space-y-2">
						<label for="code" class="text-sm font-medium">
							Code <span class="text-destructive">*</span>
						</label>
						<Input
							id="code"
							bind:value={formData.code}
							placeholder="Enter plant code"
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
							placeholder="Enter plant description"
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

					<!-- Account Selection -->
					<div class="space-y-2">
						<label for="account" class="text-sm font-medium">
							Account <span class="text-destructive">*</span>
						</label>
						<Select.Root onSelectedChange={handleAccountSelect} selected={selectedAccount}>
							<Select.Trigger class={errors.account ? 'border-destructive' : ''}>
								<Select.Value placeholder="Select an account" />
							</Select.Trigger>
							<Select.Content>
								{#each accounts as account}
									<Select.Item value={account.id?.toString() || ''}>
										{account.code} - {account.description}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if errors.account}
							<p class="text-sm text-destructive">{errors.account}</p>
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

					<!-- Contact Information Section -->
					<div class="rounded-lg border p-4">
						<h3 class="mb-4 text-sm font-semibold">Contact Information</h3>
						<div class="space-y-4">
							<!-- Contact Name -->
							<div class="space-y-2">
								<label for="nameContactor" class="text-sm font-medium">Contact Person</label>
								<Input
									id="nameContactor"
									bind:value={formData.nameContactor}
									placeholder="Enter contact person name"
									disabled={isSubmitting || isLoading}
								/>
							</div>

							<!-- Phone -->
							<div class="space-y-2">
								<label for="telephoneContactor" class="text-sm font-medium">Phone</label>
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

							<!-- Email -->
							<div class="space-y-2">
								<label for="mailContactor" class="text-sm font-medium">Email</label>
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
						</div>
					</div>

					<!-- Image Upload -->
					<FileUpload
						fileType="image"
						label="Plant Image"
						maxSize={5}
						existingFileUrl={plant?.image}
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
				{isEdit ? 'Save Changes' : 'Create Plant'}
			{/if}
		</Button>
	</Card.CardFooter>
</Card.Card>
