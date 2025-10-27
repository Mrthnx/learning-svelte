<script lang="ts">
	import { Lock, Check, X } from 'lucide-svelte';

	export let password: string = '';
	export let confirmPassword: string = '';
	export let currentPassword: string = '';
	export let showPasswordMatch: boolean = false;
	export let showCurrentPasswordDiff: boolean = false;

	// Password validation functions
	$: hasMinLength = password.length >= 8;
	$: hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
	$: hasNumberAndSpecial = /\d/.test(password) && /[^a-zA-Z\d]/.test(password);
	$: passwordsMatch = password === confirmPassword && password.length > 0;
	$: isDifferentFromCurrent = password !== currentPassword && password.length > 0;
</script>

<div class="rounded-lg border border-gray-600 bg-gray-800/50 p-4">
	<h3 class="mb-2 flex items-center gap-2 font-medium text-white">
		<Lock class="h-4 w-4" />
		Password Requirements
	</h3>
	<ul class="space-y-1 text-sm text-gray-400">
		<li class="flex items-center gap-2">
			{#if hasMinLength}
				<Check class="h-4 w-4 text-green-500" />
			{:else}
				<X class="h-4 w-4 text-red-500" />
			{/if}
			<span class={hasMinLength ? 'text-green-500' : 'text-red-500'}>
				At least 8 characters long
			</span>
		</li>
		<li class="flex items-center gap-2">
			{#if hasUpperAndLower}
				<Check class="h-4 w-4 text-green-500" />
			{:else}
				<X class="h-4 w-4 text-red-500" />
			{/if}
			<span class={hasUpperAndLower ? 'text-green-500' : 'text-red-500'}>
				Mix of uppercase and lowercase letters
			</span>
		</li>
		<li class="flex items-center gap-2">
			{#if hasNumberAndSpecial}
				<Check class="h-4 w-4 text-green-500" />
			{:else}
				<X class="h-4 w-4 text-red-500" />
			{/if}
			<span class={hasNumberAndSpecial ? 'text-green-500' : 'text-red-500'}>
				Include numbers and special characters
			</span>
		</li>
		{#if showPasswordMatch}
			<li class="flex items-center gap-2">
				{#if passwordsMatch}
					<Check class="h-4 w-4 text-green-500" />
				{:else}
					<X class="h-4 w-4 text-red-500" />
				{/if}
				<span class={passwordsMatch ? 'text-green-500' : 'text-red-500'}> Passwords match </span>
			</li>
		{/if}
		{#if showCurrentPasswordDiff}
			<li class="flex items-center gap-2">
				{#if isDifferentFromCurrent}
					<Check class="h-4 w-4 text-green-500" />
				{:else}
					<X class="h-4 w-4 text-red-500" />
				{/if}
				<span class={isDifferentFromCurrent ? 'text-green-500' : 'text-red-500'}>
					Different from your current password
				</span>
			</li>
		{/if}
	</ul>
</div>
