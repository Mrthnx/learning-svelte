<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2, ArrowRight } from 'lucide-svelte';
	import type { Component } from '$lib/types';

	interface Props {
		components: Component[];
		onEdit: (component: Component) => void;
		onDelete: (component: Component) => void;
		onGoTo?: (component: Component) => void;
		onSelectionChange?: (selected: Component[]) => void;
		selectable?: boolean;
		hideActions?: boolean;
		onRowClick?: (component: Component) => void;
	}

	let {
		components,
		onEdit,
		onDelete,
		onGoTo,
		onSelectionChange,
		selectable = false,
		hideActions = false,
		onRowClick
	}: Props = $props();

	const columns = [
		{
			key: 'mawoi',
			label: 'Asset',
			render: (component: Component) => component.mawoi?.code || '-',
			class: 'font-medium text-primary'
		},
		{
			key: 'code',
			label: 'Code',
			class: 'font-medium',
			render: (component: Component) => component.code || '-'
		},
		{
			key: 'description',
			label: 'Description',
			class: 'min-w-[200px]',
			render: (component: Component) => component.description || '-'
		},
		{
			key: 'componentType',
			label: 'Type',
			render: (component: Component) => component.componentType?.code || '-'
		},
		{
			key: 'order',
			label: 'Order',
			render: (component: Component) => component.order?.toString() || '-',
			class: 'w-20 text-center'
		}
	];

	const actions = [
		{
			label: 'View Details',
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
	data={components}
	{columns}
	actions={hideActions ? [] : actions}
	{selectable}
	{onSelectionChange}
	{onRowClick}
	emptyMessage="No components found. Create your first component to get started."
/>
