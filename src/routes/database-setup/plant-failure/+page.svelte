<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { PlantFailureTable } from '$lib/components/modules/plant-failures';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		plantFailureService,
		type PlantFailure,
		type PaginateResponse
	} from '$lib/services/plant-failure.service';

	let plantFailures: PlantFailure[] = $state([]);
	let selectedPlantFailures: PlantFailure[] = $state([]);
	let filterPlant = $state('');
	let filterFailureMode = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let plantFailureToDelete: PlantFailure | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	onMount(() => {
		loadPlantFailures();
	});

	async function loadPlantFailures() {
		isLoading = true;
		try {
			const filters: any = {};
			if (filterPlant.trim()) filters['plant.code'] = filterPlant.trim();
			if (filterFailureMode.trim()) filters['failureMode.code'] = filterFailureMode.trim();

			const response: PaginateResponse<PlantFailure> = await plantFailureService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

			plantFailures = response.rows;
			totalRecords = response.total;
		} catch (error: any) {
			console.error('Error loading plant failures:', error);
			toast.error(error.message || 'Failed to load plant failures');
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadPlantFailures();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/plant-failure/create');
	}

	function handleEdit(plantFailure: PlantFailure) {
		goto(`/database-setup/plant-failure/edit/${plantFailure.id}`);
	}

	function handleDelete(plantFailure: PlantFailure) {
		plantFailureToDelete = plantFailure;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!plantFailureToDelete?.id) return;

		isDeleting = true;
		try {
			await plantFailureService.delete(plantFailureToDelete.id);
			toast.success('Plant failure association deleted successfully');
			deleteDialogOpen = false;
			plantFailureToDelete = null;
			loadPlantFailures();
		} catch (error: any) {
			console.error('Error deleting plant failure:', error);
			toast.error(error.message || 'Failed to delete plant failure');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedPlantFailures.length === 0) {
			toast.error('Please select at least one plant failure to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedPlantFailures
					.filter((pf) => pf.id !== null)
					.map((pf) => plantFailureService.delete(pf.id!))
			);

			toast.success(`${selectedPlantFailures.length} plant failure(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedPlantFailures = [];
			loadPlantFailures();
		} catch (error: any) {
			console.error('Error deleting plant failures:', error);
			toast.error(error.message || 'Failed to delete plant failures');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadPlantFailures();
	}

	function handleRefresh() {
		loadPlantFailures();
	}

	function handleSelectionChange(selected: PlantFailure[]) {
		selectedPlantFailures = selected;
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Plant Failures</h1>
			<p class="text-muted-foreground">Manage plant failure mode associations</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New Association
		</Button>
	</div>

	<div class="flex flex-col gap-4">
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
				<label for="filter-failure-mode" class="text-sm font-medium">Filter by ID</label>
				<Input
					id="filter-failure-mode"
					type="text"
					placeholder="Enter failure mode ID and press Enter..."
					bind:value={filterFailureMode}
					onkeypress={handleKeyPress}
					disabled={isLoading}
				/>
			</div>
		</div>

		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handleRefresh} disabled={isLoading} class="gap-2">
					<RefreshCw class={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
					Reload
				</Button>
				<Button onclick={handleSearch} disabled={isLoading} class="gap-2">Search</Button>
			</div>

			{#if selectedPlantFailures.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedPlantFailures.length})
				</Button>
			{/if}
		</div>
	</div>

	<PlantFailureTable
		{plantFailures}
		onEdit={handleEdit}
		onDelete={handleDelete}
		onSelectionChange={handleSelectionChange}
		selectable={true}
	/>

	<Pagination
		{currentPage}
		{totalPages}
		{totalRecords}
		{pageSize}
		onPageChange={handlePageChange}
		{isLoading}
	/>
</div>

<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete Plant Failure"
	description={plantFailureToDelete
		? `Are you sure you want to delete this association? This action cannot be undone.`
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

<AlertModal
	bind:open={bulkDeleteDialogOpen}
	type="confirm"
	title="Delete Multiple Plant Failures"
	description={`Are you sure you want to delete ${selectedPlantFailures.length} plant failure association(s)? This action cannot be undone.`}
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
