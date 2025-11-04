<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { PlantLubricantTable } from '$lib/components/modules/plant-lubricants';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		plantLubricantService,
		type PlantLubricant,
		type PaginateResponse
	} from '$lib/services/plant-lubricant.service';

	let plantLubricants: PlantLubricant[] = $state([]);
	let selectedPlantLubricants: PlantLubricant[] = $state([]);
	let filterPlant = $state('');
	let filterLubricant = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	// Modals
	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let plantLubricantToDelete: PlantLubricant | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	onMount(() => {
		loadPlantLubricants();
	});

	async function loadPlantLubricants() {
		isLoading = true;
		try {
			const filters: any = {};
			if (filterPlant.trim()) filters['plant.code'] = filterPlant.trim();
			if (filterLubricant.trim()) filters['lubricant.code'] = filterLubricant.trim();

			const response: PaginateResponse<PlantLubricant> = await plantLubricantService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

			plantLubricants = response.rows;
			totalRecords = response.total;
		} catch (error: any) {
			console.error('Error loading plant lubricants:', error);
			toast.error(error.message || 'Failed to load plant lubricants');
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadPlantLubricants();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/plant-lubricant/create');
	}

	function handleEdit(plantLubricant: PlantLubricant) {
		goto(`/database-setup/plant-lubricant/edit/${plantLubricant.id}`);
	}

	function handleDelete(plantLubricant: PlantLubricant) {
		plantLubricantToDelete = plantLubricant;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!plantLubricantToDelete?.id) return;

		isDeleting = true;
		try {
			await plantLubricantService.delete(plantLubricantToDelete.id);
			toast.success(
				`Plant lubricant association "${plantLubricantToDelete.plant?.code} - ${plantLubricantToDelete.lubricant?.code}" deleted successfully`
			);
			deleteDialogOpen = false;
			plantLubricantToDelete = null;
			loadPlantLubricants();
		} catch (error: any) {
			console.error('Error deleting plant lubricant:', error);
			toast.error(error.message || 'Failed to delete plant lubricant');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedPlantLubricants.length === 0) {
			toast.error('Please select at least one plant lubricant to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedPlantLubricants
					.filter((pl) => pl.id !== null)
					.map((pl) => plantLubricantService.delete(pl.id!))
			);

			toast.success(`${selectedPlantLubricants.length} plant lubricant(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedPlantLubricants = [];
			loadPlantLubricants();
		} catch (error: any) {
			console.error('Error deleting plant lubricants:', error);
			toast.error(error.message || 'Failed to delete plant lubricants');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadPlantLubricants();
	}

	function handleRefresh() {
		loadPlantLubricants();
	}

	function handleSelectionChange(selected: PlantLubricant[]) {
		selectedPlantLubricants = selected;
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Plant Lubricants</h1>
			<p class="text-muted-foreground">Manage plant lubricant associations</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New Association
		</Button>
	</div>

	<!-- Search and Actions -->
	<div class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="space-y-2">
				<label for="filter-plant" class="text-sm font-medium">Filter by Plant</label>
				<Input
					id="filter-plant"
					type="text"
					placeholder="Enter plant code and press Enter..."
					bind:value={filterPlant}
					onkeypress={handleKeyPress}
					disabled={isLoading}
				/>
			</div>
			<div class="space-y-2">
				<label for="filter-lubricant" class="text-sm font-medium">Filter by Lubricant</label>
				<Input
					id="filter-lubricant"
					type="text"
					placeholder="Enter lubricant code and press Enter..."
					bind:value={filterLubricant}
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

			{#if selectedPlantLubricants.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedPlantLubricants.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<PlantLubricantTable
		{plantLubricants}
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

<!-- Delete Single Plant Lubricant Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete Plant Lubricant"
	description={plantLubricantToDelete
		? `Are you sure you want to delete the association "${plantLubricantToDelete.plant?.code} - ${plantLubricantToDelete.lubricant?.code}"? This action cannot be undone.`
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
	title="Delete Multiple Plant Lubricants"
	description={`Are you sure you want to delete ${selectedPlantLubricants.length} plant lubricant association(s)? This action cannot be undone.`}
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
