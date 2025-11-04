<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Save, X, MapPin } from 'lucide-svelte';
	import LocationMap from '$lib/components/me/location-map.svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import type { Account } from '$lib/types';
	import { accountSchema } from '$lib/validators';

	interface Props {
		account?: Account;
		onSubmit: (data: Account) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
	}

	let {
		account,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
	}: Props = $props();

	let formData = $state<Account>({
		id: account?.id ?? null,
		code: account?.code ?? '',
		description: account?.description ?? '',
		nameContactor: account?.nameContactor ?? '',
		telephoneContactor: account?.telephoneContactor ?? '',
		mailContactor: account?.mailContactor ?? '',
		latitude: account?.latitude,
		longitude: account?.longitude,
		image: account?.image ?? ''
	});

	let originalData = $state<Account>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);

	const isDirty = $derived(
		formData.code !== originalData.code ||
			formData.description !== originalData.description ||
			formData.nameContactor !== originalData.nameContactor ||
			formData.telephoneContactor !== originalData.telephoneContactor ||
			formData.mailContactor !== originalData.mailContactor ||
			formData.latitude !== originalData.latitude ||
			formData.longitude !== originalData.longitude ||
			formData.image !== originalData.image ||
			imageFile !== null
	);

	// Warn about unsaved changes
	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	function validateForm(): boolean {
		errors = {};

		const result = accountSchema.safeParse(formData);

		if (!result.success) {
			result.error.errors.forEach((error) => {
				const field = error.path[0] as string;
				errors[field] = error.message;
			});
			return false;
		}

		return true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
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
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>{isEdit ? 'Edit Account' : 'Create Account'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit ? 'Update the account information' : 'Fill in the details for the new account'}
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
							placeholder="Enter account code"
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
							placeholder="Enter account description"
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
						label="Account Image"
						maxSize={5}
						existingFileUrl={account?.image}
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
				{isEdit ? 'Save Changes' : 'Create Account'}
			{/if}
		</Button>
	</Card.CardFooter>
</Card.Card>
