<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AccountTable } from '$lib/components/modules/accounts';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination, PageHeader } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { accountService } from '$lib/services/account.service';
	import type { Account, PaginateResponse } from '$lib/types';
	import { hierarchyStore } from '$lib/store/hierarchy.store';
	import { HierarchyNavigation } from '$lib/utils/hierarchy-navigation';

	let accounts: Account[] = $state([]);
	let selectedAccounts: Account[] = $state([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	// Modals
	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let accountToDelete: Account | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Load accounts on mount
	onMount(() => {
		loadAccounts();
	});

	async function loadAccounts() {
		isLoading = true;
		try {
			const hierarchy = $hierarchyStore;
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

			// Aplicar filtros de jerarquía
			if (hierarchy.account.id) {
				filters['account'] = { id: hierarchy.account.id };
			}

			const response: PaginateResponse<Account> = await accountService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

			accounts = response.rows;
			totalRecords = response.total;
		} catch (error: any) {
			console.error('Error loading accounts:', error);
			toast.error(error.message || 'Failed to load accounts');
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadAccounts();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleCreate() {
		goto('/database-setup/accounts/create');
	}

	function handleEdit(account: Account) {
		goto(`/database-setup/accounts/edit/${account.id}`);
	}

	function handleDelete(account: Account) {
		accountToDelete = account;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!accountToDelete?.id) return;

		isDeleting = true;
		try {
			await accountService.delete(accountToDelete.id);
			toast.success(`Account "${accountToDelete.code}" deleted successfully`);
			deleteDialogOpen = false;
			accountToDelete = null;
			loadAccounts();
		} catch (error: any) {
			console.error('Error deleting account:', error);
			toast.error(error.message || 'Failed to delete account');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedAccounts.length === 0) {
			toast.error('Please select at least one account to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedAccounts
					.filter((account) => account.id !== null)
					.map((account) => accountService.delete(account.id!))
			);

			toast.success(`${selectedAccounts.length} account(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedAccounts = [];
			loadAccounts();
		} catch (error: any) {
			console.error('Error deleting accounts:', error);
			toast.error(error.message || 'Failed to delete accounts');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadAccounts();
	}

	function handleRefresh() {
		loadAccounts();
	}

	function handleSelectionChange(selected: Account[]) {
		selectedAccounts = selected;
	}

	function handleGoTo(account: Account) {
		HierarchyNavigation.goToPlants(account);
	}
</script>

<div class="container mx-auto space-y-4 p-4 sm:space-y-6 sm:p-6">
	<!-- Header -->
	<PageHeader
		title="Accounts"
		description="Manage your organization accounts"
		actionLabel="New Account"
		actionIcon={Plus}
		onAction={handleCreate}
	/>

	<!-- Search and Actions -->
	<div class="flex flex-col gap-3 sm:gap-4">
		<!-- Filters -->
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<div class="space-y-1.5">
				<label for="filter-code" class="text-xs font-medium sm:text-sm">Filter by Code</label>
				<Input
					id="filter-code"
					type="text"
					placeholder="Code..."
					bind:value={filterCode}
					onkeypress={handleKeyPress}
					disabled={isLoading}
					class="h-9 sm:h-10"
				/>
			</div>
			<div class="space-y-1.5">
				<label for="filter-description" class="text-xs font-medium sm:text-sm"
					>Filter by Description</label
				>
				<Input
					id="filter-description"
					type="text"
					placeholder="Description..."
					bind:value={filterDescription}
					onkeypress={handleKeyPress}
					disabled={isLoading}
					class="h-9 sm:h-10"
				/>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					onclick={handleRefresh}
					disabled={isLoading}
					size="sm"
					class="gap-1 sm:gap-2"
				>
					<RefreshCw class={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
					<span class="hidden sm:inline">Reload</span>
				</Button>
				<Button
					onclick={handleSearch}
					disabled={isLoading}
					size="sm"
					class="flex-1 gap-1 sm:flex-none sm:gap-2"
				>
					Search
				</Button>
			</div>

			{#if selectedAccounts.length > 0}
				<Button
					variant="destructive"
					onclick={handleBulkDelete}
					size="sm"
					class="w-full gap-2 sm:w-auto"
				>
					<Trash2 class="h-4 w-4" />
					Delete ({selectedAccounts.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<AccountTable
		{accounts}
		onEdit={handleEdit}
		onDelete={handleDelete}
		onGoTo={handleGoTo}
		onSelectionChange={handleSelectionChange}
		selectable={true}
	/>

	<!-- Pagination -->
	<Pagination
		{currentPage}
		{totalPages}
		{totalRecords}
		{pageSize}
		onPageChange={handlePageChange}
		{isLoading}
	/>
</div>

<!-- Delete Single Account Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete Account"
	description={accountToDelete
		? `Are you sure you want to delete "${accountToDelete.code}"? This action cannot be undone.`
		: ''}
	buttons={[
		{ label: 'Cancel', action: 'cancel', variant: 'outline' },
		{ label: isDeleting ? 'Deleting...' : 'Delete', action: 'confirm', variant: 'destructive' }
	]}
	onAction={(action) => {
		if (action === 'confirm') {
			confirmDelete();
		}
	}}
/>

<!-- Bulk Delete Modal -->
<AlertModal
	bind:open={bulkDeleteDialogOpen}
	type="confirm"
	title="Delete Multiple Accounts"
	description={`Are you sure you want to delete ${selectedAccounts.length} account(s)? This action cannot be undone.`}
	buttons={[
		{ label: 'Cancel', action: 'cancel', variant: 'outline' },
		{ label: isDeleting ? 'Deleting...' : 'Delete All', action: 'confirm', variant: 'destructive' }
	]}
	onAction={(action) => {
		if (action === 'confirm') {
			confirmBulkDelete();
		}
	}}
/>
