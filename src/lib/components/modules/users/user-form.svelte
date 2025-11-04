<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Save, X } from 'lucide-svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';
	import PlantModalTable from '../plants/plant-modal-table.svelte';
	import AreaModalTable from '../areas/area-modal-table.svelte';
	import SystemModalTable from '../systems/system-modal-table.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import { type Account } from '$lib/services/account.service';
	import { type Plant } from '$lib/services/plant.service';
	import { type Area } from '$lib/services/area.service';
	import { type System } from '$lib/services/system.service';
	import { type Role } from '$lib/services/role.service';
	import { isRequired, isValidEmail, isValidPhone, validationMessages } from '$lib/shared';

	interface User {
		id?: number | null;
		name?: string;
		lastName?: string;
		email?: string;
		image?: string;
		active?: boolean;
		phone?: string;
		dni?: string;
		notifyWhatsapp?: boolean;
		notifyEmail?: boolean;
		language?: string;
		account?: {
			id?: number;
			code?: string;
			description?: string;
		};
		plant?: {
			id?: number;
			code?: string;
			description?: string;
		};
		area?: {
			id?: number;
			code?: string;
			description?: string;
		};
		system?: {
			id?: number;
			code?: string;
			description?: string;
		};
		role?: {
			id?: number;
			code?: string;
			description?: string;
		};
	}

	interface Props {
		user?: User;
		onSubmit: (data: User) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
		availableRoles?: Role[];
	}

	let {
		user,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true,
		availableRoles = []
	}: Props = $props();

	let formData = $state<User>({
		id: user?.id ?? null,
		name: user?.name ?? '',
		lastName: user?.lastName ?? '',
		email: user?.email ?? '',
		image: user?.image ?? '',
		active: user?.active ?? true,
		phone: user?.phone ?? '',
		dni: user?.dni ?? '',
		notifyWhatsapp: user?.notifyWhatsapp ?? false,
		notifyEmail: user?.notifyEmail ?? false,
		language: user?.language ?? 'en',
		account: user?.account,
		plant: user?.plant,
		area: user?.area,
		system: user?.system,
		role: user?.role
	});

	let originalData = $state<User>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);
	let roles = $state<Role[]>(availableRoles);

	// SearchInput values
	let accountSearchValue = $state<{ id: number | null; description: string; readonly?: boolean }>({
		id: user?.account?.id ?? null,
		description: user?.account?.description || '',
		readonly: false
	});
	let plantSearchValue = $state<{ id: number | null; description: string; readonly?: boolean }>({
		id: user?.plant?.id ?? null,
		description: user?.plant?.description || '',
		readonly: false
	});
	let areaSearchValue = $state<{ id: number | null; description: string; readonly?: boolean }>({
		id: user?.area?.id ?? null,
		description: user?.area?.description || '',
		readonly: false
	});
	let systemSearchValue = $state<{ id: number | null; description: string; readonly?: boolean }>({
		id: user?.system?.id ?? null,
		description: user?.system?.description || '',
		readonly: false
	});

	// Role selection
	let selectedRoleValue = $state(user?.role?.id?.toString() || '');

	const selectedRoleTriggerContent = $derived(
		roles.find((r) => r.id?.toString() === selectedRoleValue)?.name || 'Select a role'
	);

	const isDirty = $derived(
		formData.name !== originalData.name ||
			formData.lastName !== originalData.lastName ||
			formData.email !== originalData.email ||
			formData.phone !== originalData.phone ||
			formData.dni !== originalData.dni ||
			formData.active !== originalData.active ||
			formData.notifyWhatsapp !== originalData.notifyWhatsapp ||
			formData.notifyEmail !== originalData.notifyEmail ||
			formData.language !== originalData.language ||
			formData.image !== originalData.image ||
			formData.account?.id !== originalData.account?.id ||
			formData.plant?.id !== originalData.plant?.id ||
			formData.area?.id !== originalData.area?.id ||
			formData.system?.id !== originalData.system?.id ||
			selectedRoleValue !== (originalData.role?.id?.toString() || '') ||
			imageFile !== null
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	// Update roles when availableRoles prop changes
	$effect(() => {
		roles = availableRoles;
	});

	function validateForm(): boolean {
		errors = {};

		if (!isRequired(formData.name)) {
			errors.name = validationMessages.required('Name');
		}

		if (!isRequired(formData.lastName)) {
			errors.lastName = validationMessages.required('Last Name');
		}

		if (!isRequired(formData.email)) {
			errors.email = validationMessages.required('Email');
		} else if (!isValidEmail(formData.email)) {
			errors.email = validationMessages.invalidEmail;
		}

		if (!accountSearchValue.id) {
			errors.account = validationMessages.required('Account');
		}

		if (formData.phone && !isValidPhone(formData.phone)) {
			errors.phone = validationMessages.invalidPhone;
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		if (accountSearchValue.id) {
			formData.account = {
				id: accountSearchValue.id,
				description: accountSearchValue.description
			};
		}

		if (plantSearchValue.id) {
			formData.plant = {
				id: plantSearchValue.id,
				description: plantSearchValue.description
			};
		}

		if (areaSearchValue.id) {
			formData.area = {
				id: areaSearchValue.id,
				description: areaSearchValue.description
			};
		}

		if (systemSearchValue.id) {
			formData.system = {
				id: systemSearchValue.id,
				description: systemSearchValue.description
			};
		}

		// Set role if selected
		if (selectedRoleValue) {
			const selectedRoleData = roles.find((r) => r.id?.toString() === selectedRoleValue);
			if (selectedRoleData) {
				formData.role = {
					id: selectedRoleData.id!,
					code: selectedRoleData.code,
					description: selectedRoleData.description
				};
			}
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

	function handleAccountSelect(account: Account) {
		accountSearchValue = {
			id: account.id ?? null,
			description: account.description || '',
			readonly: false
		};
		if (errors.account) {
			delete errors.account;
		}
	}

	function handlePlantSelect(plant: Plant) {
		plantSearchValue = {
			id: plant.id ?? null,
			description: plant.description || '',
			readonly: false
		};
	}

	function handleAreaSelect(area: Area) {
		areaSearchValue = {
			id: area.id ?? null,
			description: area.description || '',
			readonly: false
		};
	}

	function handleSystemSelect(system: System) {
		systemSearchValue = {
			id: system.id ?? null,
			description: system.description || '',
			readonly: false
		};
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>{isEdit ? 'Edit User' : 'Create User'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit ? 'Update the user information' : 'Fill in the details for the new user'}
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handleSubmit} class="space-y-4 sm:space-y-6">
			<div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
				<div class="space-y-4 sm:space-y-6">
					<!-- Role Selection -->
					<div class="space-y-2">
						<label for="role" class="text-sm font-medium">Role</label>
						<Select.Root type="single" name="role" bind:value={selectedRoleValue}>
							<Select.Trigger class="w-full" disabled={isSubmitting || isLoading}>
								{selectedRoleTriggerContent}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Label>Roles</Select.Label>
									{#each roles as role (role.id)}
										<Select.Item value={role.id?.toString() || ''} label={role.description || ''}>
											{role.name}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Account Selection -->
					<div class="space-y-2">
						<label class="text-sm font-medium">
							Account <span class="text-destructive">*</span>
						</label>
						<SearchInput
							bind:value={accountSearchValue}
							placeholder="Select account..."
							width="w-full"
							modalTitle="Search Account"
							modalDescription="Search and select an account. Double-click to select."
							modalContent={AccountModalTable}
							modalContentProps={{ onselect: handleAccountSelect }}
						/>
						{#if errors.account}
							<p class="text-sm text-destructive">{errors.account}</p>
						{/if}
					</div>

					<!-- Plant Selection -->
					<div class="space-y-2">
						<label class="text-sm font-medium">Plant</label>
						<SearchInput
							bind:value={plantSearchValue}
							placeholder="Select plant..."
							width="w-full"
							modalTitle="Search Plant"
							modalDescription="Search and select a plant. Double-click to select."
							modalContent={PlantModalTable}
							modalContentProps={{ onselect: handlePlantSelect }}
						/>
					</div>

					<!-- Area Selection -->
					<div class="space-y-2">
						<label class="text-sm font-medium">Area</label>
						<SearchInput
							bind:value={areaSearchValue}
							placeholder="Select area..."
							width="w-full"
							modalTitle="Search Area"
							modalDescription="Search and select an area. Double-click to select."
							modalContent={AreaModalTable}
							modalContentProps={{ onselect: handleAreaSelect }}
						/>
					</div>

					<!-- System Selection -->
					<div class="space-y-2">
						<label class="text-sm font-medium">System</label>
						<SearchInput
							bind:value={systemSearchValue}
							placeholder="Select system..."
							width="w-full"
							modalTitle="Search System"
							modalDescription="Search and select a system. Double-click to select."
							modalContent={SystemModalTable}
							modalContentProps={{ onselect: handleSystemSelect }}
						/>
					</div>

					<!-- Name -->
					<div class="space-y-2">
						<label for="name" class="text-sm font-medium">
							Name <span class="text-destructive">*</span>
						</label>
						<Input
							id="name"
							bind:value={formData.name}
							placeholder="Enter first name"
							disabled={isSubmitting || isLoading}
							class={errors.name ? 'border-destructive' : ''}
							oninput={() => {
								if (errors.name) validateForm();
							}}
						/>
						{#if errors.name}
							<p class="text-sm text-destructive">{errors.name}</p>
						{/if}
					</div>

					<!-- Last Name -->
					<div class="space-y-2">
						<label for="lastName" class="text-sm font-medium">
							Last Name <span class="text-destructive">*</span>
						</label>
						<Input
							id="lastName"
							bind:value={formData.lastName}
							placeholder="Enter last name"
							disabled={isSubmitting || isLoading}
							class={errors.lastName ? 'border-destructive' : ''}
							oninput={() => {
								if (errors.lastName) validateForm();
							}}
						/>
						{#if errors.lastName}
							<p class="text-sm text-destructive">{errors.lastName}</p>
						{/if}
					</div>

					<!-- Email -->
					<div class="space-y-2">
						<label for="email" class="text-sm font-medium">
							Email <span class="text-destructive">*</span>
						</label>
						<Input
							id="email"
							type="email"
							bind:value={formData.email}
							placeholder="user@example.com"
							disabled={isSubmitting || isLoading}
							class={errors.email ? 'border-destructive' : ''}
							oninput={() => {
								if (errors.email) validateForm();
							}}
						/>
						{#if errors.email}
							<p class="text-sm text-destructive">{errors.email}</p>
						{/if}
					</div>

					<!-- Phone -->
					<div class="space-y-2">
						<label for="phone" class="text-sm font-medium">Phone</label>
						<Input
							id="phone"
							type="tel"
							bind:value={formData.phone}
							placeholder="+1 234 567 8900"
							disabled={isSubmitting || isLoading}
							class={errors.phone ? 'border-destructive' : ''}
							oninput={() => {
								if (errors.phone) validateForm();
							}}
						/>
						{#if errors.phone}
							<p class="text-sm text-destructive">{errors.phone}</p>
						{/if}
					</div>

					<!-- DNI -->
					<div class="space-y-2">
						<label for="dni" class="text-sm font-medium">DNI</label>
						<Input
							id="dni"
							bind:value={formData.dni}
							placeholder="Enter DNI/ID number"
							disabled={isSubmitting || isLoading}
						/>
					</div>
				</div>

				<!-- Right Column -->
				<div class="space-y-4 sm:space-y-6">
					<!-- Active Status -->
					<div class="flex items-center space-x-2">
						<Checkbox
							id="active"
							checked={formData.active}
							onCheckedChange={(checked) => {
								formData.active = checked === true;
							}}
							disabled={isSubmitting || isLoading}
						/>
						<label
							for="active"
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Active User
						</label>
					</div>

					<!-- Language -->
					<div class="space-y-2">
						<label for="language" class="text-sm font-medium">Language</label>
						<Input
							id="language"
							bind:value={formData.language}
							placeholder="en, es, fr, etc."
							disabled={isSubmitting || isLoading}
						/>
					</div>

					<!-- Notification Preferences -->
					<div class="rounded-lg border p-4">
						<h3 class="mb-4 text-sm font-semibold">Notification Preferences</h3>
						<div class="space-y-4">
							<div class="flex items-center space-x-2">
								<Checkbox
									id="notifyWhatsapp"
									checked={formData.notifyWhatsapp}
									onCheckedChange={(checked) => {
										formData.notifyWhatsapp = checked === true;
									}}
									disabled={isSubmitting || isLoading}
								/>
								<label
									for="notifyWhatsapp"
									class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Notify via WhatsApp
								</label>
							</div>

							<div class="flex items-center space-x-2">
								<Checkbox
									id="notifyEmail"
									checked={formData.notifyEmail}
									onCheckedChange={(checked) => {
										formData.notifyEmail = checked === true;
									}}
									disabled={isSubmitting || isLoading}
								/>
								<label
									for="notifyEmail"
									class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Notify via Email
								</label>
							</div>
						</div>
					</div>

					<!-- Image Upload -->
					<FileUpload
						fileType="image"
						label="User Image"
						maxSize={5}
						existingFileUrl={user?.image}
						disabled={isSubmitting || isLoading}
						on:fileChange={handleFileChange}
						on:error={handleFileError}
					/>
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
				{isEdit ? 'Save Changes' : 'Create User'}
			{/if}
		</Button>
	</Card.CardFooter>
</Card.Card>
