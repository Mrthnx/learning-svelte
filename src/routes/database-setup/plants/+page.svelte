<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { PlantTable } from '$lib/components/modules/plants';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw, Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { plantService } from '$lib/services/plant.service';
	import type { Plant, PaginateResponse } from '$lib/types';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '$lib/components/modules/accounts/account-modal-table.svelte';

	let plants: Plant[] = $state([]);
	let selectedPlants: Plant[] = $state([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });

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
	// Clear previous data to avoid showing stale results
	plants = [];
	totalRecords = 0;
	try {
			const hierarchy = $hierarchyStore;
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

			// Aplicar filtros de jerarquía
			if (hierarchy.account.id || accountSearch.id) {
				filters['account'] = { id: hierarchy.account.id || accountSearch.id };
			}
			if (hierarchy.plant.id) {
				filters['plant'] = { id: hierarchy.plant.id };
			}

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
		// Ensure data is cleared on error
		plants = [];
		totalRecords = 0;
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
		<!-- Unified Filters Section -->
		<div class="rounded-lg border bg-card p-4 shadow-sm">
			<div class="mb-4 flex items-center gap-2">
				<div class="rounded-full bg-primary/10 p-1.5">
					<Search class="h-4 w-4 text-primary" />
				</div>
				<h3 class="text-sm font-semibold text-foreground">Search & Filter Plants</h3>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<!-- Account Filter -->
				<div class="space-y-2">
					<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
						>Account</label
					>
					<SearchInput
						bind:value={accountSearch}
						placeholder="Select account..."
						width="w-full"
						modalTitle="Select Account"
						modalDescription="Choose an account to filter plants"
						modalContent={AccountModalTable}
						hierarchyLevel="account"
						onclear={() => {
							// Clear hierarchy store
							hierarchyStore.clearAccount();
							// Clear local state
							accountSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (account) => {
								// Update hierarchy store (editable and persisted)
								hierarchyStore.updateAccount({
									id: account.id,
									description: account.description || account.name || `Account ${account.id}`
								});
								// Update local state
								accountSearch = {
									id: account.id,
									description: account.description || account.name || `Account ${account.id}`,
									readonly: false
								};
								handleSearch();
							}
						}}
					/>
				</div>

				<!-- Code Filter -->
				<div class="space-y-2">
					<label
						for="filter-code"
						class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
						>Plant Code</label
					>
					<Input
						id="filter-code"
						type="text"
						placeholder="Enter plant code..."
						bind:value={filterCode}
						onkeypress={handleKeyPress}
						disabled={isLoading}
						class="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
					/>
				</div>

				<!-- Description Filter -->
				<div class="space-y-2">
					<label
						for="filter-description"
						class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
						>Description</label
					>
					<Input
						id="filter-description"
						type="text"
						placeholder="Enter description..."
						bind:value={filterDescription}
						onkeypress={handleKeyPress}
						disabled={isLoading}
						class="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
					/>
				</div>
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
