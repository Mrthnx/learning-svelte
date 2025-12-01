<script lang="ts">
	import { onMount } from 'svelte';
	import { accountService } from '$lib/services/account.service';
	import type { Account } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import AccountTable from './account-table.svelte';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { PAGINATION } from '$lib/shared';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { Pagination } from '$lib/components/me';

	interface Props {
		onselect?: (account: Account) => void;
	}

	let { onselect }: Props = $props();

	let accounts = $state<Account[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	// Pagination states
	let currentPage = $state(1);
	let pageSize = $state(20);
	let totalRecords = $state(0);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	onMount(() => {
		loadAccounts();
	});

	async function loadAccounts() {
		isLoading = true;
		// Clear previous data to avoid showing stale results
		accounts = [];
		try {
			// Obtener account del hierarchy store para excluirla de la lista
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Aplicar filtro de búsqueda por texto
			if (searchTerm.trim()) {
				filters.search = searchTerm.trim();
			}

			// Si hay account en hierarchy, excluirla de los resultados
			if (hierarchy.account.id) {
				// filters['account'] = { id: hierarchy.account.id };
			}

			const response = await accountService.getAll({
				page: currentPage,
				pageSize,
				filters
			});
			accounts = response.rows;
			totalRecords = response.total;
		} catch (error) {
			console.error('Error loading accounts:', error);
			toast.error('Failed to load accounts');
			// Ensure data is cleared on error
			accounts = [];
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		// Resetear a la primera página y recargar datos
		currentPage = 1;
		loadAccounts();
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadAccounts();
	}

	function handleRowClick(account: Account) {
		onselect?.(account);
	}

	// Dummy functions for table props (not used in modal)
	function handleEdit() {}
	function handleDelete() {}
</script>

<div class="space-y-4">
	<div class="flex gap-2">
		<Input
			bind:value={searchTerm}
			placeholder="Search by code, description, contact..."
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
			<AccountTable
				accounts={accounts}
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
