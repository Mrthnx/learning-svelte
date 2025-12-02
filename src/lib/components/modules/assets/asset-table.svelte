<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2, ArrowRight } from 'lucide-svelte';
	import type { Asset } from '$lib/types';

	interface Props {
		assets: Asset[];
		onEdit: (asset: Asset) => void;
		onDelete: (asset: Asset) => void;
		onGoTo?: (asset: Asset) => void;
		onSelectionChange?: (selected: Asset[]) => void;
		selectable?: boolean;
	}

	let { assets, onEdit, onDelete, onGoTo, onSelectionChange, selectable = false }: Props = $props();

	const columns = [
		{
			key: 'system',
			label: 'System',
			render: (asset: Asset) => asset.system?.code || '-',
			class: 'font-medium text-primary'
		},
		{
			key: 'code',
			label: 'Code',
			class: 'font-medium',
			render: (asset: Asset) => asset.code || '-'
		},
		{
			key: 'description',
			label: 'Description',
			class: 'min-w-[200px]',
			render: (asset: Asset) => asset.description || '-'
		},
		{
			key: 'rpm',
			label: 'RPM',
			render: (asset: Asset) => asset.rpm?.toString() || '-',
			class: 'w-20 text-center'
		},
		{
			key: 'order',
			label: 'Order',
			render: (asset: Asset) => asset.order?.toString() || '-',
			class: 'w-20 text-center'
		},
		{
			key: 'location',
			label: 'Location',
			render: (asset: Asset) => {
				const lat =
					asset.latitude !== null && asset.latitude !== undefined
						? typeof asset.latitude === 'string'
							? parseFloat(asset.latitude)
							: asset.latitude
						: null;
				const lng =
					asset.longitude !== null && asset.longitude !== undefined
						? typeof asset.longitude === 'string'
							? parseFloat(asset.longitude)
							: asset.longitude
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
			label: 'Go to Components',
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
	data={assets}
	{columns}
	{actions}
	{selectable}
	{onSelectionChange}
	emptyMessage="No assets found. Create your first asset to get started."
/>
