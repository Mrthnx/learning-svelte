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

	interface Props {
		onselect?: (area: Area) => void;
	}

	let { onselect }: Props = $props();

	let areas = $state<Area[]>([]);
	let filteredAreas = $state<Area[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });

	onMount(() => {
		loadAreas();
	});

	async function loadAreas() {
		isLoading = true;
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar areas
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Incluir toda la jerarquía hacia arriba: account y plant
			if (hierarchy.account.id || accountSearch.id) {
				filters['account'] = { id: hierarchy.account.id || accountSearch.id };
			}
			if (hierarchy.plant.id || plantSearch.id) {
				filters['plant'] = { id: hierarchy.plant.id || plantSearch.id };
			}

			const response = await areaService.getAll({ pageSize: PAGINATION.MAX_PAGE_SIZE, filters });
			areas = response.rows;
			filteredAreas = areas;
		} catch (error) {
			console.error('Error loading areas:', error);
			toast.error('Failed to load areas');
		} finally {
			isLoading = false;
		}
	}

	// Function to reload areas when hierarchy filters change
	function handleHierarchyChange() {
		loadAreas();
	}

	function handleSearch() {
		const term = searchTerm.toLowerCase().trim();
		if (!term) {
			filteredAreas = areas;
			return;
		}

		filteredAreas = areas.filter(
			(area) =>
				area.code?.toLowerCase().includes(term) || area.description?.toLowerCase().includes(term)
		);
	}

	function handleRowClick(area: Area) {
		onselect?.(area);
	}

	// Dummy functions for table props (not used in modal)
	function handleEdit() {}
	function handleDelete() {}
</script>

<div class="space-y-4">
	<!-- Hierarchy Filters -->
	<div class="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
		<div>
			<label class="text-xs font-medium text-muted-foreground">Account</label>
			<div class="mt-1">
				<SearchInput
					bind:value={accountSearch}
					placeholder="Filter by account..."
					width="w-full"
					modalTitle="Select Account"
					modalDescription="Choose an account to filter areas"
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
					modalDescription="Choose a plant to filter areas"
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
			<AreaTable
				areas={filteredAreas}
				onEdit={handleEdit}
				onDelete={handleDelete}
				hideActions={true}
				onRowClick={handleRowClick}
			/>
		</div>
	{/if}
</div>
