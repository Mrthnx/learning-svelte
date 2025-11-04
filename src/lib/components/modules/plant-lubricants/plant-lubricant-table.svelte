<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';

	interface Lubricant {
		id: number | null;
		code?: string;
		description?: string;
	}

	interface Plant {
		id?: number | null;
		code?: string;
		description?: string;
	}

	interface PlantLubricant {
		id: number | null;
		lubricant?: Lubricant;
		code?: string;
		description?: string;
		plant?: Plant;
	}

	interface Props {
		plantLubricants: PlantLubricant[];
		onEdit: (plantLubricant: PlantLubricant) => void;
		onDelete: (plantLubricant: PlantLubricant) => void;
		onSelectionChange?: (selected: PlantLubricant[]) => void;
		selectable?: boolean;
	}

	let {
		plantLubricants,
		onEdit,
		onDelete,
		onSelectionChange,
		selectable = false
	}: Props = $props();

	const columns = [
		{
			key: 'plant',
			label: 'Plant Code',
			class: 'font-medium',
			render: (plantLubricant: PlantLubricant) => plantLubricant.plant?.code || '-'
		},
		{
			key: 'plantDescription',
			label: 'Plant Description',
			class: 'min-w-[200px]',
			render: (plantLubricant: PlantLubricant) => plantLubricant.plant?.description || '-'
		},
		{
			key: 'lubricant',
			label: 'Lubricant Code',
			class: 'font-medium',
			render: (plantLubricant: PlantLubricant) => plantLubricant?.code || '-'
		},
		{
			key: 'lubricantDescription',
			label: 'Lubricant Description',
			class: 'min-w-[200px]',
			render: (plantLubricant: PlantLubricant) => plantLubricant?.description || '-'
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
	data={plantLubricants}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	emptyMessage="No plant lubricants found. Create your first association to get started."
/>
