<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import type { System } from '$lib/types';

	interface Props {
		systems: System[];
		onEdit: (system: System) => void;
		onDelete: (system: System) => void;
		onSelectionChange?: (selected: System[]) => void;
		selectable?: boolean;
		hideActions?: boolean;
		onRowDoubleClick?: (system: System) => void;
		onRowClick?: (system: System) => void;
	}

	let {
		systems,
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
			key: 'area',
			label: 'Area',
			render: (system: System) => system.area?.code || '-',
			class: 'font-medium text-primary'
		},
		{
			key: 'code',
			label: 'Code',
			class: 'font-medium',
			render: (system: System) => system.code || '-'
		},
		{
			key: 'description',
			label: 'Description',
			class: 'min-w-[200px]',
			render: (system: System) => system.description || '-'
		},
		{
			key: 'order',
			label: 'Order',
			render: (system: System) => system.order?.toString() || '-',
			class: 'w-20 text-center'
		},
		{
			key: 'nameContactor',
			label: 'Contact Person',
			render: (system: System) => system.nameContactor || '-'
		},
		{
			key: 'telephoneContactor',
			label: 'Phone',
			render: (system: System) => system.telephoneContactor || '-'
		},
		{
			key: 'location',
			label: 'Location',
			render: (system: System) => {
				const lat =
					system.latitude !== null && system.latitude !== undefined
						? typeof system.latitude === 'string'
							? parseFloat(system.latitude)
							: system.latitude
						: null;
				const lng =
					system.longitude !== null && system.longitude !== undefined
						? typeof system.longitude === 'string'
							? parseFloat(system.longitude)
							: system.longitude
						: null;

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
	data={systems}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	{hideActions}
	{onRowDoubleClick}
	{onRowClick}
	emptyMessage="No systems found. Create your first system to get started."
/>
