<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AreaTable } from '$lib/components/modules/areas';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw, Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { areaService } from '$lib/services/area.service';
	import type { Area, PaginateResponse } from '$lib/types';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '$lib/components/modules/accounts/account-modal-table.svelte';
	import PlantModalTable from '$lib/components/modules/plants/plant-modal-table.svelte';
	import { HierarchyNavigation } from '$lib/utils/hierarchy-navigation';

	let areas: Area[] = $state([]);
	let selectedAreas: Area[] = $state([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	// Modals
	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let areaToDelete: Area | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Load areas on mount
	onMount(() => {
		loadAreas();
	});
	async function loadAreas() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		areas = [];
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
			if (hierarchy.plant.id || plantSearch.id) {
				filters['plant'] = { id: hierarchy.plant.id || plantSearch.id };
			}
			if (hierarchy.area.id) {
				// filters['area'] = { id: hierarchy.area.id };
			}

			const response: PaginateResponse<Area> = await areaService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

			areas = response.rows;
			totalRecords = response.total;
		} catch (error: any) {
			console.error('Error loading areas:', error);
			toast.error(error.message || 'Failed to load areas');
			// Ensure data is cleared on error
			areas = [];
			totalRecords = 0;
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadAreas();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/areas/create');
	}

	function handleEdit(area: Area) {
		goto(`/database-setup/areas/edit/${area.id}`);
	}

	function handleDelete(area: Area) {
		areaToDelete = area;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!areaToDelete?.id) return;

		isDeleting = true;
		try {
			await areaService.delete(areaToDelete.id);
			toast.success(`Area "${areaToDelete.code}" deleted successfully`);
			deleteDialogOpen = false;
			areaToDelete = null;
			loadAreas();
		} catch (error: any) {
			console.error('Error deleting area:', error);
			toast.error(error.message || 'Failed to delete area');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedAreas.length === 0) {
			toast.error('Please select at least one area to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedAreas.filter((area) => area.id !== null).map((area) => areaService.delete(area.id!))
			);

			toast.success(`${selectedAreas.length} area(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedAreas = [];
			loadAreas();
		} catch (error: any) {
			console.error('Error deleting areas:', error);
			toast.error(error.message || 'Failed to delete areas');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadAreas();
	}

	function handleRefresh() {
		loadAreas();
	}

	function handleSelectionChange(selected: Area[]) {
		selectedAreas = selected;
	}

	function handleGoTo(area: Area) {
		HierarchyNavigation.goToSystems(
			area.id,
			area.description || area.name || area.code || `Area ${area.id}`
		);
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Areas</h1>
			<p class="text-muted-foreground">Manage your organization areas</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New Area
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
				<h3 class="text-sm font-semibold text-foreground">Search & Filter Areas</h3>
			</div>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
						modalDescription="Choose an account to filter areas"
						modalContent={AccountModalTable}
						hierarchyLevel="account"
						onclear={() => {
							// Clear hierarchy store (also clears plant, area, system)
							hierarchyStore.clearAccount();
							// Clear local state for all dependent levels
							accountSearch = { id: null, description: '', readonly: false };
							plantSearch = { id: null, description: '', readonly: false };
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

				<!-- Plant Filter -->
				<div class="space-y-2">
					<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
						>Plant</label
					>
					<SearchInput
						bind:value={plantSearch}
						placeholder="Select plant..."
						width="w-full"
						modalTitle="Select Plant"
						modalDescription="Choose a plant to filter areas"
						modalContent={PlantModalTable}
						hierarchyLevel="plant"
						onclear={() => {
							// Clear hierarchy store
							hierarchyStore.clearPlant();
							// Clear local state
							plantSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (plant) => {
								// Update hierarchy store (editable and persisted)
								hierarchyStore.updatePlant({
									id: plant.id,
									description: plant.description || plant.name || `Plant ${plant.id}`
								});
								// Update local state
								plantSearch = {
									id: plant.id,
									description: plant.description || plant.name || `Plant ${plant.id}`,
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
						>Area Code</label
					>
					<Input
						id="filter-code"
						type="text"
						placeholder="Enter area code..."
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

			{#if selectedAreas.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedAreas.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<AreaTable
		{areas}
		onEdit={handleEdit}
		onDelete={handleDelete}
		onGoTo={handleGoTo}
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

<!-- Delete Single Area Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete Area"
	description={areaToDelete
		? `Are you sure you want to delete "${areaToDelete.code}"? This action cannot be undone.`
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
	title="Delete Multiple Areas"
	description={`Are you sure you want to delete ${selectedAreas.length} area(s)? This action cannot be undone.`}
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
