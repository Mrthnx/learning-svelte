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
		// Clear previous data to avoid showing stale results
		plants = [];
		filteredPlants = [];
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
			// Ensure data is cleared on error
			plants = [];
			filteredPlants = [];
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
	<!-- Unified Filters Section -->
	<div class="rounded-lg border bg-card p-3 shadow-sm">
		<div class="mb-3 flex items-center gap-2">
			<div class="rounded-full bg-primary/10 p-1">
				<Search class="h-3 w-3 text-primary" />
			</div>
			<h3 class="text-xs font-medium text-foreground">Filter Plants</h3>
		</div>

		<div class="grid gap-3 sm:grid-cols-2">
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
					modalDescription="Choose an account to filter plants"
					modalContent={AccountModalTable}
					hierarchyLevel="account"
					onclear={() => {
						// Clear hierarchy store
						hierarchyStore.clearAccount();
						// Clear local state
						accountSearch = { id: null, description: '', readonly: false };
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
