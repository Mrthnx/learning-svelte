<script lang="ts">
	import { Check, X } from 'lucide-svelte';

	interface Props {
		password?: string;
		confirmPassword?: string;
		currentPassword?: string;
		showPasswordMatch?: boolean;
		showCurrentPasswordDiff?: boolean;
	}

	let {
		password = '',
		confirmPassword = '',
		currentPassword = '',
		showPasswordMatch = true,
		showCurrentPasswordDiff = false
	}: Props = $props();

	// Validation checks
	const hasMinLength = $derived(password.length >= 8);
	const hasUpperAndLower = $derived(/[a-z]/.test(password) && /[A-Z]/.test(password));
	const hasNumberAndSpecial = $derived(/\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password));
	const passwordsMatch = $derived(
		showPasswordMatch && password && confirmPassword ? password === confirmPassword : true
	);
	const isDifferentFromCurrent = $derived(
		showCurrentPasswordDiff && currentPassword ? password !== currentPassword : true
	);

	// Overall validation
	const isValid = $derived(
		hasMinLength &&
			hasUpperAndLower &&
			hasNumberAndSpecial &&
			passwordsMatch &&
			isDifferentFromCurrent
	);

	// Export function to access validation state
	export function getIsValid() {
		return isValid;
	}
</script>

<div class="space-y-3">
	<div class="space-y-2">
		<!-- Min Length Check -->
		<div class="flex items-center gap-2 text-sm">
			{#if hasMinLength}
				<Check class="h-4 w-4 text-green-500" />
				<span class="text-green-500">At least 8 characters</span>
			{:else}
				<X class="h-4 w-4 text-muted-foreground" />
				<span class="text-muted-foreground">At least 8 characters</span>
			{/if}
		</div>

		<!-- Upper and Lower Case Check -->
		<div class="flex items-center gap-2 text-sm">
			{#if hasUpperAndLower}
				<Check class="h-4 w-4 text-green-500" />
				<span class="text-green-500">Contains uppercase and lowercase letters</span>
			{:else}
				<X class="h-4 w-4 text-muted-foreground" />
				<span class="text-muted-foreground">Contains uppercase and lowercase letters</span>
			{/if}
		</div>

		<!-- Number and Special Character Check -->
		<div class="flex items-center gap-2 text-sm">
			{#if hasNumberAndSpecial}
				<Check class="h-4 w-4 text-green-500" />
				<span class="text-green-500">Contains numbers and special characters</span>
			{:else}
				<X class="h-4 w-4 text-muted-foreground" />
				<span class="text-muted-foreground">Contains numbers and special characters</span>
			{/if}
		</div>

		<!-- Password Match Check -->
		{#if showPasswordMatch && confirmPassword}
			<div class="flex items-center gap-2 text-sm">
				{#if passwordsMatch}
					<Check class="h-4 w-4 text-green-500" />
					<span class="text-green-500">Passwords match</span>
				{:else}
					<X class="h-4 w-4 text-red-500" />
					<span class="text-red-500">Passwords do not match</span>
				{/if}
			</div>
		{/if}

		<!-- Different from Current Password Check -->
		{#if showCurrentPasswordDiff && currentPassword && password}
			<div class="flex items-center gap-2 text-sm">
				{#if isDifferentFromCurrent}
					<Check class="h-4 w-4 text-green-500" />
					<span class="text-green-500">Different from current password</span>
				{:else}
					<X class="h-4 w-4 text-red-500" />
					<span class="text-red-500">Must be different from current password</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
