<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { AccountTable } from '$lib/components/modules/accounts';
	import { Plus } from 'lucide-svelte';

	interface Account {
		id: number;
		name: string;
		description: string;
		createdAt: string;
	}

	let accounts: Account[] = $state([
		{
			id: 1,
			name: 'Account 1',
			description: 'Description of account 1',
			createdAt: '2024-01-15'
		},
		{
			id: 2,
			name: 'Account 2',
			description: 'Description of account 2',
			createdAt: '2024-02-20'
		},
		{
			id: 3,
			name: 'Account 3',
			description: 'Description of account 3',
			createdAt: '2024-03-10'
		}
	]);

	let selectedAccounts: Account[] = $state([]);

	function handleCreate() {
		goto('/database-setup/accounts/create');
	}

	function handleEdit(account: Account) {
		goto(`/database-setup/accounts/edit/${account.id}`);
	}

	function handleDelete(account: Account) {
		// TODO: Agregar confirmación
		accounts = accounts.filter((a) => a.id !== account.id);
	}

	function handleSelectionChange(selected: Account[]) {
		selectedAccounts = selected;
		console.log('Selected accounts:', selected);
	}

	function handleBulkDelete() {
		accounts = accounts.filter((a) => !selectedAccounts.includes(a));
		selectedAccounts = [];
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Accounts</h1>
			<p class="text-muted-foreground">Manage your accounts</p>
		</div>
		<div class="flex gap-2">
			{#if selectedAccounts.length > 0}
				<Button variant="destructive" onclick={handleBulkDelete}>
					Delete Selected ({selectedAccounts.length})
				</Button>
			{/if}
			<Button onclick={handleCreate} class="gap-2">
				<Plus class="h-4 w-4" />
				New Account
			</Button>
		</div>
	</div>

	<AccountTable
		{accounts}
		onEdit={handleEdit}
		onDelete={handleDelete}
		onSelectionChange={handleSelectionChange}
		selectable={true}
	/>
</div>
