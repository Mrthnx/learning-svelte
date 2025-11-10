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
	<!-- Hierarchy Filters -->
	<div class="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-3">
		<div>
			<label class="text-xs font-medium text-muted-foreground">Account</label>
			<div class="mt-1">
				<SearchInput
					bind:value={accountSearch}
					placeholder="Filter by account..."
					width="w-full"
					modalTitle="Select Account"
					modalDescription="Choose an account to filter systems"
					modalContent={AccountModalTable}
					hierarchyLevel="account"
					onclear={() => {
						accountSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (account) => {
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
		</div>
		<div>
			<label class="text-xs font-medium text-muted-foreground">Plant</label>
			<div class="mt-1">
				<SearchInput
					bind:value={plantSearch}
					placeholder="Filter by plant..."
					width="w-full"
					modalTitle="Select Plant"
					modalDescription="Choose a plant to filter systems"
					modalContent={PlantModalTable}
					hierarchyLevel="plant"
					onclear={() => {
						plantSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (plant) => {
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
		</div>
		<div>
			<label class="text-xs font-medium text-muted-foreground">Area</label>
			<div class="mt-1">
				<SearchInput
					bind:value={areaSearch}
					placeholder="Filter by area..."
					width="w-full"
					modalTitle="Select Area"
					modalDescription="Choose an area to filter systems"
					modalContent={AreaModalTable}
					hierarchyLevel="area"
					onclear={() => {
						areaSearch = { id: null, description: '', readonly: false };
						handleHierarchyChange();
					}}
					modalContentProps={{
						onselect: (area) => {
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
		</div>
	</div>

	<!-- Search by text -->
	<div class="flex gap-2">
		<Input
			bind:value={searchTerm}
			placeholder="Search by code or description..."
			class="flex-1"
			oninput={handleSearch}
		/>
		<Button variant="outline" size="icon" onclick={handleSearch}>
			<Search class="h-4 w-4" />
		</Button>
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
