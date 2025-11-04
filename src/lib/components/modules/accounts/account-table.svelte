<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2, MapPin, Phone, Mail } from 'lucide-svelte';

	interface Account {
		id: number | null;
		code?: string;
		description?: string;
		nameContactor?: string;
		telephoneContactor?: string;
		mailContactor?: string;
		latitude?: number | string;
		longitude?: number | string;
		image?: string;
	}

	interface Props {
		accounts: Account[];
		onEdit: (account: Account) => void;
		onDelete: (account: Account) => void;
		onSelectionChange?: (selected: Account[]) => void;
		selectable?: boolean;
		hideActions?: boolean;
		onRowDoubleClick?: (account: Account) => void;
		onRowClick?: (account: Account) => void;
	}

	let {
		accounts,
		onEdit,
		onDelete,
		onSelectionChange,
		selectable = false,
		hideActions = false,
		onRowDoubleClick,
		onRowClick
	}: Props = $props();

	const columns = [
		{
			key: 'code',
			label: 'Code',
			class: 'font-medium',
			render: (account: Account) => account.code || '-'
		},
		{
			key: 'description',
			label: 'Description',
			class: 'min-w-[200px]',
			render: (account: Account) => account.description || '-'
		},
		{
			key: 'nameContactor',
			label: 'Contact Person',
			render: (account: Account) => account.nameContactor || '-'
		},
		{
			key: 'telephoneContactor',
			label: 'Phone',
			render: (account: Account) => account.telephoneContactor || '-'
		},
		{
			key: 'mailContactor',
			label: 'Email',
			render: (account: Account) => account.mailContactor || '-',
			class: 'text-sm'
		},
		{
			key: 'location',
			label: 'Location',
			render: (account: Account) => {
				// Safely parse coordinates
				const lat =
					account.latitude !== null && account.latitude !== undefined
						? typeof account.latitude === 'string'
							? parseFloat(account.latitude)
							: account.latitude
						: null;
				const lng =
					account.longitude !== null && account.longitude !== undefined
						? typeof account.longitude === 'string'
							? parseFloat(account.longitude)
							: account.longitude
						: null;

				// Check if both are valid numbers
				if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
					return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
				}
				return '-';
			},
			class: 'text-xs text-muted-foreground'
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
	{hideActions}
	{onRowDoubleClick}
	{onRowClick}
	emptyMessage="No accounts found. Create your first account to get started."
/>
