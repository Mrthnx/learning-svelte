<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { SystemTable } from '$lib/components/modules/systems';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { systemService } from '$lib/services/system.service';
	import type { System, PaginateResponse } from '$lib/types';
	import { hierarchyStore } from '$lib/store/hierarchy.store';

	let systems: System[] = $state([]);
	let selectedSystems: System[] = $state([]);
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
	let systemToDelete: System | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Load systems on mount
	onMount(() => {
		loadSystems();
	});

	async function loadSystems() {
		isLoading = true;
		try {
			const hierarchy = $hierarchyStore;
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

			// Aplicar filtros de jerarquía
			if (hierarchy.account.id) {
				filters['account'] = { id: hierarchy.account.id };
			}
			if (hierarchy.plant.id) {
				filters['plant'] = { id: hierarchy.plant.id };
			}
			if (hierarchy.area.id) {
				filters['area'] = { id: hierarchy.area.id };
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
