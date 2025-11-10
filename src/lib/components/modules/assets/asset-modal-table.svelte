<script lang="ts">
	import { onMount } from 'svelte';
	import { assetService } from '$lib/services/asset.service';
	import type { Asset } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import AssetTable from './asset-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { PAGINATION } from '$lib/shared';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';
	import PlantModalTable from '../plants/plant-modal-table.svelte';
	import AreaModalTable from '../areas/area-modal-table.svelte';
	import SystemModalTable from '../systems/system-modal-table.svelte';

	interface Props {
		onselect?: (asset: Asset) => void;
	}

	let { onselect }: Props = $props();

	let assets = $state<Asset[]>([]);
	let filteredAssets = $state<Asset[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

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
		filteredAssets = [];
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar assets
			const hierarchy = $hierarchyStore;
			const filters: any = {};

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

			const response = await assetService.getAll({ pageSize: PAGINATION.MAX_PAGE_SIZE, filters });
			assets = response.rows;
			filteredAssets = assets;
		} catch (error) {
			console.error('Error loading assets:', error);
			toast.error('Failed to load assets');
			// Ensure data is cleared on error
			assets = [];
			filteredAssets = [];
		} finally {
			isLoading = false;
		}
	}

	// Function to reload assets when hierarchy filters change
	function handleHierarchyChange() {
		loadAssets();
	}

	function handleSearch() {
		const term = searchTerm.toLowerCase().trim();
		if (!term) {
			filteredAssets = assets;
			return;
		}

		filteredAssets = assets.filter(
			(asset) =>
				asset.code?.toLowerCase().includes(term) ||
				asset.description?.toLowerCase().includes(term)
		);
	}

	function handleRowClick(asset: Asset) {
		onselect?.(asset);
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
			<h3 class="text-xs font-medium text-foreground">Filter Assets</h3>
		</div>

		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
					modalDescription="Choose an account to filter assets"
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
					modalDescription="Choose a plant to filter assets"
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
					modalDescription="Choose an area to filter assets"
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
					modalDescription="Choose a system to filter assets"
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
				placeholder="Search by code, description..."
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
			<AssetTable
				assets={filteredAssets}
				onEdit={handleEdit}
				onDelete={handleDelete}
				hideActions={true}
				onRowClick={handleRowClick}
			/>
		</div>
	{/if}
</div>