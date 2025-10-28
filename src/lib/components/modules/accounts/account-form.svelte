<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Save, X } from 'lucide-svelte';

	interface Account {
		id?: number;
		name: string;
		description: string;
	}

	interface Props {
		account?: Account;
		onSubmit: (data: Account) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
	}

	let {
		account = { name: '', description: '' },
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false
	}: Props = $props();

	let formData = $state<Account>({ ...account });
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	function validateForm(): boolean {
		errors = {};

		if (!formData.name.trim()) {
			errors.name = 'Name is required';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			isSubmitting = false;
		}
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
			<div class="space-y-2">
				<label for="name" class="text-sm font-medium">
					Name <span class="text-destructive">*</span>
				</label>
				<Input
					id="name"
					bind:value={formData.name}
					placeholder="Enter account name"
					disabled={isSubmitting || isLoading}
					class={errors.name ? 'border-destructive' : ''}
				/>
				{#if errors.name}
					<p class="text-sm text-destructive">{errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="description" class="text-sm font-medium">Description</label>
				<Textarea
					id="description"
					bind:value={formData.description}
					placeholder="Enter account description (optional)"
					rows={4}
					disabled={isSubmitting || isLoading}
				/>
			</div>
		</form>
	</Card.CardContent>
	<Card.CardFooter class="flex justify-end gap-2">
		<Button
			variant="outline"
			onclick={onCancel}
			disabled={isSubmitting || isLoading}
			class="gap-2"
		>
			<X class="h-4 w-4" />
			Cancel
		</Button>
		<Button
			onclick={handleSubmit}
			disabled={isSubmitting || isLoading}
			class="gap-2"
		>
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
