<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import type { Component } from '$lib/services/component.service';

	interface Props {
		components: Component[];
		onEdit: (component: Component) => void;
		onDelete: (component: Component) => void;
		onSelectionChange?: (selected: Component[]) => void;
		selectable?: boolean;
	}

	let { components, onEdit, onDelete, onSelectionChange, selectable = false }: Props = $props();

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
	data={components}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	emptyMessage="No components found. Create your first component to get started."
/>
