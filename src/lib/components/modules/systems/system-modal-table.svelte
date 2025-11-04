<script lang="ts">
	import { onMount } from 'svelte';
	import { systemService, type System } from '$lib/services/system.service';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import SystemTable from './system-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		onselect?: (system: System) => void;
	}

	let { onselect }: Props = $props();

	let systems = $state<System[]>([]);
	let filteredSystems = $state<System[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	onMount(() => {
		loadSystems();
	});

	async function loadSystems() {
		isLoading = true;
		try {
			const response = await systemService.getAll({ pageSize: 1000 });
			systems = response.rows;
			filteredSystems = systems;
		} catch (error) {
			console.error('Error loading systems:', error);
			toast.error('Failed to load systems');
		} finally {
			isLoading = false;
		}
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
		<div class="rounded-md border max-h-[60vh] overflow-auto">
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
