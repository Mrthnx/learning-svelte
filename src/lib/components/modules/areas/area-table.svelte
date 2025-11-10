<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';
import type { Area } from '$lib/types';

	interface Props {
		areas: Area[];
		onEdit: (area: Area) => void;
		onDelete: (area: Area) => void;
		onSelectionChange?: (selected: Area[]) => void;
		selectable?: boolean;
		hideActions?: boolean;
		onRowDoubleClick?: (area: Area) => void;
		onRowClick?: (area: Area) => void;
	}

	let {
		areas,
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
			key: 'plant',
			label: 'Plant',
			render: (area: Area) => area.plant?.code || '-',
			class: 'font-medium text-primary'
		},
		{
			key: 'code',
			label: 'Code',
			class: 'font-medium',
			render: (area: Area) => area.code || '-'
		},
		{
			key: 'description',
			label: 'Description',
			class: 'min-w-[200px]',
			render: (area: Area) => area.description || '-'
		},
		{
			key: 'order',
			label: 'Order',
			render: (area: Area) => area.order?.toString() || '-',
			class: 'w-20 text-center'
		},
		{
			key: 'nameContactor',
			label: 'Contact Person',
			render: (area: Area) => area.nameContactor || '-'
		},
		{
			key: 'telephoneContactor',
			label: 'Phone',
			render: (area: Area) => area.telephoneContactor || '-'
		},
		{
			key: 'location',
			label: 'Location',
			render: (area: Area) => {
				const lat =
					area.latitude !== null && area.latitude !== undefined
						? typeof area.latitude === 'string'
							? parseFloat(area.latitude)
							: area.latitude
						: null;
				const lng =
					area.longitude !== null && area.longitude !== undefined
						? typeof area.longitude === 'string'
							? parseFloat(area.longitude)
							: area.longitude
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
	data={areas}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	{hideActions}
	{onRowDoubleClick}
	{onRowClick}
	emptyMessage="No areas found. Create your first area to get started."
/>
