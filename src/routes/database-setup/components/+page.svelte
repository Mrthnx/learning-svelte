<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { ComponentTable } from '$lib/components/modules/components';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { componentService } from '$lib/services/component.service';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import { AccountModalTable } from '$lib/components/modules/accounts';
	import { PlantModalTable } from '$lib/components/modules/plants';
	import { AreaModalTable } from '$lib/components/modules/areas';
	import { SystemModalTable } from '$lib/components/modules/systems';
	import { AssetModalTable } from '$lib/components/modules/assets';
	import { type Component, type PaginateResponse } from '$lib/types';

	let components: Component[] = $state([]);
	let selectedComponents: Component[] = $state([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });
	let areaSearch = $state({ id: null, description: '', readonly: false });
	let systemSearch = $state({ id: null, description: '', readonly: false });
	let assetSearch = $state({ id: null, description: '', readonly: false });

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	// Modals
	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let componentToDelete: Component | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Load components on mount
	onMount(() => {
		loadComponents();
	});

	async function loadComponents() {
		isLoading = true;
		try {
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

			// Add hierarchy filters
			const hierarchy = $hierarchyStore;
			if (hierarchy.account.id || accountSearch.id) {
				filters['account'] = { id: hierarchy.account.id || accountSearch.id };
			}
			if (hierarchy.plant.id || plantSearch.id) {
				filters['plant'] = { id: hierarchy.plant.id || plantSearch.id };
			}
			if (hierarchy.area.id || areaSearch.id) {
				filters['area'] = { id: hierarchy.area.id || areaSearch.id };
			}
			if (hierarchy.system.id || systemSearch.id) {
				filters['system'] = { id: hierarchy.system.id || systemSearch.id };
			}
			if (assetSearch.id) {
				filters['asset'] = { id: assetSearch.id };
			}

			const response: PaginateResponse<Component> = await componentService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

			components = response.rows;
			totalRecords = response.total;
		} catch (error: any) {
			console.error('Error loading components:', error);
			toast.error(error.message || 'Failed to load components');
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadComponents();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/components/create');
	}

	function handleEdit(component: Component) {
		goto(`/database-setup/components/edit/${component.id}`);
	}

	function handleDelete(component: Component) {
		componentToDelete = component;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!componentToDelete?.id) return;

		isDeleting = true;
		try {
			await componentService.delete(componentToDelete.id);
			toast.success(`Component "${componentToDelete.code}" deleted successfully`);
			deleteDialogOpen = false;
			componentToDelete = null;
			loadComponents();
		} catch (error: any) {
			console.error('Error deleting component:', error);
			toast.error(error.message || 'Failed to delete component');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedComponents.length === 0) {
			toast.error('Please select at least one component to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedComponents
					.filter((component) => component.id !== null)
					.map((component) => componentService.delete(component.id!))
			);

			toast.success(`${selectedComponents.length} component(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedComponents = [];
			loadComponents();
		} catch (error: any) {
			console.error('Error deleting components:', error);
			toast.error(error.message || 'Failed to delete components');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadComponents();
	}

	function handleRefresh() {
		loadComponents();
	}

	function handleSelectionChange(selected: Component[]) {
		selectedComponents = selected;
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Components</h1>
			<p class="text-muted-foreground">Manage your organization components</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New Component
		</Button>
	</div>

	<!-- Search and Actions -->
	<div class="flex flex-col gap-4">
		<!-- Hierarchy Filters -->
		<div class="rounded-lg border bg-card p-4 shadow-sm">
			<h3 class="mb-3 text-sm font-medium text-foreground">Hierarchy Filters</h3>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				<!-- Account Filter -->
				<div class="space-y-2">
					<label class="text-sm font-medium">Account</label>
					<SearchInput
						bind:value={accountSearch}
						placeholder="Select account..."
						width="w-full"
						modalTitle="Select Account"
						modalDescription="Choose an account to filter components"
						modalContent={AccountModalTable}
						hierarchyLevel="account"
						onclear={() => {
							hierarchyStore.clearAccount();
							hierarchyStore.clearPlant();
							hierarchyStore.clearArea();
							hierarchyStore.clearSystem();
							accountSearch = { id: null, description: '', readonly: false };
							plantSearch = { id: null, description: '', readonly: false };
							areaSearch = { id: null, description: '', readonly: false };
							systemSearch = { id: null, description: '', readonly: false };
							assetSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (account) => {
								hierarchyStore.updateAccount({
									id: account.id,
									description: account.description || account.name || `Account ${account.id}`
								});
								hierarchyStore.clearPlant();
								hierarchyStore.clearArea();
								hierarchyStore.clearSystem();
								accountSearch = {
									id: account.id,
									description: account.description || account.name || `Account ${account.id}`,
									readonly: false
								};
								plantSearch = { id: null, description: '', readonly: false };
								areaSearch = { id: null, description: '', readonly: false };
								systemSearch = { id: null, description: '', readonly: false };
								assetSearch = { id: null, description: '', readonly: false };
								handleSearch();
							}
						}}
					/>
				</div>

				<!-- Plant Filter -->
				<div class="space-y-2">
					<label class="text-sm font-medium">Plant</label>
					<SearchInput
						bind:value={plantSearch}
						placeholder="Select plant..."
						width="w-full"
						modalTitle="Select Plant"
						modalDescription="Choose a plant to filter components"
						modalContent={PlantModalTable}
						hierarchyLevel="plant"
						onclear={() => {
							hierarchyStore.clearPlant();
							hierarchyStore.clearArea();
							hierarchyStore.clearSystem();
							plantSearch = { id: null, description: '', readonly: false };
							areaSearch = { id: null, description: '', readonly: false };
							systemSearch = { id: null, description: '', readonly: false };
							assetSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (plant) => {
								hierarchyStore.updatePlant({
									id: plant.id,
									description: plant.description || plant.name || `Plant ${plant.id}`
								});
								hierarchyStore.clearArea();
								hierarchyStore.clearSystem();
								plantSearch = {
									id: plant.id,
									description: plant.description || plant.name || `Plant ${plant.id}`,
									readonly: false
								};
								areaSearch = { id: null, description: '', readonly: false };
								systemSearch = { id: null, description: '', readonly: false };
								assetSearch = { id: null, description: '', readonly: false };
								handleSearch();
							}
						}}
					/>
				</div>

				<!-- Area Filter -->
				<div class="space-y-2">
					<label class="text-sm font-medium">Area</label>
					<SearchInput
						bind:value={areaSearch}
						placeholder="Select area..."
						width="w-full"
						modalTitle="Select Area"
						modalDescription="Choose an area to filter components"
						modalContent={AreaModalTable}
						hierarchyLevel="area"
						onclear={() => {
							hierarchyStore.clearArea();
							hierarchyStore.clearSystem();
							areaSearch = { id: null, description: '', readonly: false };
							systemSearch = { id: null, description: '', readonly: false };
							assetSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (area) => {
								hierarchyStore.updateArea({
									id: area.id,
									description: area.description || area.name || `Area ${area.id}`
								});
								hierarchyStore.clearSystem();
								areaSearch = {
									id: area.id,
									description: area.description || area.name || `Area ${area.id}`,
									readonly: false
								};
								systemSearch = { id: null, description: '', readonly: false };
								assetSearch = { id: null, description: '', readonly: false };
								handleSearch();
							}
						}}
					/>
				</div>

				<!-- System Filter -->
				<div class="space-y-2">
					<label class="text-sm font-medium">System</label>
					<SearchInput
						bind:value={systemSearch}
						placeholder="Select system..."
						width="w-full"
						modalTitle="Select System"
						modalDescription="Choose a system to filter components"
						modalContent={SystemModalTable}
						hierarchyLevel="system"
						onclear={() => {
							hierarchyStore.clearSystem();
							systemSearch = { id: null, description: '', readonly: false };
							assetSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (system) => {
								hierarchyStore.updateSystem({
									id: system.id,
									description: system.description || system.name || `System ${system.id}`
								});
								systemSearch = {
									id: system.id,
									description: system.description || system.name || `System ${system.id}`,
									readonly: false
								};
								assetSearch = { id: null, description: '', readonly: false };
								handleSearch();
							}
						}}
					/>
				</div>

				<!-- Asset Filter -->
				<div class="space-y-2">
					<label class="text-sm font-medium">Asset</label>
					<SearchInput
						bind:value={assetSearch}
						placeholder="Select asset..."
						width="w-full"
						modalTitle="Select Asset"
						modalDescription="Choose an asset to filter components"
						modalContent={AssetModalTable}
						hierarchyLevel="asset"
						onclear={() => {
							assetSearch = { id: null, description: '', readonly: false };
							handleSearch();
						}}
						modalContentProps={{
							onselect: (asset) => {
								assetSearch = {
									id: asset.id,
									description: asset.description || asset.name || `Asset ${asset.id}`,
									readonly: false
								};
								handleSearch();
							}
						}}
					/>
				</div>
			</div>
		</div>

		<!-- Text Filters -->
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

			{#if selectedComponents.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedComponents.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<ComponentTable
		{components}
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

<!-- Delete Single Component Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete Component"
	description={componentToDelete
		? `Are you sure you want to delete "${componentToDelete.code}"? This action cannot be undone.`
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
	title="Delete Multiple Components"
	description={`Are you sure you want to delete ${selectedComponents.length} component(s)? This action cannot be undone.`}
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
