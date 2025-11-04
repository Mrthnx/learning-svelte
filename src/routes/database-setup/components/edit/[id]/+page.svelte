<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { ComponentForm } from '$lib/components/modules/components';
	import { componentService, type Component } from '$lib/services/component.service';

	let component: Component | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updatedComponentCode = $state('');

	const componentId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadComponent();
	});

	async function loadComponent() {
		isLoading = true;
		try {
			component = await componentService.getById(componentId);
		} catch (error: any) {
			console.error('Error loading component:', error);
			toast.error(error.message || 'Failed to load component');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: Component) {
		await componentService.update(componentId, data);
		updatedComponentCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
			goto('/database-setup/components');
		}
	}

	function handleCancel() {
		goto('/database-setup/components');
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Components
		</Button>
		<h1 class="text-3xl font-bold">Edit Component</h1>
		<p class="text-muted-foreground">Update the component information</p>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
			></div>
		</div>
	{:else if component}
		<ComponentForm {component} onSubmit={handleSubmit} onCancel={handleCancel} isEdit={true} />
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Component Updated Successfully!"
	description={`The component "${updatedComponentCode}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
