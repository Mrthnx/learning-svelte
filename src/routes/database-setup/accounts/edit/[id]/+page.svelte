<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ArrowLeft, Save, Trash2, MapPin, List, Edit } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import LocationMap from '$lib/components/me/location-map.svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { accountService } from '$lib/services/account.service';

	const id = $derived($page.params.id);

	let formData = $state({
		id: null as number | null,
		code: '',
		description: '',
		nameContactor: '' as string | undefined,
		telephoneContactor: '' as string | undefined,
		mailContactor: '' as string | undefined,
		latitude: undefined as number | undefined,
		longitude: undefined as number | undefined,
		image: '' as string | undefined
	});

	let originalData = $state({
		id: null as number | null,
		code: '',
		description: '',
		nameContactor: '' as string | undefined,
		telephoneContactor: '' as string | undefined,
		mailContactor: '' as string | undefined,
		latitude: undefined as number | undefined,
		longitude: undefined as number | undefined,
		image: '' as string | undefined
	});

	let errors = $state<{ [key: string]: string }>({});
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let isDeleting = $state(false);
	let showCancelDialog = $state(false);
	let showDeleteDialog = $state(false);
	let showSuccessDialog = $state(false);
	let notFound = $state(false);
	let imageFile: File | null = $state(null);
	let existingImageUrl = $state('');

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

	onMount(() => {
		const loadData = async () => {
			try {
				const data = await accountService.getById(Number(id));
				formData = {
					id: data.id,
					code: data.code,
					description: data.description,
					nameContactor: data.nameContactor || '',
					telephoneContactor: data.telephoneContactor || '',
					mailContactor: data.mailContactor || '',
					latitude: data.latitude,
					longitude: data.longitude,
					image: data.image || ''
				} as any;
				originalData = { ...formData } as any;

				if (data.image) {
					existingImageUrl = data.image;
				}
			} catch (error: any) {
				console.error('Error loading account:', error);
				toast.error(error.message || 'Failed to load account');
				notFound = true;
			} finally {
				isLoading = false;
			}
		};

		loadData();

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

		if (!formData.code?.trim()) {
			errors.code = 'Code is required';
		}

		if (!formData.description?.trim()) {
			errors.description = 'Description is required';
		}

		if (formData.mailContactor && formData.mailContactor.trim()) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.mailContactor)) {
				errors.mailContactor = 'Invalid email format';
			}
		}

		if (formData.telephoneContactor && formData.telephoneContactor.trim()) {
			const phoneRegex = /^[\d\s\-\+\(\)]+$/;
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
			await accountService.update(Number(id), formData);
			originalData = { ...formData };
			showSuccessDialog = true;
		} catch (error: any) {
			console.error('Error updating account:', error);
			toast.error(error.message || 'Failed to update account');
		} finally {
			isSubmitting = false;
		}
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			// Keep Editing
			showSuccessDialog = false;
			toast.success('You can continue editing');
		} else if (action === 'secondary') {
			// Go to List
			showSuccessDialog = false;
			goto('/database-setup/accounts');
		}
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

	function handleDeleteClick() {
		showDeleteDialog = true;
	}

	async function confirmDelete() {
		isDeleting = true;
		try {
			await accountService.delete(Number(id));
			toast.success(`Account "${formData.code}" deleted successfully`);
			showDeleteDialog = false;
			goto('/database-setup/accounts');
		} catch (error: any) {
			console.error('Error deleting account:', error);
			toast.error(error.message || 'Failed to delete account');
		} finally {
			isDeleting = false;
		}
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
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold">Edit Account</h1>
				<p class="text-muted-foreground">Update account information (ID: {id})</p>
			</div>
			{#if !isLoading && !notFound}
				<Button variant="destructive" onclick={handleDeleteClick} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete
				</Button>
			{/if}
		</div>
	</div>

	{#if isLoading}
		<Card.Card>
			<Card.CardContent class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4">
					<div
						class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
					></div>
					<p class="text-sm text-muted-foreground">Loading account...</p>
				</div>
			</Card.CardContent>
		</Card.Card>
	{:else if notFound}
		<Card.Card>
			<Card.CardContent class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4 text-center">
					<div class="rounded-full bg-destructive/10 p-4">
						<Trash2 class="h-8 w-8 text-destructive" />
					</div>
					<div>
						<h3 class="mb-2 text-lg font-semibold">Account Not Found</h3>
						<p class="text-sm text-muted-foreground">
							The account you're looking for doesn't exist or has been deleted.
						</p>
					</div>
					<Button onclick={() => goto('/database-setup/accounts')} class="gap-2">
						<ArrowLeft class="h-4 w-4" />
						Back to Accounts
					</Button>
				</div>
			</Card.CardContent>
		</Card.Card>
	{:else}
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>
					Account Information
					{#if isDirty}
						<span class="ml-2 text-sm font-normal text-muted-foreground">(unsaved changes)</span>
					{/if}
				</Card.CardTitle>
				<Card.CardDescription>Update the account details</Card.CardDescription>
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
								existingFileUrl={existingImageUrl}
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
				<Button onclick={handleSubmit} disabled={isSubmitting || !isDirty} class="gap-2">
					{#if isSubmitting}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
						Saving...
					{:else}
						<Save class="h-4 w-4" />
						Save Changes
					{/if}
				</Button>
			</Card.CardFooter>
		</Card.Card>
	{/if}
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

<!-- Delete Confirmation Dialog -->
<AlertModal
	bind:open={showDeleteDialog}
	type="confirm"
	title="Delete Account"
	description={`Are you sure you want to delete "${formData.code || formData.description}"? This action cannot be undone.`}
	buttons={[
		{ label: 'Cancel', action: 'cancel', variant: 'outline' },
		{
			label: isDeleting ? 'Deleting...' : 'Delete Account',
			action: 'confirm',
			variant: 'destructive',
			icon: Trash2
		}
	]}
	onAction={(action) => {
		if (action === 'confirm') {
			confirmDelete();
		}
	}}
/>

<!-- Success Dialog -->
<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Account Updated Successfully!"
	description={`The account "${formData.code}" has been updated successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Keep Editing', action: 'primary', variant: 'default', icon: Edit },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
