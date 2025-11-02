<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ArrowLeft, Save, MapPin, Plus, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import LocationMap from '$lib/components/me/location-map.svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { accountService } from '$lib/services/account.service';

	let formData = $state({
		id: null as number | null,
		code: '',
		description: '',
		nameContactor: '',
		telephoneContactor: '',
		mailContactor: '',
		latitude: undefined as number | undefined,
		longitude: undefined as number | undefined,
		image: ''
	});

	let imageFile: File | null = $state(null);

	let errors = $state<{ [key: string]: string }>({});
	let isSubmitting = $state(false);
	let showCancelDialog = $state(false);
	let showSuccessDialog = $state(false);
	let successAction: 'create-another' | 'go-to-list' | null = $state(null);

	const isDirty = $derived(
		formData.code !== '' ||
			formData.description !== '' ||
			formData.nameContactor !== '' ||
			formData.telephoneContactor !== '' ||
			formData.mailContactor !== '' ||
			formData.latitude !== undefined ||
			formData.longitude !== undefined ||
			formData.image !== '' ||
			imageFile !== null
	);

	onMount(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isDirty) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	function validateForm(): boolean {
		errors = {};

		if (!formData.code.trim()) {
			errors.code = 'Code is required';
		}

		if (!formData.description.trim()) {
			errors.description = 'Description is required';
		}

		if (formData.mailContactor && formData.mailContactor.trim()) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.mailContactor)) {
				errors.mailContactor = 'Invalid email format';
			}
		}

		if (formData.telephoneContactor && formData.telephoneContactor.trim()) {
			const phoneRegex = /^[\d\s\-+()]+$/;
			if (!phoneRegex.test(formData.telephoneContactor)) {
				errors.telephoneContactor = 'Invalid phone format';
			}
		}

		if (formData.latitude !== undefined && (formData.latitude < -90 || formData.latitude > 90)) {
			errors.latitude = 'Latitude must be between -90 and 90';
		}

		if (
			formData.longitude !== undefined &&
			(formData.longitude < -180 || formData.longitude > 180)
		) {
			errors.longitude = 'Longitude must be between -180 and 180';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('Please fix the errors before submitting');
			return;
		}

		isSubmitting = true;
		try {
			await accountService.create(formData);
			showSuccessDialog = true;
		} catch (error: any) {
			console.error('Error creating account:', error);
			toast.error(error.message || 'Failed to create account');
		} finally {
			isSubmitting = false;
		}
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			// Create Another
			successAction = 'create-another';
			resetForm();
			showSuccessDialog = false;
			toast.success('Ready to create another account');
		} else if (action === 'secondary') {
			// Go to List
			successAction = 'go-to-list';
			showSuccessDialog = false;
			goto('/database-setup/accounts');
		}
	}

	function resetForm() {
		formData = {
			id: null,
			code: '',
			description: '',
			nameContactor: '',
			telephoneContactor: '',
			mailContactor: '',
			latitude: undefined,
			longitude: undefined,
			image: ''
		};
		imageFile = null;
		errors = {};
	}

	function handleCancel() {
		if (isDirty) {
			showCancelDialog = true;
		} else {
			goto('/database-setup/accounts');
		}
	}

	function confirmCancel() {
		goto('/database-setup/accounts');
	}

	function handleLocationChange(event: CustomEvent<{ latitude: number; longitude: number }>) {
		formData.latitude = event.detail.latitude;
		formData.longitude = event.detail.longitude;
	}

	function handleFileChange(event: CustomEvent<{ file: File | null; preview: string | null }>) {
		imageFile = event.detail.file;
		if (event.detail.preview) {
			formData.image = event.detail.preview;
		}
	}

	function handleFileError(event: CustomEvent<{ message: string }>) {
		toast.error(event.detail.message);
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Accounts
		</Button>
		<h1 class="text-3xl font-bold">Create Account</h1>
		<p class="text-muted-foreground">Add a new account to the system</p>
	</div>

	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Account Information</Card.CardTitle>
			<Card.CardDescription>Fill in the details for the new account</Card.CardDescription>
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
								placeholder="e.g. ACC-001"
								required
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
								placeholder="Enter account description"
								rows={4}
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
									on:locationChange={handleLocationChange}
								/>
							</div>
						</div>
					</div>
				</div>
			</form>
		</Card.CardContent>
		<Card.CardFooter class="flex justify-end gap-2">
			<Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting} class="gap-2">
				{#if isSubmitting}
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					></div>
					Creating...
				{:else}
					<Save class="h-4 w-4" />
					Create Account
				{/if}
			</Button>
		</Card.CardFooter>
	</Card.Card>
</div>

<!-- Cancel Confirmation Dialog -->
<AlertModal
	bind:open={showCancelDialog}
	type="warning"
	title="Unsaved Changes"
	description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
	buttons={[
		{ label: 'Continue Editing', action: 'cancel', variant: 'outline' },
		{ label: 'Discard Changes', action: 'confirm', variant: 'destructive' }
	]}
	onAction={(action) => {
		if (action === 'confirm') {
			confirmCancel();
		}
	}}
/>

<!-- Success Dialog -->
<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Account Created Successfully!"
	description={`The account "${formData.code}" has been created successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Create Another', action: 'primary', variant: 'default', icon: Plus },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
