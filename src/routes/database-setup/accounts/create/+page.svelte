<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ArrowLeft, Save } from 'lucide-svelte';

	let formData = $state({
		name: '',
		description: ''
	});

	let isSubmitting = $state(false);

	async function handleSubmit() {
		isSubmitting = true;
		try {
			// TODO: Implementar llamada a API
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log('Creating account:', formData);
			goto('/database-setup/accounts');
		} catch (error) {
			console.error('Error creating account:', error);
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
		<h1 class="text-3xl font-bold">Create Account</h1>
		<p class="text-muted-foreground">Add a new account to the system</p>
	</div>

	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Account Information</Card.CardTitle>
			<Card.CardDescription>Fill in the details for the new account</Card.CardDescription>
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
					Creating...
				{:else}
					<Save class="h-4 w-4" />
					Create Account
				{/if}
			</Button>
		</Card.CardFooter>
	</Card.Card>
</div>
