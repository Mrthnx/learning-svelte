<script lang="ts" generics="T">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { cn } from '$lib/utils';

	interface Column<T> {
		key: string;
		label: string;
		sortable?: boolean;
		render?: (item: T) => any;
		class?: string;
	}

	interface Action<T> {
		label: string;
		icon?: any;
		onClick: (item: T) => void;
		variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
		class?: string;
	}

	interface Props<T> {
		data: T[];
		columns: Column<T>[];
		actions?: Action<T>[];
		selectable?: boolean;
		onSelectionChange?: (selected: T[]) => void;
		emptyMessage?: string;
		class?: string;
	}

	let {
		data = [],
		columns = [],
		actions = [],
		selectable = false,
		onSelectionChange,
		emptyMessage = 'No data available',
		class: className
	}: Props<T> = $props();

	let selectedItems = $state<Set<T>>(new Set());
	let selectAll = $state(false);

	function toggleSelectAll() {
		if (selectAll) {
			selectedItems = new Set();
		} else {
			selectedItems = new Set(data);
		}
		selectAll = !selectAll;
		onSelectionChange?.(Array.from(selectedItems));
	}

	function toggleSelect(item: T) {
		if (selectedItems.has(item)) {
			selectedItems.delete(item);
		} else {
			selectedItems.add(item);
		}
		selectedItems = new Set(selectedItems);
		selectAll = selectedItems.size === data.length;
		onSelectionChange?.(Array.from(selectedItems));
	}

	function getCellValue(item: T, column: Column<T>) {
		if (column.render) {
			return column.render(item);
		}
		return (item as any)[column.key];
	}
</script>

<div class={cn('w-full overflow-auto rounded-md border', className)}>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				{#if selectable}
					<Table.Head class="w-12">
						<Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
					</Table.Head>
				{/if}
				{#each columns as column}
					<Table.Head class={column.class}>
						{column.label}
					</Table.Head>
				{/each}
				{#if actions && actions.length > 0}
					<Table.Head class="text-right">Actions</Table.Head>
				{/if}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if data.length === 0}
				<Table.Row>
					<Table.Cell colspan={columns.length + (selectable ? 1 : 0) + (actions?.length ? 1 : 0)} class="h-24 text-center">
						<div class="flex flex-col items-center gap-2">
							<svg
								class="h-12 w-12 text-muted-foreground"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
								/>
							</svg>
							<p class="text-sm text-muted-foreground">{emptyMessage}</p>
						</div>
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each data as item, i (i)}
					<Table.Row>
						{#if selectable}
							<Table.Cell>
								<Checkbox
									checked={selectedItems.has(item)}
									onCheckedChange={() => toggleSelect(item)}
								/>
							</Table.Cell>
						{/if}
						{#each columns as column}
							<Table.Cell class={column.class}>
								{@html getCellValue(item, column)}
							</Table.Cell>
						{/each}
						{#if actions && actions.length > 0}
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									{#each actions as action}
										<Button
											variant={action.variant || 'ghost'}
											size="sm"
											onclick={() => action.onClick(item)}
											class={cn('gap-2', action.class)}
										>
											{#if action.icon}
												<svelte:component this={action.icon} class="h-4 w-4" />
											{/if}
											{action.label}
										</Button>
									{/each}
								</div>
							</Table.Cell>
						{/if}
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>

{#if selectable && selectedItems.size > 0}
	<div class="mt-4 flex items-center justify-between rounded-md border bg-muted p-4">
		<p class="text-sm text-muted-foreground">
			{selectedItems.size} of {data.length} row(s) selected
		</p>
		<Button variant="outline" size="sm" onclick={() => { selectedItems = new Set(); selectAll = false; onSelectionChange?.([]); }}>
			Clear Selection
		</Button>
	</div>
{/if}
