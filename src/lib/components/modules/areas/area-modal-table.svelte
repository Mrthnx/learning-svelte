<script lang="ts">
	import { onMount } from 'svelte';
	import { areaService, type Area } from '$lib/services/area.service';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import AreaTable from './area-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		onselect?: (area: Area) => void;
	}

	let { onselect }: Props = $props();

	let areas = $state<Area[]>([]);
	let filteredAreas = $state<Area[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	onMount(() => {
		loadAreas();
	});

	async function loadAreas() {
		isLoading = true;
		try {
			const response = await areaService.getAll({ pageSize: 1000 });
			areas = response.rows;
			filteredAreas = areas;
		} catch (error) {
			console.error('Error loading areas:', error);
			toast.error('Failed to load areas');
		} finally {
			isLoading = false;
		}
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
