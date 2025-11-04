<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Plus, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { SystemForm } from '$lib/components/modules/systems';
	import { systemService, type System } from '$lib/services/system.service';

	let showSuccessDialog = $state(false);
	let createdSystemCode = $state('');

	async function handleSubmit(data: System) {
		await systemService.create(data);
		createdSystemCode = data.code || '';
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
			goto('/database-setup/systems');
		}
	}

	function handleCancel() {
		goto('/database-setup/systems');
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Systems
		</Button>
		<h1 class="text-3xl font-bold">Create System</h1>
		<p class="text-muted-foreground">Add a new system to the system</p>
	</div>

	<SystemForm onSubmit={handleSubmit} onCancel={handleCancel} />
</div>

<!-- Success Dialog -->
<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="System Created Successfully!"
	description={`The system "${createdSystemCode}" has been created successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Create Another', action: 'primary', variant: 'default', icon: Plus },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
