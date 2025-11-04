<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Plus, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { PlantForm } from '$lib/components/modules/plants';
	import { plantService, type Plant } from '$lib/services/plant.service';

	let showSuccessDialog = $state(false);
	let createdPlantCode = $state('');

	async function handleSubmit(data: Plant) {
		await plantService.create(data);
		createdPlantCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			// Create Another
			showSuccessDialog = false;
			window.location.reload(); // Reload to reset form
		} else if (action === 'secondary') {
			// Go to List
			showSuccessDialog = false;
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
		<h1 class="text-3xl font-bold">Create Plant</h1>
		<p class="text-muted-foreground">Add a new plant to the system</p>
	</div>

	<PlantForm onSubmit={handleSubmit} onCancel={handleCancel} />
</div>

<!-- Success Dialog -->
<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Plant Created Successfully!"
	description={`The plant "${createdPlantCode}" has been created successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Create Another', action: 'primary', variant: 'default', icon: Plus },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
