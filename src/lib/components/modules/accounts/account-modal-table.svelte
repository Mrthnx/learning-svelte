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

	interface Props {
		onselect?: (account: Account) => void;
	}

	let { onselect }: Props = $props();

	let accounts = $state<Account[]>([]);
	let filteredAccounts = $state<Account[]>([]);
	let searchTerm = $state('');
	let isLoading = $state(false);

	onMount(() => {
		loadAccounts();
	});

	async function loadAccounts() {
		isLoading = true;
		try {
			// Obtener account del hierarchy store para excluirla de la lista
			const hierarchy = $hierarchyStore;
			const filters: any = {};

			// Si hay account en hierarchy, excluirla de los resultados
			if (hierarchy.account.id) {
				filters['account'] = { id: hierarchy.account.id };
			}

			const response = await accountService.getAll({ pageSize: PAGINATION.MAX_PAGE_SIZE, filters });
			accounts = response.rows;
			filteredAccounts = accounts;
		} catch (error) {
			console.error('Error loading accounts:', error);
			toast.error('Failed to load accounts');
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		const term = searchTerm.toLowerCase().trim();
		if (!term) {
			filteredAccounts = accounts;
			return;
		}

		filteredAccounts = accounts.filter(
			(account) =>
				account.code?.toLowerCase().includes(term) ||
				account.description?.toLowerCase().includes(term) ||
				account.nameContactor?.toLowerCase().includes(term) ||
				account.mailContactor?.toLowerCase().includes(term)
		);
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
				accounts={filteredAccounts}
				onEdit={handleEdit}
				onDelete={handleDelete}
				hideActions={true}
				onRowClick={handleRowClick}
			/>
		</div>
	{/if}
</div>
