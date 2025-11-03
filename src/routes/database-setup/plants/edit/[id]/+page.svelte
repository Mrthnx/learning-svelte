<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { PlantForm } from '$lib/components/modules/plants';
	import { plantService, type Plant } from '$lib/services/plant.service';

	let plant: Plant | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updatedPlantCode = $state('');

	const plantId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadPlant();
	});

	async function loadPlant() {
		isLoading = true;
		try {
			plant = await plantService.getById(plantId);
		} catch (error: any) {
			console.error('Error loading plant:', error);
			toast.error(error.message || 'Failed to load plant');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: Plant) {
		await plantService.update(plantId, data);
		updatedPlantCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
			goto('/database-setup/plants');
		}
	}

	function handleCancel() {
		goto('/database-setup/plants');
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Plants
		</Button>
		<h1 class="text-3xl font-bold">Edit Plant</h1>
		<p class="text-muted-foreground">Update the plant information</p>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else if plant}
		<PlantForm plant={plant} onSubmit={handleSubmit} onCancel={handleCancel} isEdit={true} />
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Plant Updated Successfully!"
	description={`The plant "${updatedPlantCode}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>