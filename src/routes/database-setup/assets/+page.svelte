<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AssetTable } from '$lib/components/modules/assets';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		assetService,
		type Asset,
		type PaginateResponse
	} from '$lib/services/asset.service';

	let assets: Asset[] = $state([]);
	let selectedAssets: Asset[] = $state([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	// Modals
	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let assetToDelete: Asset | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Load assets on mount
	onMount(() => {
		loadAssets();
	});

	async function loadAssets() {
		isLoading = true;
		try {
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

			const response: PaginateResponse<Asset> = await assetService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

		assets = response.rows;
		totalRecords = response.total;
	} catch (error: any) {
		console.error('Error loading assets:', error);
		toast.error(error.message || 'Failed to load assets');
	} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadAssets();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/assets/create');
	}

	function handleEdit(asset: Asset) {
		goto(`/database-setup/assets/edit/${asset.id}`);
	}

	function handleDelete(asset: Asset) {
		assetToDelete = asset;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!assetToDelete?.id) return;

		isDeleting = true;
		try {
			await assetService.delete(assetToDelete.id);
			toast.success(`Asset "${assetToDelete.code}" deleted successfully`);
			deleteDialogOpen = false;
			assetToDelete = null;
			loadAssets();
		} catch (error: any) {
			console.error('Error deleting asset:', error);
			toast.error(error.message || 'Failed to delete asset');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedAssets.length === 0) {
			toast.error('Please select at least one asset to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedAssets
					.filter((asset) => asset.id !== null)
					.map((asset) => assetService.delete(asset.id!))
			);

			toast.success(`${selectedAssets.length} asset(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedAssets = [];
			loadAssets();
		} catch (error: any) {
			console.error('Error deleting assets:', error);
			toast.error(error.message || 'Failed to delete assets');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadAssets();
	}

	function handleRefresh() {
		loadAssets();
	}

	function handleSelectionChange(selected: Asset[]) {
		selectedAssets = selected;
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Assets</h1>
			<p class="text-muted-foreground">Manage your organization assets</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New Asset
		</Button>
	</div>

	<!-- Search and Actions -->
	<div class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="space-y-2">
				<label for="filter-code" class="text-sm font-medium">Filter by Code</label>
				<Input
					id="filter-code"
					type="text"
					placeholder="Enter code and press Enter..."
					bind:value={filterCode}
					onkeypress={handleKeyPress}
					disabled={isLoading}
				/>
			</div>
			<div class="space-y-2">
				<label for="filter-description" class="text-sm font-medium">Filter by Description</label>
				<Input
					id="filter-description"
					type="text"
					placeholder="Enter description and press Enter..."
					bind:value={filterDescription}
					onkeypress={handleKeyPress}
					disabled={isLoading}
				/>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handleRefresh} disabled={isLoading} class="gap-2">
					<RefreshCw class={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
					Reload
				</Button>
				<Button onclick={handleSearch} disabled={isLoading} class="gap-2">
					Search
				</Button>
			</div>

			{#if selectedAssets.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedAssets.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<AssetTable
		{assets}
		onEdit={handleEdit}
		onDelete={handleDelete}
		onSelectionChange={handleSelectionChange}
		selectable={true}
	/>

	<!-- Pagination -->
	<Pagination
		{currentPage}
		{totalPages}
		{totalRecords}
		{pageSize}
		onPageChange={handlePageChange}
		{isLoading}
	/>
</div>

<!-- Delete Single Asset Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete Asset"
	description={assetToDelete
		? `Are you sure you want to delete "${assetToDelete.code}"? This action cannot be undone.`
		: ''}
	buttons={[
		{ label: 'Cancel', action: 'cancel', variant: 'outline' },
		{ label: isDeleting ? 'Deleting...' : 'Delete', action: 'confirm', variant: 'destructive' }
	]}
	onAction={(action) => {
		if (action === 'confirm') {
			confirmDelete();
		}
	}}
/>

<!-- Bulk Delete Modal -->
<AlertModal
	bind:open={bulkDeleteDialogOpen}
	type="confirm"
	title="Delete Multiple Assets"
	description={`Are you sure you want to delete ${selectedAssets.length} asset(s)? This action cannot be undone.`}
	buttons={[
		{ label: 'Cancel', action: 'cancel', variant: 'outline' },
		{ label: isDeleting ? 'Deleting...' : 'Delete All', action: 'confirm', variant: 'destructive' }
	]}
	onAction={(action) => {
		if (action === 'confirm') {
			confirmBulkDelete();
		}
	}}
/>