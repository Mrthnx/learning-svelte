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
	import { Pagination } from '$lib/components/me';

	interface Props {
		onselect?: (plant: Plant) => void;
	}

	let { onselect }: Props = $props();

	let plants = $state<Plant[]>([]);
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

	onMount(() => {
		loadPlants();
	});

	async function loadPlants() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		plants = [];
		try {
			// Obtener toda la jerarquía del hierarchy store para filtrar plantas
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Aplicar filtro de code y description
			if (filterCode.trim()) {
				filters.code = filterCode.trim();
			}
			if (filterDescription.trim()) {
				filters.description = filterDescription.trim();
			}

			// Incluir toda la jerarquía hacia arriba: account
			// (Para plants solo necesitamos account ya que es el nivel inmediato superior)
			if (hierarchy.account.id || accountSearch.id) {
				filters['account'] = { id: hierarchy.account.id || accountSearch.id };
			}

			const response = await plantService.getAll({
				page: currentPage,
				pageSize,
				filters
			});
			plants = response.rows;
			totalRecords = response.total;
		} catch (error) {
			console.error('Error loading plants:', error);
			toast.error('Failed to load plants');
			// Ensure data is cleared on error
			plants = [];
		} finally {
			isLoading = false;
		}
	}

	// Function to reload plants when hierarchy filters change
	function handleHierarchyChange() {
		loadPlants();
	}

	function handleSearch() {
		// Resetear a la primera página y recargar datos
		currentPage = 1;
		loadPlants();
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadPlants();
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
					modalDescription=""
					modalContent={AccountModalTable}
					hierarchyLevel="account"
					onclear={() => {
						// Clear hierarchy store
						hierarchyStore.clearAccount();
						// Limpiar todos los hijos en cascada
						hierarchyStore.clearPlant();
						hierarchyStore.clearArea();
						hierarchyStore.clearSystem();
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
							// Limpiar hijos cuando se selecciona un account diferente
							hierarchyStore.clearPlant();
							hierarchyStore.clearArea();
							hierarchyStore.clearSystem();
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
			<PlantTable
				{plants}
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
