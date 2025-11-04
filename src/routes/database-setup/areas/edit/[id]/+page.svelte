<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { AreaForm } from '$lib/components/modules/areas';
	import { areaService, type Area } from '$lib/services/area.service';

	let area: Area | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updatedAreaCode = $state('');

	const areaId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadArea();
	});

	async function loadArea() {
		isLoading = true;
		try {
			area = await areaService.getById(areaId);
		} catch (error: any) {
			console.error('Error loading area:', error);
			toast.error(error.message || 'Failed to load area');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: Area) {
		await areaService.update(areaId, data);
		updatedAreaCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
			goto('/database-setup/areas');
		}
	}

	function handleCancel() {
		goto('/database-setup/areas');
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Areas
		</Button>
		<h1 class="text-3xl font-bold">Edit Area</h1>
		<p class="text-muted-foreground">Update the area information</p>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
			></div>
		</div>
	{:else if area}
		<AreaForm {area} onSubmit={handleSubmit} onCancel={handleCancel} isEdit={true} />
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Area Updated Successfully!"
	description={`The area "${updatedAreaCode}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
