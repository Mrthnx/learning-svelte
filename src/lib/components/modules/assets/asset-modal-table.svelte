<script lang="ts">
	import { onMount } from 'svelte';
	import { assetService } from '$lib/services/asset.service';
	import type { Asset } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import AssetTable from './asset-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';
	import PlantModalTable from '../plants/plant-modal-table.svelte';
	import AreaModalTable from '../areas/area-modal-table.svelte';
	import SystemModalTable from '../systems/system-modal-table.svelte';
	import { Pagination } from '$lib/components/me';

	interface Props {
		onselect?: (asset: Asset) => void;
	}

	let { onselect }: Props = $props();

	let assets = $state<Asset[]>([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);

	// Pagination states
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });
	let areaSearch = $state({ id: null, description: '', readonly: false });
	let systemSearch = $state({ id: null, description: '', readonly: false });

	onMount(() => {
		loadAssets();
	});

	async function loadAssets() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		assets = [];
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar assets
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Aplicar filtro de code y description
			if (filterCode.trim()) {
				filters.code = filterCode.trim();
			}
			if (filterDescription.trim()) {
				filters.description = filterDescription.trim();
			}

			// Incluir toda la jerarquía hacia arriba: account, plant, area y system
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

			const response = await assetService.getAll({
				page: currentPage,
				pageSize,
				filters
			});
			assets = response.rows;
			totalRecords = response.total;
		} catch (error) {
			console.error('Error loading assets:', error);
			toast.error('Failed to load assets');
			// Ensure data is cleared on error
			assets = [];
		} finally {
			isLoading = false;
		}
	}

	// Function to reload assets when hierarchy filters change
	function handleHierarchyChange() {
		loadAssets();
	}

	function handleSearch() {
		// Resetear a la primera página y recargar datos
		currentPage = 1;
		loadAssets();
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadAssets();
	}

	// Functions for table props
	function handleEdit(asset: Asset) {
		onselect?.(asset);
	}

	function handleDelete() {
		// Not used in modal
	}
</script>

<div class="space-y-4">
	<!-- Unified Filters Section -->
	<div class="rounded-lg border bg-card p-3 shadow-sm">
		<div class="mb-3 flex items-center gap-2">
			<div class="rounded-full bg-primary/10 p-1">
				<Search class="h-3 w-3 text-primary" />
			</div>
			<h3 class="text-xs font-medium text-foreground">Filter Assets</h3>
		</div>

		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
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
					modalDescription=""
					modalContent={AccountModalTable}
					hierarchyLevel="account"
					onclear={() => {
						// Clear hierarchy store (also clears plant, area, system)
						hierarchyStore.clearAccount();
						// Clear local state for all dependent levels
						accountSearch = { id: null, description: '', readonly: false };
						plantSearch = { id: null, description: '', readonly: false };
						areaSearch = { id: null, description: '', readonly: false };
						systemSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (account: any) => {
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
							areaSearch = { id: null, description: '', readonly: false };
							systemSearch = { id: null, description: '', readonly: false };
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
					modalDescription=""
					modalContent={PlantModalTable}
					hierarchyLevel="plant"
					onclear={() => {
						// Clear hierarchy store (also clears area, system)
						hierarchyStore.clearPlant();
						// Clear local state for all dependent levels
						plantSearch = { id: null, description: '', readonly: false };
						areaSearch = { id: null, description: '', readonly: false };
						systemSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (plant: any) => {
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
							areaSearch = { id: null, description: '', readonly: false };
							systemSearch = { id: null, description: '', readonly: false };
							handleHierarchyChange();
						}
					}}
				/>
			</div>

			<!-- Area Filter -->
			<div class="space-y-1.5">
				<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Area</label
				>
				<SearchInput
					bind:value={areaSearch}
					placeholder="Select area..."
					width="w-full"
					modalTitle="Select Area"
					modalDescription=""
					modalContent={AreaModalTable}
					hierarchyLevel="area"
					onclear={() => {
						// Clear hierarchy store (also clears system)
						hierarchyStore.clearArea();
						// Clear local state for all dependent levels
						areaSearch = { id: null, description: '', readonly: false };
						systemSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (area: any) => {
							// Update hierarchy store (editable and persisted)
							hierarchyStore.updateArea({
								id: area.id,
								description: area.description || area.name || `Area ${area.id}`
							});
							// Limpiar hijo cuando se selecciona un area diferente
							hierarchyStore.clearSystem();
							// Update local state
							areaSearch = {
								id: area.id,
								description: area.description || area.name || `Area ${area.id}`,
								readonly: false
							};
							systemSearch = { id: null, description: '', readonly: false };
							handleHierarchyChange();
						}
					}}
				/>
			</div>

			<!-- System Filter -->
			<div class="space-y-1.5">
				<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
					>System</label
				>
				<SearchInput
					bind:value={systemSearch}
					placeholder="Select system..."
					width="w-full"
					modalTitle="Select System"
					modalDescription=""
					modalContent={SystemModalTable}
					hierarchyLevel="system"
					onclear={() => {
						// Clear hierarchy store (only system)
						hierarchyStore.clearSystem();
						// Clear local state
						systemSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (system: any) => {
							// Update hierarchy store (editable and persisted)
							hierarchyStore.updateSystem({
								id: system.id,
								description: system.description || system.name || `System ${system.id}`
							});
							// Update local state
							systemSearch = {
								id: system.id,
								description: system.description || system.name || `System ${system.id}`,
								readonly: false
							};
							handleHierarchyChange();
						}
					}}
				/>
			</div>

			<!-- Code Filter -->
			<div class="space-y-1.5">
				<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Code</label
				>
				<Input
					bind:value={filterCode}
					placeholder="Enter code..."
					class="flex-1 text-sm"
					oninput={handleSearch}
				/>
			</div>

			<!-- Description Filter -->
			<div class="space-y-1.5">
				<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
					>Description</label
				>
				<Input
					bind:value={filterDescription}
					placeholder="Enter description..."
					class="flex-1 text-sm"
					oninput={handleSearch}
				/>
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
			<AssetTable {assets} onEdit={handleEdit} onDelete={handleDelete} />
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
