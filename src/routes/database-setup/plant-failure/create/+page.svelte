<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Plus, List } from 'lucide-svelte';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { PlantFailureForm } from '$lib/components/modules/plant-failures';
	import { plantFailureService, type PlantFailure } from '$lib/services/plant-failure.service';

	let showSuccessDialog = $state(false);
	let createdAssociation = $state('');

	async function handleSubmit(data: PlantFailure) {
		await plantFailureService.create(data);
		createdAssociation = `${data.plant?.code} - ${data.failureMode?.code}`;
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
			window.location.reload();
		} else if (action === 'secondary') {
			showSuccessDialog = false;
			goto('/database-setup/plant-failure');
		}
	}

	function handleCancel() {
		goto('/database-setup/plant-failure');
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Plant Failures
		</Button>
		<h1 class="text-3xl font-bold">Create Plant Failure</h1>
		<p class="text-muted-foreground">Associate a failure mode with a plant</p>
	</div>

	<PlantFailureForm onSubmit={handleSubmit} onCancel={handleCancel} />
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Association Created Successfully!"
	description={`The plant failure association "${createdAssociation}" has been created successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Create Another', action: 'primary', variant: 'default', icon: Plus },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
