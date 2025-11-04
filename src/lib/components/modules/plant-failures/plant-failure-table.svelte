<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';

	interface ComponentFailureMode {
		id: number | null;
		code?: string;
		description?: string;
	}

	interface Plant {
		id?: number | null;
		code?: string;
		description?: string;
	}

	interface PlantFailure {
		id: number | null;
		plant?: Plant;
		code?: string;
		description?: string;
		failureMode?: ComponentFailureMode;
	}

	interface Props {
		plantFailures: PlantFailure[];
		onEdit: (plantFailure: PlantFailure) => void;
		onDelete: (plantFailure: PlantFailure) => void;
		onSelectionChange?: (selected: PlantFailure[]) => void;
		selectable?: boolean;
	}

	let { plantFailures, onEdit, onDelete, onSelectionChange, selectable = false }: Props = $props();

	const columns = [
		{
			key: 'plant',
			label: 'Plant Code',
			class: 'font-medium',
			render: (pf: PlantFailure) => pf.plant?.code || '-'
		},
		{
			key: 'plantDescription',
			label: 'Plant Description',
			class: 'font-medium',
			render: (pf: PlantFailure) => pf.plant?.description || '-'
		},
		{
			key: 'failureModeCode',
			label: 'ID',
			class: 'font-medium',
			render: (pf: PlantFailure) => pf?.code || '-'
		},
		{
			key: 'failureModeDescription',
			label: 'Description',
			class: 'min-w-[200px]',
			render: (pf: PlantFailure) => pf?.description || '-'
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
	data={plantFailures}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	emptyMessage="No plant failures found. Create your first association to get started."
/>
