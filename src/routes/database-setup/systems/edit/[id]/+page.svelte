<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { SystemForm } from '$lib/components/modules/systems';
	import { systemService, type System } from '$lib/services/system.service';

	let system: System | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updatedSystemCode = $state('');

	const systemId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadSystem();
	});

	async function loadSystem() {
		isLoading = true;
		try {
			system = await systemService.getById(systemId);
		} catch (error: any) {
			console.error('Error loading system:', error);
			toast.error(error.message || 'Failed to load system');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: System) {
		await systemService.update(systemId, data);
		updatedSystemCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
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
		<h1 class="text-3xl font-bold">Edit System</h1>
		<p class="text-muted-foreground">Update the system information</p>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
			></div>
		</div>
	{:else if system}
		<SystemForm {system} onSubmit={handleSubmit} onCancel={handleCancel} isEdit={true} />
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="System Updated Successfully!"
	description={`The system "${updatedSystemCode}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
