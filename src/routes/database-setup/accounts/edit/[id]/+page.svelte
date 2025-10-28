<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ArrowLeft, Save } from 'lucide-svelte';

	const id = $derived($page.params.id);

	let formData = $state({
		name: '',
		description: ''
	});

	let isLoading = $state(true);
	let isSubmitting = $state(false);

	onMount(async () => {
		try {
			// TODO: Implementar llamada a API para cargar datos
			await new Promise((resolve) => setTimeout(resolve, 500));
			formData = {
				name: `Account ${id}`,
				description: `Description of account ${id}`
			};
		} catch (error) {
			console.error('Error loading account:', error);
		} finally {
			isLoading = false;
		}
	});

	async function handleSubmit() {
		isSubmitting = true;
		try {
			// TODO: Implementar llamada a API
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log('Updating account:', id, formData);
			goto('/database-setup/accounts');
		} catch (error) {
			console.error('Error updating account:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		goto('/database-setup/accounts');
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Accounts
		</Button>
		<h1 class="text-3xl font-bold">Edit Account</h1>
		<p class="text-muted-foreground">Update account information (ID: {id})</p>
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
	{:else}
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>Account Information</Card.CardTitle>
				<Card.CardDescription>Update the account details</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent>
				<form onsubmit={handleSubmit} class="space-y-6">
					<div class="space-y-2">
						<label for="name" class="text-sm font-medium">
							Name <span class="text-destructive">*</span>
						</label>
						<Input id="name" bind:value={formData.name} placeholder="Enter account name" required />
					</div>

					<div class="space-y-2">
						<label for="description" class="text-sm font-medium">Description</label>
						<Textarea
							id="description"
							bind:value={formData.description}
							placeholder="Enter account description"
							rows={4}
						/>
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
