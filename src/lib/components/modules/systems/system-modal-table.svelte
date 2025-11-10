<script lang="ts">
	import { onMount } from 'svelte';
	import { systemService } from '$lib/services/system.service';
	import type { System } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import SystemTable from './system-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { PAGINATION } from '$lib/shared';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';
	import PlantModalTable from '../plants/plant-modal-table.svelte';
	import AreaModalTable from '../areas/area-modal-table.svelte';

	interface Props {
		onselect?: (system: System) => void;
	}

	let { onselect }: Props = $props();

	let systems = $state<System[]>([]);
	let filteredSystems = $state<System[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });
	let areaSearch = $state({ id: null, description: '', readonly: false });

	onMount(() => {
		loadSystems();
	});

	async function loadSystems() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		systems = [];
		filteredSystems = [];
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar systems
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Incluir toda la jerarquía hacia arriba: account, plant y area
			if (hierarchy.account.id || accountSearch.id) {
				filters['account'] = { id: hierarchy.account.id || accountSearch.id };
			}
			if (hierarchy.plant.id || plantSearch.id) {
				filters['plant'] = { id: hierarchy.plant.id || plantSearch.id };
			}
			if (hierarchy.area.id || areaSearch.id) {
				filters['area'] = { id: hierarchy.area.id || areaSearch.id };
			}

			const response = await systemService.getAll({ pageSize: PAGINATION.MAX_PAGE_SIZE, filters });
			systems = response.rows;
			filteredSystems = systems;
		} catch (error) {
			console.error('Error loading systems:', error);
			toast.error('Failed to load systems');
			// Ensure data is cleared on error
			systems = [];
			filteredSystems = [];
		} finally {
			isLoading = false;
		}
	}

	// Function to reload systems when hierarchy filters change
	function handleHierarchyChange() {
		loadSystems();
	}

	function handleSearch() {
		const term = searchTerm.toLowerCase().trim();
		if (!term) {
			filteredSystems = systems;
			return;
		}

		filteredSystems = systems.filter(
			(system) =>
				system.code?.toLowerCase().includes(term) ||
				system.description?.toLowerCase().includes(term)
		);
	}

	function handleRowClick(system: System) {
		onselect?.(system);
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
			<h3 class="text-xs font-medium text-foreground">Filter Systems</h3>
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
					modalDescription="Choose a plant to filter systems"
					modalContent={PlantModalTable}
					hierarchyLevel="plant"
					onclear={() => {
						// Clear hierarchy store (also clears area, system)
						hierarchyStore.clearPlant();
						// Clear local state for all dependent levels
						plantSearch = { id: null, description: '', readonly: false };
						areaSearch = { id: null, description: '', readonly: false };
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
					modalDescription="Choose an area to filter systems"
					modalContent={AreaModalTable}
					hierarchyLevel="area"
					onclear={() => {
						// Clear hierarchy store
						hierarchyStore.clearArea();
						// Clear local state
						areaSearch = { id: null, description: '', readonly: false };
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
			<SystemTable
				systems={filteredSystems}
				onEdit={handleEdit}
				onDelete={handleDelete}
				hideActions={true}
				onRowClick={handleRowClick}
			/>
		</div>
	{/if}
</div>
