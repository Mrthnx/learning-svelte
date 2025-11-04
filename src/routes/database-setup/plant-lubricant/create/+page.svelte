<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Plus, List } from 'lucide-svelte';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { PlantLubricantForm } from '$lib/components/modules/plant-lubricants';
	import {
		plantLubricantService,
		type PlantLubricant
	} from '$lib/services/plant-lubricant.service';

	let showSuccessDialog = $state(false);
	let createdAssociation = $state('');

	async function handleSubmit(data: PlantLubricant) {
		await plantLubricantService.create(data);
		createdAssociation = `${data.plant?.code} - ${data.lubricant?.code}`;
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
			window.location.reload();
		} else if (action === 'secondary') {
			showSuccessDialog = false;
			goto('/database-setup/plant-lubricant');
		}
	}

	function handleCancel() {
		goto('/database-setup/plant-lubricant');
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Plant Lubricants
		</Button>
		<h1 class="text-3xl font-bold">Create Plant Lubricant</h1>
		<p class="text-muted-foreground">Associate a lubricant with a plant</p>
	</div>

	<PlantLubricantForm onSubmit={handleSubmit} onCancel={handleCancel} />
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Association Created Successfully!"
	description={`The plant lubricant association "${createdAssociation}" has been created successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Create Another', action: 'primary', variant: 'default', icon: Plus },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
