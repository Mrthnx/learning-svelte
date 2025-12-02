<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2, MapPin, Phone, Mail, Building2, ArrowRight } from 'lucide-svelte';

	interface Plant {
		id: number | null;
		code?: string;
		description?: string;
		nameContactor?: string;
		telephoneContactor?: string;
		mailContactor?: string;
		order?: number;
		latitude?: number | string;
		longitude?: number | string;
		image?: string;
		account?: {
			id?: number;
			code?: string;
			description?: string;
		};
	}

	interface Props {
		plants: Plant[];
		onEdit: (plant: Plant) => void;
		onDelete: (plant: Plant) => void;
		onGoTo?: (plant: Plant) => void;
		onSelectionChange?: (selected: Plant[]) => void;
		selectable?: boolean;
		hideActions?: boolean;
		onRowDoubleClick?: (plant: Plant) => void;
		onRowClick?: (plant: Plant) => void;
	}

	let {
		plants,
		onEdit,
		onDelete,
		onGoTo,
		onSelectionChange,
		selectable = false,
		hideActions = false,
		onRowDoubleClick,
		onRowClick
	}: Props = $props();

	const columns = [
		{
			key: 'account',
			label: 'Account',
			render: (plant: Plant) => plant.account?.code || '-',
			class: 'font-medium text-primary'
		},
		{
			key: 'code',
			label: 'Code',
			class: 'font-medium',
			render: (plant: Plant) => plant.code || '-'
		},
		{
			key: 'description',
			label: 'Description',
			class: 'min-w-[200px]',
			render: (plant: Plant) => plant.description || '-'
		},
		{
			key: 'order',
			label: 'Order',
			render: (plant: Plant) => plant.order?.toString() || '-',
			class: 'w-20 text-center'
		},
		{
			key: 'nameContactor',
			label: 'Contact Person',
			render: (plant: Plant) => plant.nameContactor || '-'
		},
		{
			key: 'telephoneContactor',
			label: 'Phone',
			render: (plant: Plant) => plant.telephoneContactor || '-'
		},
		{
			key: 'mailContactor',
			label: 'Email',
			render: (plant: Plant) => plant.mailContactor || '-',
			class: 'text-sm'
		},
		{
			key: 'location',
			label: 'Location',
			render: (plant: Plant) => {
				// Safely parse coordinates
				const lat =
					plant.latitude !== null && plant.latitude !== undefined
						? typeof plant.latitude === 'string'
							? parseFloat(plant.latitude)
							: plant.latitude
						: null;
				const lng =
					plant.longitude !== null && plant.longitude !== undefined
						? typeof plant.longitude === 'string'
							? parseFloat(plant.longitude)
							: plant.longitude
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
			label: 'Go to Areas',
			icon: ArrowRight,
			onClick: onGoTo,
			variant: 'default' as const,
			show: !!onGoTo
		},
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
	].filter((action) => action.show !== false);
</script>

<Table
	data={plants}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	{hideActions}
	{onRowDoubleClick}
	{onRowClick}
	emptyMessage="No plants found. Create your first plant to get started."
/>
