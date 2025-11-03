<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { AssetForm } from '$lib/components/modules/assets';
	import { assetService, type Asset } from '$lib/services/asset.service';

	let asset: Asset | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updatedAssetCode = $state('');

	const assetId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadAsset();
	});

	async function loadAsset() {
		isLoading = true;
		try {
			asset = await assetService.getById(assetId);
		} catch (error: any) {
			console.error('Error loading asset:', error);
			toast.error(error.message || 'Failed to load asset');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: Asset) {
		await assetService.update(assetId, data);
		updatedAssetCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
			goto('/database-setup/assets');
		}
	}

	function handleCancel() {
		goto('/database-setup/assets');
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to Assets
		</Button>
		<h1 class="text-3xl font-bold">Edit Asset</h1>
		<p class="text-muted-foreground">Update the asset information</p>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else if asset}
		<AssetForm asset={asset} onSubmit={handleSubmit} onCancel={handleCancel} isEdit={true} />
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="Asset Updated Successfully!"
	description={`The asset "${updatedAssetCode}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
