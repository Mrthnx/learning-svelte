<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { SystemTable } from '$lib/components/modules/systems';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw, Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { systemService } from '$lib/services/system.service';
	import type { System, PaginateResponse } from '$lib/types';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '$lib/components/modules/accounts/account-modal-table.svelte';
	import PlantModalTable from '$lib/components/modules/plants/plant-modal-table.svelte';
	import AreaModalTable from '$lib/components/modules/areas/area-modal-table.svelte';

	let systems: System[] = $state([]);
	let selectedSystems: System[] = $state([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });
	let areaSearch = $state({ id: null, description: '', readonly: false });

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	// Modals
	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let systemToDelete: System | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Load systems on mount
	onMount(() => {
		loadSystems();
	});

	async function loadSystems() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		systems = [];
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
			if (hierarchy.area.id || areaSearch.id) {
				filters['area'] = { id: hierarchy.area.id || areaSearch.id };
			}
			if (hierarchy.system.id) {
				filters['system'] = { id: hierarchy.system.id };
			}

			const response: PaginateResponse<System> = await systemService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

			systems = response.rows;
			totalRecords = response.total;
		} catch (error: any) {
			console.error('Error loading systems:', error);
			toast.error(error.message || 'Failed to load systems');
			// Ensure data is cleared on error
			systems = [];
			totalRecords = 0;
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadSystems();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/systems/create');
	}

	function handleEdit(system: System) {
		goto(`/database-setup/systems/edit/${system.id}`);
	}

	function handleDelete(system: System) {
		systemToDelete = system;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!systemToDelete?.id) return;

		isDeleting = true;
		try {
			await systemService.delete(systemToDelete.id);
			toast.success(`System "${systemToDelete.code}" deleted successfully`);
			deleteDialogOpen = false;
			systemToDelete = null;
			loadSystems();
		} catch (error: any) {
			console.error('Error deleting system:', error);
			toast.error(error.message || 'Failed to delete system');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedSystems.length === 0) {
			toast.error('Please select at least one system to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedSystems
					.filter((system) => system.id !== null)
					.map((system) => systemService.delete(system.id!))
			);

			toast.success(`${selectedSystems.length} system(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedSystems = [];
			loadSystems();
		} catch (error: any) {
			console.error('Error deleting systems:', error);
			toast.error(error.message || 'Failed to delete systems');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadSystems();
	}

	function handleRefresh() {
		loadSystems();
	}

	function handleSelectionChange(selected: System[]) {
		selectedSystems = selected;
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Systems</h1>
			<p class="text-muted-foreground">Manage your organization systems</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New System
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
				<h3 class="text-sm font-semibold text-foreground">Search & Filter Systems</h3>
			</div>

			<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
						modalDescription="Choose an account to filter systems"
						modalContent={AccountModalTable}
						hierarchyLevel="account"
						onclear={() => {
							// Clear hierarchy store (also clears plant, area, system)
							hierarchyStore.clearAccount();
							// Clear local state for all dependent levels
							accountSearch = { id: null, description: '', readonly: false };
							plantSearch = { id: null, description: '', readonly: false };
							areaSearch = { id: null, description: '', readonly: false };
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
						modalDescription="Choose a plant to filter systems"
						modalContent={PlantModalTable}
						hierarchyLevel="plant"
						onclear={() => {
							// Clear hierarchy store (also clears area, system)
							hierarchyStore.clearPlant();
							// Clear local state for all dependent levels
							plantSearch = { id: null, description: '', readonly: false };
							areaSearch = { id: null, description: '', readonly: false };
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

				<!-- Area Filter -->
				<div class="space-y-2">
					<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
						>Area</label
					>
					<SearchInput
						bind:value={areaSearch}
						placeholder="Select area..."
						width="w-full"
						modalTitle="Select Area"
						modalDescription="Choose an area to filter systems"
						modalContent={AreaModalTable}
						hierarchyLevel="area"
						onclear={() => {
							// Clear hierarchy store
							hierarchyStore.clearArea();
							// Clear local state
							areaSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (area) => {
								// Update hierarchy store (editable and persisted)
								hierarchyStore.updateArea({
									id: area.id,
									description: area.description || area.name || `Area ${area.id}`
								});
								// Update local state
								areaSearch = {
									id: area.id,
									description: area.description || area.name || `Area ${area.id}`,
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
						>System Code</label
					>
					<Input
						id="filter-code"
						type="text"
						placeholder="Enter system code..."
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

			{#if selectedSystems.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedSystems.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<SystemTable
		{systems}
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

<!-- Delete Single System Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete System"
	description={systemToDelete
		? `Are you sure you want to delete "${systemToDelete.code}"? This action cannot be undone.`
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
	title="Delete Multiple Systems"
	description={`Are you sure you want to delete ${selectedSystems.length} system(s)? This action cannot be undone.`}
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
