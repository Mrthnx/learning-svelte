<script lang="ts" module>
	import { z } from 'zod/v4';

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
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft, Lock, Key, Loader2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { authStore } from '$lib/store';
	import PasswordRequirements from '$lib/components/ui/password-requirements/PasswordRequirements.svelte';
	import { PasswordInput } from '$lib/components/me';
	import { encryptText } from '$lib/shared';

	const passwordForm = superForm(defaults(zod4(passwordSchema)), {
		validators: zod4(passwordSchema),
		SPA: true,
		resetForm: false
	});

	const { form: passwordData, enhance, submitting } = passwordForm;

	let showPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	let passwordRequirementsComponent: any;

	async function handlePasswordChange(e: Event) {
		e.preventDefault();

		// Check password requirements first
		if (!passwordRequirementsComponent?.getIsValid()) {
			toast.error('Please meet all password requirements');
			return;
		}

		const validated = await passwordForm.validateForm();
		if (validated.valid) {
			try {
				const userId = $authStore.user?.id;
				if (!userId) {
					toast.error('User not found');
					return;
				}

				// Step 1: Validate new password format with backend
				try {
					await api.post('validate-password', {
						password: $passwordData.newPassword,
						id: userId
					});
				} catch (validationError: any) {
					// Handle validation errors from backend
					if (validationError.data && Array.isArray(validationError.data)) {
						const errorMessages = validationError.data.map((err: any) => err.message).join('. ');
						toast.error(`Password validation failed: ${errorMessages}`);
					} else {
						toast.error(validationError.message || 'Password validation failed');
					}
					return; // Stop execution if validation fails
				}

				// Step 2: Update password with encrypted values (only if validation passed)
				const currentPasswordMD5 = encryptText($passwordData.currentPassword);
				const newPasswordMD5 = encryptText($passwordData.newPassword);

				await api.patch(`users/update-password/${userId}`, {
					id: userId,
					currentPassword: currentPasswordMD5,
					password: newPasswordMD5,
					confirmPassword: newPasswordMD5
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

<div class="container mx-auto max-w-2xl space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Change Password</h1>
		<Button variant="outline" onclick={() => goto('/profile')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Profile
		</Button>
	</div>

	<form use:enhance onsubmit={handlePasswordChange}>
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Lock class="h-5 w-5" />
					Update Your Password
				</Card.Title>
				<Card.Description>
					Choose a strong password to keep your account secure. Password must be at least 8
					characters long.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<Form.Field form={passwordForm} name="currentPassword">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Current Password</Form.Label>
							<PasswordInput
								{...props}
								bind:showPassword
								bind:value={$passwordData.currentPassword}
								placeholder="Enter current password"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={passwordForm} name="newPassword">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>New Password</Form.Label>
							<PasswordInput
								{...props}
								bind:showPassword={showNewPassword}
								bind:value={$passwordData.newPassword}
								placeholder="Enter new password (min 8 characters)"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Use a mix of letters, numbers, and symbols</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={passwordForm} name="confirmPassword">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Confirm New Password</Form.Label>
							<PasswordInput
								{...props}
								bind:showPassword={showConfirmPassword}
								bind:value={$passwordData.confirmPassword}
								placeholder="Confirm new password"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Password Requirements -->
				<div class="rounded-lg border bg-muted/50 p-4">
					<h3 class="mb-3 text-sm font-semibold">Password Requirements</h3>
					<PasswordRequirements
						bind:this={passwordRequirementsComponent}
						password={$passwordData.newPassword}
						confirmPassword={$passwordData.confirmPassword}
						currentPassword={$passwordData.currentPassword}
						showPasswordMatch={true}
						showCurrentPasswordDiff={true}
					/>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between border-t pt-6">
				<Button type="button" variant="outline" onclick={() => goto('/profile')}>Cancel</Button>
				<Button type="submit" disabled={$submitting}>
					{#if $submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						<span>Changing Password...</span>
					{:else}
						<Key class="mr-2 h-4 w-4" />
						<span>Change Password</span>
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
