<script lang="ts">
	import { onMount } from 'svelte';
	import { plantService, type Plant } from '$lib/services/plant.service';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import PlantTable from './plant-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		onselect?: (plant: Plant) => void;
	}

	let { onselect }: Props = $props();

	let plants = $state<Plant[]>([]);
	let filteredPlants = $state<Plant[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	onMount(() => {
		loadPlants();
	});

	async function loadPlants() {
		isLoading = true;
		try {
			const response = await plantService.getAll({ pageSize: 1000 });
			plants = response.rows;
			filteredPlants = plants;
		} catch (error) {
			console.error('Error loading plants:', error);
			toast.error('Failed to load plants');
		} finally {
			isLoading = false;
		}
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
