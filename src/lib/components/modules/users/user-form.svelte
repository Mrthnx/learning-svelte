<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Save, X } from 'lucide-svelte';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import { accountService, type Account } from '$lib/services/account.service';
	import { roleService, type Role } from '$lib/services/role.service';
	import {
		isRequired,
		isValidEmail,
		isValidPhone,
		validationMessages
	} from '$lib/shared';

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
	}

	let {
		user,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
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
		role: user?.role
	});

	let originalData = $state<User>({ ...formData });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageFile: File | null = $state(null);
	let accounts: Account[] = $state([]);
	let roles: Role[] = $state([]);
	let selectedAccount = $state<{ value: string; label: string } | undefined>(
		user?.account ? { value: user.account.id!.toString(), label: user.account.code || '' } : undefined
	);
	let selectedRole = $state<{ value: string; label: string } | undefined>(
		user?.role ? { value: user.role.id!.toString(), label: user.role.code || '' } : undefined
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
			formData.role?.id !== originalData.role?.id ||
			imageFile !== null
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	$effect(() => {
		loadAccounts();
		loadRoles();
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

	async function loadRoles() {
		try {
			const response = await roleService.getAll({ pageSize: 100 });
			roles = response.rows;
		} catch (error) {
			console.error('Error loading roles:', error);
			toast.error('Failed to load roles');
		}
	}

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

		if (!selectedAccount?.value) {
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

		const selectedAccountData = accounts.find(acc => acc.id?.toString() === selectedAccount?.value);
		if (selectedAccountData) {
			formData.account = {
				id: selectedAccountData.id!,
				code: selectedAccountData.code,
				description: selectedAccountData.description
			};
		}

		const selectedRoleData = roles.find(r => r.id?.toString() === selectedRole?.value);
		if (selectedRoleData) {
			formData.role = {
				id: selectedRoleData.id!,
				code: selectedRoleData.code,
				description: selectedRoleData.description
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

	function handleAccountSelect(value: { value: string; label: string } | undefined) {
		selectedAccount = value;
	}

	function handleRoleSelect(value: { value: string; label: string } | undefined) {
		selectedRole = value;
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
		<form onsubmit={handleSubmit} class="space-y-6">
			<div class="grid gap-6 lg:grid-cols-2">
				<div class="space-y-6">
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

					<!-- Role Selection -->
					<div class="space-y-2">
						<label for="role" class="text-sm font-medium">Role</label>
						<Select.Root onSelectedChange={handleRoleSelect} selected={selectedRole}>
							<Select.Trigger>
								<Select.Value placeholder="Select a role" />
							</Select.Trigger>
							<Select.Content>
								{#each roles as role}
									<Select.Item value={role.id?.toString() || ''}>
										{role.code} - {role.description}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
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
				<div class="space-y-6">
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
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
