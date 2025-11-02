<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AccountTable } from '$lib/components/modules/accounts';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, Search, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		accountService,
		type Account,
		type PaginateResponse
	} from '$lib/services/account.service';

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

	onMount(() => {
		loadAccounts();
	});

	async function loadAccounts() {
		isLoading = true;
		try {
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

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
				selectedAccounts.map((account) => {
					if (account.id) return accountService.delete(account.id);
				})
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

	function handleSearch() {
		currentPage = 1;
		loadAccounts();
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
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Accounts</h1>
			<p class="text-muted-foreground">Manage your organization accounts</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New Account
		</Button>
	</div>

	<!-- Search and Actions -->
	<div class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="space-y-2">
				<label for="filter-code" class="text-sm font-medium">Filter by Code</label>
				<Input
					id="filter-code"
					type="text"
					placeholder="Enter code..."
					bind:value={filterCode}
					onkeydown={(e) => {
						if (e.key === 'Enter') handleSearch();
					}}
					disabled={isLoading}
				/>
			</div>
			<div class="space-y-2">
				<label for="filter-description" class="text-sm font-medium">Filter by Description</label>
				<Input
					id="filter-description"
					type="text"
					placeholder="Enter description..."
					bind:value={filterDescription}
					onkeydown={(e) => {
						if (e.key === 'Enter') handleSearch();
					}}
					disabled={isLoading}
				/>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center justify-between">
			<div class="flex gap-2">
				<Button variant="outline" onclick={handleSearch} disabled={isLoading} class="gap-2">
					<Search class="h-4 w-4" />
					Search
				</Button>
				<Button variant="outline" onclick={handleRefresh} disabled={isLoading} class="gap-2">
					<RefreshCw class={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
					Reload
				</Button>
			</div>

			{#if selectedAccounts.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
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
