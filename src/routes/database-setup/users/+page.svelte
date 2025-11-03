<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { UserTable } from '$lib/components/modules/users';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Pagination } from '$lib/components/me';
	import { Plus, Trash2, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { useDebounce } from '$lib/composables';
	import { api } from '$lib/services/api';
	import {
		userService,
		type User,
		type PaginateResponse
	} from '$lib/services/user.service';

	let users: User[] = $state([]);
	let selectedUsers: User[] = $state([]);
	let filterCode = $state('');
	let filterDescription = $state('');
	let isLoading = $state(false);
	let isDeleting = $state(false);
	let isDebouncing = $state(false);

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalRecords = $state(0);

	// Modals
	let deleteDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let userToDelete: User | null = $state(null);

	const totalPages = $derived(Math.ceil(totalRecords / pageSize));

	// Initial load flag
	let isInitialLoad = $state(true);

	// Debounced search - auto-search when user stops typing
	$effect(() => {
		// Skip initial effect execution
		if (isInitialLoad) return;

		isDebouncing = true;
		const cleanup = useDebounce(
			{ filterCode, filterDescription },
			() => {
				currentPage = 1;
				loadUsers();
				isDebouncing = false;
			},
			500
		);

		return cleanup;
	});

	onMount(() => {
		loadUsers();
	});

	async function loadUsers() {
		isLoading = true;
		try {
			const filters: any = {};
			if (filterCode.trim()) filters.code = filterCode.trim();
			if (filterDescription.trim()) filters.description = filterDescription.trim();

			const response: PaginateResponse<User> = await userService.getAll({
				page: currentPage,
				pageSize,
				filters
			});

		users = response.rows;
		totalRecords = response.total;
		console.log('Users loaded:', users.length, users);
		} catch (error: any) {
			console.error('Error loading users:', error);
			toast.error(error.message || 'Failed to load users');
		} finally {
			isLoading = false;
		}
	}

	function handleCreate() {
		goto('/database-setup/users/create');
	}

	function handleEdit(user: User) {
		goto(`/database-setup/users/edit/${user.id}`);
	}

	function handleDelete(user: User) {
		userToDelete = user;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!userToDelete?.id) return;

		isDeleting = true;
		try {
			await userService.delete(userToDelete.id);
			toast.success(`User "${userToDelete.code}" deleted successfully`);
			deleteDialogOpen = false;
			userToDelete = null;
			loadUsers();
		} catch (error: any) {
			console.error('Error deleting user:', error);
			toast.error(error.message || 'Failed to delete user');
		} finally {
			isDeleting = false;
		}
	}

	function handleBulkDelete() {
		if (selectedUsers.length === 0) {
			toast.error('Please select at least one user to delete');
			return;
		}
		bulkDeleteDialogOpen = true;
	}

	async function confirmBulkDelete() {
		isDeleting = true;
		try {
			await Promise.all(
				selectedUsers
					.filter((user) => user.id !== null)
					.map((user) => userService.delete(user.id!))
			);

			toast.success(`${selectedUsers.length} user(s) deleted successfully`);
			bulkDeleteDialogOpen = false;
			selectedUsers = [];
			loadUsers();
		} catch (error: any) {
			console.error('Error deleting users:', error);
			toast.error(error.message || 'Failed to delete users');
		} finally {
			isDeleting = false;
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadUsers();
	}

	function handleRefresh() {
		loadUsers();
	}

	function handleSelectionChange(selected: User[]) {
		selectedUsers = selected;
	}

	async function handleResetPassword(user: User) {
		if (!user.id) return;
		
		if (!confirm(`Are you sure you want to reset the password for "${user.name} ${user.lastName}"?`)) {
			return;
		}

		try {
			await api.patch(`users/set-password/${user.id}`, {});
			toast.success('Password reset successfully!');
		} catch (error: any) {
			console.error('Error resetting password:', error);
			toast.error(error.message || 'Failed to reset password');
		}
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Users</h1>
			<p class="text-muted-foreground">Manage your organization users</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			New User
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
					disabled={isLoading}
				/>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handleRefresh} disabled={isLoading} class="gap-2">
					<RefreshCw class={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
					Reload
				</Button>
				{#if isDebouncing && (filterCode || filterDescription)}
					<span class="text-sm text-muted-foreground">Searching...</span>
				{/if}
			</div>

			{#if selectedUsers.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete} class="gap-2">
					<Trash2 class="h-4 w-4" />
					Delete ({selectedUsers.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<UserTable
		{users}
		onEdit={handleEdit}
		onDelete={handleDelete}
		onResetPassword={handleResetPassword}
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

<!-- Delete Single User Modal -->
<AlertModal
	bind:open={deleteDialogOpen}
	type="confirm"
	title="Delete User"
	description={userToDelete
		? `Are you sure you want to delete "${userToDelete.code}"? This action cannot be undone.`
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
	title="Delete Multiple Users"
	description={`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`}
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