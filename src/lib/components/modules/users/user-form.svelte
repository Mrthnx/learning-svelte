<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Save, X } from 'lucide-svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import PhoneCodeAutocomplete from '$lib/components/me/phonecode-autocomplete.svelte';
	import LanguageAutocomplete from '$lib/components/me/language-autocomplete.svelte';
	import CountryAutocomplete from '$lib/components/me/country-autocomplete.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';
	import PlantModalTable from '../plants/plant-modal-table.svelte';
	import AreaModalTable from '../areas/area-modal-table.svelte';
	import SystemModalTable from '../systems/system-modal-table.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import type { User } from '$lib/types';
	import { type Role } from '$lib/services/role.service';
	import { isRequired, isValidEmail, isValidPhone, validationMessages } from '$lib/shared';

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
		code: user?.code ?? '',
		email: user?.email ?? '',
		name: user?.name ?? '',
		country: user?.country,
		city: user?.city ?? '',
		province: user?.province ?? '',
		address: user?.address ?? '',
		zip: user?.zip ?? '',
		phone: user?.phone ?? '',
		countryPhoneCode: user?.countryPhoneCode ?? '',
		countryCode: user?.countryCode ?? '',
		phoneConfirmed: user?.phoneConfirmed ?? false,
		image: user?.image ?? '',
		passwordValidate: user?.passwordValidate ?? false,
		twoFactorAuth: user?.twoFactorAuth ?? false,
		allowAlarmsSentSms: user?.allowAlarmsSentSms ?? false,
		allowAlarmsSentEmail: user?.allowAlarmsSentEmail ?? false,
		allowCommentAlarmsSentEmail: user?.allowCommentAlarmsSentEmail ?? false,
		allowCommentAlarmsSentSms: user?.allowCommentAlarmsSentSms ?? false,
		languagePreference: user?.languagePreference ?? 'en',
		description: user?.description ?? '',
		isBlocked: user?.isBlocked ?? false,
		imageCompany: user?.imageCompany ?? '',
		nameCompany: user?.nameCompany ?? '',
		addressCompany: user?.addressCompany ?? '',
		footerCompany: user?.footerCompany ?? '',
		company: user?.company,
		role: user?.role,
		account: user?.account,
		plant: user?.plant,
		area: user?.area,
		system: user?.system
	});

	let originalData = $state<User>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);
	let roles = $state<Role[]>(availableRoles);
	let countryValue = $state<number | null>(user?.country ?? null);
	let phoneCode = $state<string | null>(user?.countryPhoneCode || null);
	let languageCode = $state<string | null>(user?.languagePreference || 'en');

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

	// Determine role level to control visibility of account/plant/area/system fields
	const selectedRole = $derived(roles.find((r) => r.id?.toString() === selectedRoleValue));
	const roleLevel = $derived(selectedRole?.level ?? 0);

	// Role levels: 1=SUPERADMIN, 3=ACCOUNT, 4=PLANT, 5=AREA, 6=SYSTEM
	const showAccount = $derived(roleLevel >= 3 && roleLevel <= 6);
	const showPlant = $derived(roleLevel >= 4 && roleLevel <= 6);
	const showArea = $derived(roleLevel >= 5 && roleLevel <= 6);
	const showSystem = $derived(roleLevel === 6);

	const isDirty = $derived(
		formData.code !== originalData.code ||
			formData.name !== originalData.name ||
			formData.email !== originalData.email ||
			formData.country !== originalData.country ||
			formData.city !== originalData.city ||
			formData.province !== originalData.province ||
			formData.address !== originalData.address ||
			formData.zip !== originalData.zip ||
			formData.phone !== originalData.phone ||
			formData.countryPhoneCode !== originalData.countryPhoneCode ||
			formData.description !== originalData.description ||
			formData.isBlocked !== originalData.isBlocked ||
			formData.languagePreference !== originalData.languagePreference ||
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

		if (!isRequired(formData.email)) {
			errors.email = validationMessages.required('Email');
		} else if (!isValidEmail(formData.email)) {
			errors.email = validationMessages.invalidEmail;
		}

		// Validate required hierarchical fields based on role level
		if (showAccount && !accountSearchValue.id) {
			errors.account = validationMessages.required('Account');
		}
		if (showPlant && !plantSearchValue.id) {
			errors.plant = validationMessages.required('Plant');
		}
		if (showArea && !areaSearchValue.id) {
			errors.area = validationMessages.required('Area');
		}
		if (showSystem && !systemSearchValue.id) {
			errors.system = validationMessages.required('System');
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

		// Set or nullify hierarchical fields based on role level
		if (showAccount && accountSearchValue.id) {
			formData.account = {
				id: accountSearchValue.id,
				description: accountSearchValue.description
			};
		} else {
			formData.account = undefined;
		}

		if (showPlant && plantSearchValue.id) {
			formData.plant = {
				id: plantSearchValue.id,
				description: plantSearchValue.description
			};
		} else {
			formData.plant = undefined;
		}

		if (showArea && areaSearchValue.id) {
			formData.area = {
				id: areaSearchValue.id,
				description: areaSearchValue.description
			};
		} else {
			formData.area = undefined;
		}

		if (showSystem && systemSearchValue.id) {
			formData.system = {
				id: systemSearchValue.id,
				description: systemSearchValue.description
			};
		} else {
			formData.system = undefined;
		}

		// Update from autocompletes
		if (countryValue) {
			formData.country = countryValue;
		}
		if (phoneCode) {
			formData.countryPhoneCode = phoneCode;
		}
		if (languageCode) {
			formData.languagePreference = languageCode;
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
					<!-- Role & Hierarchy Section -->
					<div class="space-y-4 rounded-lg border p-4">
						<h3 class="text-sm font-semibold">Role & Organization</h3>

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
						{#if showAccount}
							<div class="space-y-2">
								<label class="text-sm font-medium">
									Account <span class="text-destructive">*</span>
								</label>
								<SearchInput
									bind:value={accountSearchValue}
									placeholder="Select account..."
									width="w-full"
									modalTitle="Search Account"
									modalDescription="Search and select an account."
									modalContent={AccountModalTable}
									modalContentProps={{ onselect: handleAccountSelect }}
								/>
								{#if errors.account}
									<p class="text-sm text-destructive">{errors.account}</p>
								{/if}
							</div>
						{/if}

						<!-- Plant Selection -->
						{#if showPlant}
							<div class="space-y-2">
								<label class="text-sm font-medium">
									Plant <span class="text-destructive">*</span>
								</label>
								<SearchInput
									bind:value={plantSearchValue}
									placeholder="Select plant..."
									width="w-full"
									modalTitle="Search Plant"
									modalDescription="Search and select a plant."
									modalContent={PlantModalTable}
									modalContentProps={{ onselect: handlePlantSelect }}
								/>
								{#if errors.plant}
									<p class="text-sm text-destructive">{errors.plant}</p>
								{/if}
							</div>
						{/if}

						<!-- Area Selection -->
						{#if showArea}
							<div class="space-y-2">
								<label class="text-sm font-medium">
									Area <span class="text-destructive">*</span>
								</label>
								<SearchInput
									bind:value={areaSearchValue}
									placeholder="Select area..."
									width="w-full"
									modalTitle="Search Area"
									modalDescription="Search and select an area."
									modalContent={AreaModalTable}
									modalContentProps={{ onselect: handleAreaSelect }}
								/>
								{#if errors.area}
									<p class="text-sm text-destructive">{errors.area}</p>
								{/if}
							</div>
						{/if}

						<!-- System Selection -->
						{#if showSystem}
							<div class="space-y-2">
								<label class="text-sm font-medium">
									System <span class="text-destructive">*</span>
								</label>
								<SearchInput
									bind:value={systemSearchValue}
									placeholder="Select system..."
									width="w-full"
									modalTitle="Search System"
									modalDescription="Search and select a system."
									modalContent={SystemModalTable}
									modalContentProps={{ onselect: handleSystemSelect }}
								/>
								{#if errors.system}
									<p class="text-sm text-destructive">{errors.system}</p>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Basic Information -->
					<div class="space-y-4 rounded-lg border p-4">
						<h3 class="text-sm font-semibold">Basic Information</h3>

						<!-- Code -->
						<div class="space-y-2">
							<label for="code" class="text-sm font-medium">Code</label>
							<Input
								id="code"
								bind:value={formData.code}
								placeholder="User code"
								disabled={isSubmitting || isLoading}
							/>
						</div>

						<!-- Description -->
						<div class="space-y-2">
							<label for="description" class="text-sm font-medium">Description</label>
							<Input
								id="description"
								bind:value={formData.description}
								placeholder="User description"
								disabled={isSubmitting || isLoading}
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
								placeholder="Enter full name"
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
					</div>

					<!-- Contact Information -->
					<div class="space-y-4 rounded-lg border p-4">
						<h3 class="text-sm font-semibold">Contact Information</h3>

						<!-- Phone Code and Number -->
						<div class="space-y-2">
							<label class="text-sm font-medium">Phone</label>
							<div class="grid grid-cols-[140px_1fr] gap-2">
								<PhoneCodeAutocomplete
									bind:value={phoneCode}
									placeholder="Code"
									disabled={isSubmitting || isLoading}
								/>
								<Input
									id="phone"
									type="tel"
									bind:value={formData.phone}
									placeholder="234 567 8900"
									disabled={isSubmitting || isLoading}
									class={errors.phone ? 'border-destructive' : ''}
									oninput={() => {
										if (errors.phone) validateForm();
									}}
								/>
							</div>
							{#if errors.phone}
								<p class="text-sm text-destructive">{errors.phone}</p>
							{/if}
						</div>
					</div>

					<!-- Address Information -->
					<div class="space-y-4 rounded-lg border p-4">
						<h3 class="text-sm font-semibold">Address</h3>

						<!-- Country -->
						<CountryAutocomplete
							bind:value={countryValue}
							label="Country"
							placeholder="Select country"
							disabled={isSubmitting || isLoading}
						/>

						<!-- City & Province in same row -->
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<label for="city" class="text-sm font-medium">City</label>
								<Input
									id="city"
									bind:value={formData.city}
									placeholder="Enter city"
									disabled={isSubmitting || isLoading}
								/>
							</div>
							<div class="space-y-2">
								<label for="province" class="text-sm font-medium">Province/State</label>
								<Input
									id="province"
									bind:value={formData.province}
									placeholder="Enter province or state"
									disabled={isSubmitting || isLoading}
								/>
							</div>
						</div>

						<!-- Address -->
						<div class="space-y-2">
							<label for="address" class="text-sm font-medium">Address</label>
							<Input
								id="address"
								bind:value={formData.address}
								placeholder="Enter address"
								disabled={isSubmitting || isLoading}
							/>
						</div>

						<div class="space-y-2">
							<label for="zip" class="text-sm font-medium">Zip Code</label>
							<Input
								id="zip"
								bind:value={formData.zip}
								placeholder="Enter zip code"
								disabled={isSubmitting || isLoading}
							/>
						</div>
					</div>
				</div>

				<!-- Right Column -->
				<div class="space-y-4 sm:space-y-6">
					<!-- Settings -->
					<div class="space-y-4 rounded-lg border p-4">
						<h3 class="text-sm font-semibold">Account Settings</h3>

						<div class="flex items-center space-x-2">
							<Checkbox
								id="isBlocked"
								checked={formData.isBlocked}
								onCheckedChange={(checked) => {
									formData.isBlocked = checked === true;
								}}
								disabled={isSubmitting || isLoading}
							/>
							<label
								for="isBlocked"
								class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Blocked User
							</label>
						</div>

						<div class="flex items-center space-x-2">
							<Checkbox
								id="twoFactorAuth"
								checked={formData.twoFactorAuth}
								onCheckedChange={(checked) => {
									formData.twoFactorAuth = checked === true;
								}}
								disabled={isSubmitting || isLoading}
							/>
							<label
								for="twoFactorAuth"
								class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Two Factor Authentication
							</label>
						</div>
					</div>

					<!-- Language & Preferences -->
					<div class="space-y-4 rounded-lg border p-4">
						<h3 class="text-sm font-semibold">Preferences</h3>

						<!-- Language -->
						<LanguageAutocomplete
							bind:value={languageCode}
							label="Language"
							placeholder="Select a language"
							disabled={isSubmitting || isLoading}
						/>

						<!-- Alarm Notifications -->
						<div class="rounded-lg border p-4">
							<h3 class="mb-4 text-sm font-semibold">Alarm Notifications</h3>
							<div class="space-y-4">
								<div class="flex items-center space-x-2">
									<Checkbox
										id="allowAlarmsSentSms"
										checked={formData.allowAlarmsSentSms}
										onCheckedChange={(checked) => {
											formData.allowAlarmsSentSms = checked === true;
										}}
										disabled={isSubmitting || isLoading}
									/>
									<label
										for="allowAlarmsSentSms"
										class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Alarms via SMS
									</label>
								</div>

								<div class="flex items-center space-x-2">
									<Checkbox
										id="allowAlarmsSentEmail"
										checked={formData.allowAlarmsSentEmail}
										onCheckedChange={(checked) => {
											formData.allowAlarmsSentEmail = checked === true;
										}}
										disabled={isSubmitting || isLoading}
									/>
									<label
										for="allowAlarmsSentEmail"
										class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Alarms via Email
									</label>
								</div>

								<div class="flex items-center space-x-2">
									<Checkbox
										id="allowCommentAlarmsSentEmail"
										checked={formData.allowCommentAlarmsSentEmail}
										onCheckedChange={(checked) => {
											formData.allowCommentAlarmsSentEmail = checked === true;
										}}
										disabled={isSubmitting || isLoading}
									/>
									<label
										for="allowCommentAlarmsSentEmail"
										class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Comment Alarms via Email
									</label>
								</div>

								<div class="flex items-center space-x-2">
									<Checkbox
										id="allowCommentAlarmsSentSms"
										checked={formData.allowCommentAlarmsSentSms}
										onCheckedChange={(checked) => {
											formData.allowCommentAlarmsSentSms = checked === true;
										}}
										disabled={isSubmitting || isLoading}
									/>
									<label
										for="allowCommentAlarmsSentSms"
										class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Comment Alarms via SMS
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
