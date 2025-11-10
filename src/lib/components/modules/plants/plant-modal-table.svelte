<script lang="ts">
	import { onMount } from 'svelte';
	import { plantService } from '$lib/services/plant.service';
	import type { Plant } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import PlantTable from './plant-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { PAGINATION } from '$lib/shared';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import AccountModalTable from '../accounts/account-modal-table.svelte';

	interface Props {
		onselect?: (plant: Plant) => void;
	}

	let { onselect }: Props = $props();

	let plants = $state<Plant[]>([]);
	let filteredPlants = $state<Plant[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	// SearchInput states for hierarchy filters
	let accountSearch = $state({ id: null, description: '', readonly: false });

	onMount(() => {
		loadPlants();
	});

	async function loadPlants() {
		isLoading = true;
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar plantas
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Incluir toda la jerarquía hacia arriba: account
			// (Para plants solo necesitamos account ya que es el nivel inmediato superior)
			if (hierarchy.account.id || accountSearch.id) {
				filters['account'] = { id: hierarchy.account.id || accountSearch.id };
			}

			const response = await plantService.getAll({ pageSize: PAGINATION.MAX_PAGE_SIZE, filters });
			plants = response.rows;
			filteredPlants = plants;
		} catch (error) {
			console.error('Error loading plants:', error);
			toast.error('Failed to load plants');
		} finally {
			isLoading = false;
		}
	}

	// Function to reload plants when hierarchy filters change
	function handleHierarchyChange() {
		loadPlants();
	}

	function handleSearch() {
		const term = searchTerm.toLowerCase().trim();
		if (!term) {
			filteredPlants = plants;
			return;
		}

		filteredPlants = plants.filter(
			(plant) =>
				plant.code?.toLowerCase().includes(term) ||
				plant.description?.toLowerCase().includes(term) ||
				plant.account?.code?.toLowerCase().includes(term)
		);
	}

	function handleRowClick(plant: Plant) {
		onselect?.(plant);
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
					modalDescription="Choose an account to filter plants"
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
	</div>

	<!-- Search by text -->
	<div class="flex gap-2">
		<Input
			bind:value={searchTerm}
			placeholder="Search by code, description, account..."
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
			<PlantTable
				plants={filteredPlants}
				onEdit={handleEdit}
				onDelete={handleDelete}
				hideActions={true}
				onRowClick={handleRowClick}
			/>
		</div>
	{/if}
</div>
