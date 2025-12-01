<script lang="ts">
	import { onMount } from 'svelte';
	import { areaService } from '$lib/services/area.service';
	import type { Area } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import AreaTable from './area-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { PAGINATION } from '$lib/shared';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';
	import PlantModalTable from '../plants/plant-modal-table.svelte';
	import { Pagination } from '$lib/components/me';

	interface Props {
		onselect?: (area: Area) => void;
	}

	let { onselect }: Props = $props();

	let areas = $state<Area[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	// Pagination states
	let currentPage = $state(1);
	let pageSize = $state(20);
	let totalRecords = $state(0);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });

	onMount(() => {
		loadAreas();
	});

	async function loadAreas() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		areas = [];
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar areas
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Aplicar filtro de búsqueda por texto
			if (searchTerm.trim()) {
				filters.search = searchTerm.trim();
			}

			// Incluir toda la jerarquía hacia arriba: account y plant
			if (hierarchy.account.id || accountSearch.id) {
				filters['account'] = { id: hierarchy.account.id || accountSearch.id };
			}
			if (hierarchy.plant.id || plantSearch.id) {
				filters['plant'] = { id: hierarchy.plant.id || plantSearch.id };
			}

			const response = await areaService.getAll({
				page: currentPage,
				pageSize,
				filters
			});
			areas = response.rows;
			totalRecords = response.total;
		} catch (error) {
			console.error('Error loading areas:', error);
			toast.error('Failed to load areas');
			// Ensure data is cleared on error
			areas = [];
		} finally {
			isLoading = false;
		}
	}

	// Function to reload areas when hierarchy filters change
	function handleHierarchyChange() {
		loadAreas();
	}

	function handleSearch() {
		// Resetear a la primera página y recargar datos
		currentPage = 1;
		loadAreas();
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadAreas();
	}

	function handleRowClick(area: Area) {
		onselect?.(area);
	}

	// Dummy functions for table props (not used in modal)
	function handleEdit() {}
	function handleDelete() {}
</script>

<div class="space-y-4">
	<!-- Unified Filters Section -->
	<div class="rounded-lg border bg-card p-3 shadow-sm">
		<div class="mb-3 flex items-center gap-2">
			<div class="rounded-full bg-primary/10 p-1">
				<Search class="h-3 w-3 text-primary" />
			</div>
			<h3 class="text-xs font-medium text-foreground">Filter Areas</h3>
		</div>

		<div class="grid gap-3 sm:grid-cols-3">
			<!-- Account Filter -->
			<div class="space-y-1.5">
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
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (account) => {
							// Update hierarchy store (editable and persisted)
							hierarchyStore.updateAccount({
								id: account.id,
								description: account.description || account.name || `Account ${account.id}`
							});
							// Limpiar todos los hijos cuando se selecciona un account diferente
							hierarchyStore.clearPlant();
							hierarchyStore.clearArea();
							hierarchyStore.clearSystem();
							// Update local state
							accountSearch = {
								id: account.id,
								description: account.description || account.name || `Account ${account.id}`,
								readonly: false
							};
							plantSearch = { id: null, description: '', readonly: false };
							handleHierarchyChange();
						}
					}}
				/>
			</div>

			<!-- Plant Filter -->
			<div class="space-y-1.5">
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
						// Limpiar hijos de plant (area y system)
						hierarchyStore.clearArea();
						hierarchyStore.clearSystem();
						// Clear local state
						plantSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (plant) => {
							// Update hierarchy store (editable and persisted)
							hierarchyStore.updatePlant({
								id: plant.id,
								description: plant.description || plant.name || `Plant ${plant.id}`
							});
							// Limpiar hijos cuando se selecciona un plant diferente
							hierarchyStore.clearArea();
							hierarchyStore.clearSystem();
							// Update local state
							plantSearch = {
								id: plant.id,
								description: plant.description || plant.name || `Plant ${plant.id}`,
								readonly: false
							};
							handleHierarchyChange();
						}
					}}
				/>
			</div>

			<!-- Search Text -->
			<div class="space-y-1.5">
				<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
					>Search Text</label
				>
				<div class="flex gap-2">
					<Input
						bind:value={searchTerm}
						placeholder="Search by code, description..."
						class="flex-1 text-sm"
						oninput={handleSearch}
					/>
					<Button variant="outline" size="sm" onclick={handleSearch}>
						<Search class="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
			></div>
		</div>
	{:else}
		<div class="max-h-[60vh] overflow-auto rounded-md border">
			<AreaTable
				areas={areas}
				onEdit={handleEdit}
				onDelete={handleDelete}
				hideActions={true}
				onRowClick={handleRowClick}
			/>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<Pagination
				{currentPage}
				{totalPages}
				{totalRecords}
				{pageSize}
				onPageChange={handlePageChange}
				{isLoading}
			/>
		{/if}
	{/if}
</div>
