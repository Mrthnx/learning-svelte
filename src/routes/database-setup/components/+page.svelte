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
	import {
		componentService,
		type Component,
		type PaginateResponse
	} from '$lib/services/component.service';

	let components: Component[] = $state([]);
	let selectedComponents: Component[] = $state([]);
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
