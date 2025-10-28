<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';

	interface Account {
		id: number;
		name: string;
		description: string;
		createdAt: string;
	}

	interface Props {
		accounts: Account[];
		onEdit: (account: Account) => void;
		onDelete: (account: Account) => void;
		onSelectionChange?: (selected: Account[]) => void;
		selectable?: boolean;
	}

	let { accounts, onEdit, onDelete, onSelectionChange, selectable = false }: Props = $props();

	const columns = [
		{
			key: 'id',
			label: 'ID',
			class: 'w-20'
		},
		{
			key: 'name',
			label: 'Name',
			class: 'font-medium'
		},
		{
			key: 'description',
			label: 'Description',
			class: 'text-muted-foreground'
		},
		{
			key: 'createdAt',
			label: 'Created At',
			render: (account: Account) => new Date(account.createdAt).toLocaleDateString(),
			class: 'text-muted-foreground'
		}
	];

	const actions = [
		{
			label: 'Edit',
			icon: Pencil,
			onClick: onEdit,
			variant: 'outline' as const
		},
		{
			label: 'Delete',
			icon: Trash2,
			onClick: onDelete,
			variant: 'destructive' as const
		}
	];
</script>

<Table
	data={accounts}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	emptyMessage="No accounts found. Create your first account to get started."
/>
