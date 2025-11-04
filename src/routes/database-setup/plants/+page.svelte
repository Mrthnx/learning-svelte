<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { PlantTable } from '$lib/components/modules/plants';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { plantService, type Plant, type PaginateResponse } from '$lib/services/plant.service';

	let plants: Plant[] = $state([]);
	let selectedPlants: Plant[] = $state([]);
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
	let plantToDelete: Plant | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Load plants on mount
	onMount(() => {
		loadPlants();
	});

	async function loadPlants() {
		isLoading = true;
		try {
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

			const response: PaginateResponse<Plant> = await plantService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

			plants = response.rows;
			totalRecords = response.total;
		} catch (error: any) {
			console.error('Error loading plants:', error);
			toast.error(error.message || 'Failed to load plants');
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadPlants();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/plants/create');
	}

	function handleEdit(plant: Plant) {
		goto(`/database-setup/plants/edit/${plant.id}`);
	}

	function handleDelete(plant: Plant) {
		plantToDelete = plant;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!plantToDelete?.id) return;

		isDeleting = true;
		try {
			await plantService.delete(plantToDelete.id);
			toast.success(`Plant "${plantToDelete.code}" deleted successfully`);
			deleteDialogOpen = false;
			plantToDelete = null;
			loadPlants();
		} catch (error: any) {
			console.error('Error deleting plant:', error);
			toast.error(error.message || 'Failed to delete plant');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedPlants.length === 0) {
			toast.error('Please select at least one plant to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedPlants
					.filter((plant) => plant.id !== null)
					.map((plant) => plantService.delete(plant.id!))
			);

			toast.success(`${selectedPlants.length} plant(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedPlants = [];
			loadPlants();
		} catch (error: any) {
			console.error('Error deleting plants:', error);
			toast.error(error.message || 'Failed to delete plants');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadPlants();
	}

	function handleRefresh() {
		loadPlants();
	}

	function handleSelectionChange(selected: Plant[]) {
		selectedPlants = selected;
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Plants</h1>
			<p class="text-muted-foreground">Manage your organization plants</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New Plant
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
				<Button onclick={handleSearch} disabled={isLoading} class="gap-2">Search</Button>
			</div>

			{#if selectedPlants.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedPlants.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<PlantTable
		{plants}
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

<!-- Delete Single Plant Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete Plant"
	description={plantToDelete
		? `Are you sure you want to delete "${plantToDelete.code}"? This action cannot be undone.`
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
	title="Delete Multiple Plants"
	description={`Are you sure you want to delete ${selectedPlants.length} plant(s)? This action cannot be undone.`}
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
