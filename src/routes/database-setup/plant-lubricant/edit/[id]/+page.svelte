<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft, Trash2, List, Edit } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { PlantLubricantForm } from '$lib/components/modules/plant-lubricants';
	import {
		plantLubricantService,
		type PlantLubricant
	} from '$lib/services/plant-lubricant.service';

	const id = $derived($page.params.id);

	let plantLubricant = $state<PlantLubricant | null>(null);
	let isLoading = $state(true);
	let isDeleting = $state(false);
	let showDeleteDialog = $state(false);
	let showSuccessDialog = $state(false);
	let notFound = $state(false);

	onMount(async () => {
		try {
			plantLubricant = await plantLubricantService.getById(Number(id));
		} catch (error: any) {
			console.error('Error loading plant lubricant:', error);
			toast.error(error.message || 'Failed to load plant lubricant');
			notFound = true;
		} finally {
			isLoading = false;
		}
	});

	async function handleSubmit(data: PlantLubricant) {
		await plantLubricantService.update(Number(id), data);
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
			toast.success('You can continue editing');
		} else if (action === 'secondary') {
			showSuccessDialog = false;
			goto('/database-setup/plant-lubricant');
		}
	}

	function handleCancel() {
		goto('/database-setup/plant-lubricant');
	}

	function handleDeleteClick() {
		showDeleteDialog = true;
	}

	async function confirmDelete() {
		isDeleting = true;
		try {
			await plantLubricantService.delete(Number(id));
			toast.success(
				`Plant lubricant association "${plantLubricant?.plant?.code} - ${plantLubricant?.lubricant?.code}" deleted successfully`
			);
			showDeleteDialog = false;
			goto('/database-setup/plant-lubricant');
		} catch (error: any) {
			console.error('Error deleting plant lubricant:', error);
			toast.error(error.message || 'Failed to delete plant lubricant');
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Plant Lubricants
		</Button>
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold">Edit Plant Lubricant</h1>
				<p class="text-muted-foreground">Update association information (ID: {id})</p>
			</div>
			{#if !isLoading && !notFound}
				<Button variant="destructive" onclick={handleDeleteClick} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete
				</Button>
			{/if}
		</div>
	</div>

	{#if isLoading}
		<Card.Card>
			<Card.CardContent class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4">
					<div
						class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
					></div>
					<p class="text-sm text-muted-foreground">Loading plant lubricant...</p>
				</div>
			</Card.CardContent>
		</Card.Card>
	{:else if notFound}
		<Card.Card>
			<Card.CardContent class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4 text-center">
					<div class="rounded-full bg-destructive/10 p-4">
						<Trash2 class="h-8 w-8 text-destructive" />
					</div>
					<div>
						<h3 class="mb-2 text-lg font-semibold">Plant Lubricant Not Found</h3>
						<p class="text-sm text-muted-foreground">
							The plant lubricant association you're looking for doesn't exist or has been deleted.
						</p>
					</div>
					<Button onclick={() => goto('/database-setup/plant-lubricant')} class="gap-2">
						<ArrowLeft class="h-4 w-4" />
						Back to Plant Lubricants
					</Button>
				</div>
			</Card.CardContent>
		</Card.Card>
	{:else if plantLubricant}
		<PlantLubricantForm
			{plantLubricant}
			isEdit={true}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	{/if}
</div>

<AlertModal
	bind:open={showDeleteDialog}
	type="confirm"
	title="Delete Plant Lubricant"
	description={`Are you sure you want to delete "${plantLubricant?.plant?.code} - ${plantLubricant?.lubricant?.code}"? This action cannot be undone.`}
	buttons={[
		{ label: 'Cancel', action: 'cancel', variant: 'outline' },
		{
			label: isDeleting ? 'Deleting...' : 'Delete Association',
			action: 'confirm',
			variant: 'destructive',
			icon: Trash2
		}
	]}
	onAction={(action) => {
		if (action === 'confirm') {
			confirmDelete();
		}
	}}
/>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Association Updated Successfully!"
	description={`The plant lubricant association "${plantLubricant?.plant?.code} - ${plantLubricant?.lubricant?.code}" has been updated successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Keep Editing', action: 'primary', variant: 'default', icon: Edit },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
