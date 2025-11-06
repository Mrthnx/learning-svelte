<script lang="ts" module>
	import { z } from 'zod/v4';

	export const formSchema = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().email('Invalid email address'),
		phone: z.string().optional(),
		countryPhoneCode: z.string().optional(),
		address: z.string().optional(),
		country: z.string().optional(),
		city: z.string().optional(),
		province: z.string().optional(),
		zip: z.string().optional(),
		languagePreference: z.string().optional(),
		allowAlarmsSentSms: z.boolean().optional(),
		allowAlarmsSentEmail: z.boolean().optional(),
		allowCommentAlarmsSentSms: z.boolean().optional(),
		allowCommentAlarmsSentEmail: z.boolean().optional(),
		twoFactorAuth: z.boolean().optional(),
		image: z.any().optional()
	});

	export const passwordSchema = z
		.object({
			currentPassword: z.string().min(1, 'Current password is required'),
			newPassword: z.string().min(8, 'Password must be at least 8 characters'),
			confirmPassword: z.string().min(1, 'Please confirm your password')
		})
		.refine((data) => data.newPassword === data.confirmPassword, {
			message: 'Passwords do not match',
			path: ['confirmPassword']
		});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { authStore } from '$lib/store';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import {
		Camera,
		Loader2,
		ArrowLeft,
		Lock,
		Key,
		FileText,
		ChevronRight,
		Settings
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { COUNTRY_VALUES, LANG_VALUES } from '$lib/shared/constants';

	let { data } = $props();

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true,
		resetForm: false
	});

	const { form: formData, enhance, submitting } = form;

	// Password change form
	const passwordForm = superForm(defaults(zod4(passwordSchema)), {
		validators: zod4(passwordSchema),
		SPA: true,
		resetForm: true
	});

	const {
		form: passwordData,
		enhance: passwordEnhance,
		submitting: passwordSubmitting
	} = passwordForm;

	let imagePreview: string | null = null;
	let fileInput: HTMLInputElement;
	let isUploading = false;
	let showPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
	const countries = COUNTRY_VALUES;

	onMount(() => {
		if (data.user) {
			form.reset({ data: { ...data.user, country: data.user?.country?.toString() } as any });
			imagePreview = data.user.image;
		}
	});

	// Auto-update phone code when country changes
	$effect(() => {
		if ($formData.country) {
			const selectedCountry = countries.find((c) => String(c.key) === String($formData.country));
			if (selectedCountry && selectedCountry.phoneCode !== $formData.countryPhoneCode) {
				// Use untrack to avoid triggering during effect
				queueMicrotask(() => {
					$formData.countryPhoneCode = selectedCountry.phoneCode;
				});
			}
		}
	});

	function validateImage(file: File): boolean {
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
			return false;
		}
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			toast.error('Image size must be less than 5MB');
			return false;
		}
		return true;
	}

	async function handleImageChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			if (!validateImage(file)) {
				target.value = '';
				return;
			}

			isUploading = true;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
			$formData.image = file;
			isUploading = false;
			toast.success('Image ready to be uploaded.');
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}

	async function handleSubmit(e: Event | null) {
		if (e) e.preventDefault();
		const validated = await form.validateForm();
		if (validated.valid) {
			try {
				const userId = data.user?.id;
				if (!userId) {
					toast.error('User not found');
					return;
				}

				let imageUrl = data.user?.image;

				if ($formData.image && $formData.image instanceof File) {
					const formDataImage = new FormData();
					formDataImage.append('file', $formData.image);
					const res = await api.post('files', formDataImage);
					imageUrl = res.data.url;
				}

				const profileData = {
					...$formData,
					image: imageUrl,
					countryPhoneCode: $formData.countryPhoneCode?.replace('+', '')
				};

				await api.put(`users/${userId}`, profileData);

				authStore.login({ ...data.user, ...profileData }, $authStore.token!, $authStore.menu);

				toast.success('Profile updated successfully!');
			} catch (error: any) {
				toast.error(error.message || 'Failed to update profile');
			}
		}
	}

	function getInitials(name?: string): string {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Boolean getters/setters for switches
	function getAllowAlarmsSentSms() {
		return $formData.allowAlarmsSentSms ?? false;
	}
	function setAllowAlarmsSentSms(value: boolean) {
		$formData.allowAlarmsSentSms = value;
	}
	function getAllowAlarmsSentEmail() {
		return $formData.allowAlarmsSentEmail ?? false;
	}
	function setAllowAlarmsSentEmail(value: boolean) {
		$formData.allowAlarmsSentEmail = value;
	}
	function getAllowCommentAlarmsSentSms() {
		return $formData.allowCommentAlarmsSentSms ?? false;
	}
	function setAllowCommentAlarmsSentSms(value: boolean) {
		$formData.allowCommentAlarmsSentSms = value;
	}
	function getAllowCommentAlarmsSentEmail() {
		return $formData.allowCommentAlarmsSentEmail ?? false;
	}
	function setAllowCommentAlarmsSentEmail(value: boolean) {
		$formData.allowCommentAlarmsSentEmail = value;
	}
	function getTwoFactorAuth() {
		return $formData.twoFactorAuth ?? false;
	}
	function setTwoFactorAuth(value: boolean) {
		$formData.twoFactorAuth = value;
	}

	async function handlePasswordChange(e: Event) {
		e.preventDefault();
		const validated = await passwordForm.validateForm();
		if (validated.valid) {
			try {
				const userId = data.user?.id;
				if (!userId) {
					toast.error('User not found');
					return;
				}

				await api.patch(`users/${userId}/password`, {
					oldPassword: $passwordData.currentPassword,
					newPassword: $passwordData.newPassword
				});

				// Reset form
				passwordForm.reset();

				toast.success('Password changed successfully!');
			} catch (error: any) {
				toast.error(error.message || 'Failed to change password');
			}
		}
	}
</script>

<div class="container mx-auto max-w-4xl space-y-8 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Profile Settings</h1>
		<Button variant="outline" onclick={() => goto('/dashboard')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Dashboard
		</Button>
	</div>

	<form class="space-y-8" use:enhance onsubmit={handleSubmit}>
		<!-- Profile Image Section -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Profile Picture</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center space-y-4">
				<div class="relative">
					<Avatar class="h-24 w-24">
						{#if isUploading}
							<div
								class="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-black"
							>
								<Loader2 class="h-8 w-8 animate-spin text-white" />
							</div>
						{/if}
						<AvatarImage src={imagePreview} alt="Profile picture" />
						<AvatarFallback class="text-lg">
							{getInitials($formData.name)}
						</AvatarFallback>
					</Avatar>
					<Button
						type="button"
						variant="outline"
						size="icon"
						class="absolute -right-2 -bottom-2 rounded-full"
						onclick={triggerFileInput}
						disabled={isUploading}
					>
						<Camera class="h-4 w-4" />
					</Button>
				</div>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
					class="hidden"
					onchange={handleImageChange}
				/>
				<p class="text-sm text-muted-foreground">
					Click the camera to update your profile picture.
				</p>
				<p class="text-xs text-muted-foreground">
					Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Personal Information -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Personal Information</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} placeholder="Enter your full name" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Email</Form.Label>
							<Input
								{...props}
								bind:value={$formData.email}
								placeholder="Enter your email address"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
		</Card.Root>

		<!-- Contact and Location -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Contact & Location</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Form.Field {form} name="country">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Country</Form.Label>
							<Select.Root type="single" bind:value={$formData.country} name={props.name}>
								<Select.Trigger {...props} class="w-full">
									{countries.find((c) => String(c.key) === String($formData.country))?.value ??
										'Select a country'}
								</Select.Trigger>
								<Select.Content>
									{#each countries as country}
										<Select.Item value={`${country.key}`} label={country.value}>
											{country.value}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<div class="grid grid-cols-3 gap-2">
					<div class="col-span-1">
						<Form.Field {form} name="countryPhoneCode">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Code</Form.Label>
									<Select.Root
										type="single"
										bind:value={$formData.countryPhoneCode}
										name={props.name}
									>
										<Select.Trigger {...props} class="w-full">
											{$formData.countryPhoneCode ?? 'Code'}
										</Select.Trigger>
										<Select.Content>
											{#each countries as country}
												<Select.Item value={country.phoneCode} label={country.phoneCode}>
													{country.phoneCode}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
						</Form.Field>
					</div>
					<div class="col-span-2">
						<Form.Field {form} name="phone">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Phone</Form.Label>
									<Input {...props} bind:value={$formData.phone} placeholder="Enter phone" />
								{/snippet}
							</Form.Control>
						</Form.Field>
					</div>
				</div>

				<Form.Field {form} name="province">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Province</Form.Label>
							<Input {...props} bind:value={$formData.province} placeholder="Enter province" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="city">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>City</Form.Label>
							<Input {...props} bind:value={$formData.city} placeholder="Enter city" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="address" class="md:col-span-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Address</Form.Label>
							<Input {...props} bind:value={$formData.address} placeholder="Enter address" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="zip">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Zip Code</Form.Label>
							<Input {...props} bind:value={$formData.zip} placeholder="Enter zip code" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
		</Card.Root>

		<!-- Preferences -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Preferences</Card.Title>
			</Card.Header>
			<Card.Content>
				<Form.Field {form} name="languagePreference">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Language</Form.Label>
							<Select.Root
								type="single"
								bind:value={$formData.languagePreference}
								name={props.name}
							>
								<Select.Trigger {...props} class="w-full md:w-1/2">
									{LANG_VALUES.find((l) => l.key == $formData.languagePreference)?.value ??
										'Select a language'}
								</Select.Trigger>
								<Select.Content>
									{#each LANG_VALUES as lang}
										<Select.Item value={lang.key} label={lang.value}>
											{lang.value}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
		</Card.Root>

		<!-- Notification Settings -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Notification Settings</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="flex items-center space-x-2">
						<Switch
							id="allowAlarmsSentSms"
							bind:checked={getAllowAlarmsSentSms, setAllowAlarmsSentSms}
						/>
						<Label for="allowAlarmsSentSms">Alarm Notifications (SMS)</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Switch
							id="allowAlarmsSentEmail"
							bind:checked={getAllowAlarmsSentEmail, setAllowAlarmsSentEmail}
						/>
						<Label for="allowAlarmsSentEmail">Alarm Notifications (Email)</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Switch
							id="allowCommentAlarmsSentSms"
							bind:checked={getAllowCommentAlarmsSentSms, setAllowCommentAlarmsSentSms}
						/>
						<Label for="allowCommentAlarmsSentSms">Comment Notifications (SMS)</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Switch
							id="allowCommentAlarmsSentEmail"
							bind:checked={getAllowCommentAlarmsSentEmail, setAllowCommentAlarmsSentEmail}
						/>
						<Label for="allowCommentAlarmsSentEmail">Comment Notifications (Email)</Label>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Security Settings -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Security</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-center space-x-2">
					<Switch id="twoFactorAuth" bind:checked={getTwoFactorAuth, setTwoFactorAuth} />
					<Label for="twoFactorAuth">Two-Factor Authentication</Label>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-4">
			<Button type="submit" class="px-8" disabled={$submitting}>
				{#if $submitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					<span>Saving...</span>
				{:else}
					<span>Update Profile</span>
				{/if}
			</Button>
		</div>
	</form>

	<!-- Quick Actions -->
	<div class="grid gap-4 md:grid-cols-2">
		<button
			onclick={() => goto('/profile/change-password')}
			class="group flex items-center gap-4 rounded-lg border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
			>
				<Lock class="h-6 w-6" />
			</div>
			<div class="flex-1">
				<h3 class="font-semibold">Change Password</h3>
				<p class="text-sm text-muted-foreground">Update your account password</p>
			</div>
			<ChevronRight
				class="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1"
			/>
		</button>

		<button
			onclick={() => goto('/profile/report-config')}
			class="group flex items-center gap-4 rounded-lg border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
			>
				<FileText class="h-6 w-6" />
			</div>
			<div class="flex-1">
				<h3 class="font-semibold">Report Configuration</h3>
				<p class="text-sm text-muted-foreground">Configure report logo and settings</p>
			</div>
			<ChevronRight
				class="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1"
			/>
		</button>
	</div>
</div>
