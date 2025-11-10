<script lang="ts">
	import { onMount } from 'svelte';
	import { componentService } from '$lib/services/component.service';
	import type { Component } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import ComponentTable from './component-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { PAGINATION } from '$lib/shared';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';
	import PlantModalTable from '../plants/plant-modal-table.svelte';
	import AreaModalTable from '../areas/area-modal-table.svelte';
	import SystemModalTable from '../systems/system-modal-table.svelte';
	import AssetModalTable from '../assets/asset-modal-table.svelte';

	interface Props {
		onselect?: (component: Component) => void;
	}

	let { onselect }: Props = $props();

	let components = $state<Component[]>([]);
	let filteredComponents = $state<Component[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });
	let areaSearch = $state({ id: null, description: '', readonly: false });
	let systemSearch = $state({ id: null, description: '', readonly: false });
	let assetSearch = $state({ id: null, description: '', readonly: false });

	onMount(() => {
		loadComponents();
	});

	async function loadComponents() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		components = [];
		filteredComponents = [];
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar components
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Incluir toda la jerarquía hacia arriba: account, plant, area, system y asset
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

			const response = await componentService.getAll({ pageSize: PAGINATION.MAX_PAGE_SIZE, filters });
			components = response.rows;
			filteredComponents = components;
		} catch (error) {
			console.error('Error loading components:', error);
			toast.error('Failed to load components');
			// Ensure data is cleared on error
			components = [];
			filteredComponents = [];
		} finally {
			isLoading = false;
		}
	}

	// Function to reload components when hierarchy filters change
	function handleHierarchyChange() {
		loadComponents();
	}

	function handleSearch() {
		const term = searchTerm.toLowerCase().trim();
		if (!term) {
			filteredComponents = components;
			return;
		}

		filteredComponents = components.filter(
			(component) =>
				component.code?.toLowerCase().includes(term) ||
				component.description?.toLowerCase().includes(term) ||
				component.mawoi?.code?.toLowerCase().includes(term)
		);
	}

	function handleRowClick(component: Component) {
		onselect?.(component);
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
			<h3 class="text-xs font-medium text-foreground">Filter Components</h3>
		</div>

		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
					modalDescription="Choose an account to filter components"
					modalContent={AccountModalTable}
					hierarchyLevel="account"
					onclear={() => {
						// Clear hierarchy store (also clears plant, area, system)
						hierarchyStore.clearAccount();
						// Limpiar todos los hijos en cascada
						hierarchyStore.clearPlant();
						hierarchyStore.clearArea();
						hierarchyStore.clearSystem();
						// Clear local state for all dependent levels
						accountSearch = { id: null, description: '', readonly: false };
						plantSearch = { id: null, description: '', readonly: false };
						areaSearch = { id: null, description: '', readonly: false };
						systemSearch = { id: null, description: '', readonly: false };
						assetSearch = { id: null, description: '', readonly: false };
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
							areaSearch = { id: null, description: '', readonly: false };
							systemSearch = { id: null, description: '', readonly: false };
							assetSearch = { id: null, description: '', readonly: false };
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
					modalDescription="Choose a plant to filter components"
					modalContent={PlantModalTable}
					hierarchyLevel="plant"
					onclear={() => {
						// Clear hierarchy store (also clears area, system)
						hierarchyStore.clearPlant();
						// Limpiar hijos de plant (area y system)
						hierarchyStore.clearArea();
						hierarchyStore.clearSystem();
						// Clear local state for all dependent levels
						plantSearch = { id: null, description: '', readonly: false };
						areaSearch = { id: null, description: '', readonly: false };
						systemSearch = { id: null, description: '', readonly: false };
						assetSearch = { id: null, description: '', readonly: false };
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
							areaSearch = { id: null, description: '', readonly: false };
							systemSearch = { id: null, description: '', readonly: false };
							assetSearch = { id: null, description: '', readonly: false };
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
					modalDescription="Choose an area to filter components"
					modalContent={AreaModalTable}
					hierarchyLevel="area"
					onclear={() => {
						// Clear hierarchy store (also clears system)
						hierarchyStore.clearArea();
						// Limpiar hijo de area (system)
						hierarchyStore.clearSystem();
						// Clear local state for all dependent levels
						areaSearch = { id: null, description: '', readonly: false };
						systemSearch = { id: null, description: '', readonly: false };
						assetSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (area) => {
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
							assetSearch = { id: null, description: '', readonly: false };
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
					modalDescription="Choose a system to filter components"
					modalContent={SystemModalTable}
					hierarchyLevel="system"
					onclear={() => {
						// Clear hierarchy store (only system)
						hierarchyStore.clearSystem();
						// Clear local state
						systemSearch = { id: null, description: '', readonly: false };
						assetSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (system) => {
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
							assetSearch = { id: null, description: '', readonly: false };
							handleHierarchyChange();
						}
					}}
				/>
			</div>

			<!-- Asset Filter -->
			<div class="space-y-1.5">
				<label class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
					>Asset</label
				>
				<SearchInput
					bind:value={assetSearch}
					placeholder="Select asset..."
					width="w-full"
					modalTitle="Select Asset"
					modalDescription="Choose an asset to filter components"
					modalContent={AssetModalTable}
					hierarchyLevel="asset"
					onclear={() => {
						// Clear local state
						assetSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (asset) => {
							// Update local state (asset is not stored in hierarchy store)
							assetSearch = {
								id: asset.id,
								description: asset.description || asset.name || `Asset ${asset.id}`,
								readonly: false
							};
							handleHierarchyChange();
						}
					}}
				/>
			</div>
		</div>

		<!-- Text Search -->
		<div class="mt-3 flex gap-2">
			<Input
				bind:value={searchTerm}
				placeholder="Search by code, description, asset..."
				class="flex-1"
				oninput={handleSearch}
			/>
			<Button variant="outline" size="icon" onclick={handleSearch}>
				<Search class="h-4 w-4" />
			</Button>
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
			<ComponentTable
				components={filteredComponents}
				onEdit={handleEdit}
				onDelete={handleDelete}
				hideActions={true}
				onRowClick={handleRowClick}
			/>
		</div>
	{/if}
</div>