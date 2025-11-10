<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		ChevronRight,
		ChevronDown,
		Save,
		X,
		Shield,
		Eye,
		Edit,
		Trash2,
		Plus
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface Option {
		id: number;
		name: string;
		label: string;
		icon?: string;
		uri?: string;
		order: number;
		children?: Option[];
	}

	interface Permission {
		id: number;
		name: string;
		permission: string;
	}

	interface RolePermissionDetail {
		id: number;
		optionId: number;
		permissionId: number;
	}

	interface Props {
		optionsTree: Option[];
		permissions: Permission[];
		rolePermissions: RolePermissionDetail[];
		onPermissionChange: (optionId: number, permissionId: number, checked: boolean) => void;
		onSave: () => Promise<void>;
		onCancel: () => void;
		pendingChanges: number;
		isSaving?: boolean;
	}

	let {
		optionsTree,
		permissions,
		rolePermissions,
		onPermissionChange,
		onSave,
		onCancel,
		pendingChanges,
		isSaving = false
	}: Props = $props();

	let expandedOptions = $state(new Set<number>());

	function toggleExpand(optionId: number) {
		if (expandedOptions.has(optionId)) {
			expandedOptions.delete(optionId);
		} else {
			expandedOptions.add(optionId);
		}
		expandedOptions = expandedOptions;
	}

	function isPermissionChecked(optionId: number, permissionId: number): boolean {
		return rolePermissions.some(
			(rp) => rp.optionId === optionId && rp.permissionId === permissionId
		);
	}

	function getPermissionIcon(permissionName: string) {
		const name = permissionName.toLowerCase();
		if (name.includes('read') || name.includes('ver') || name.includes('view')) return Eye;
		if (name.includes('write') || name.includes('crear') || name.includes('create')) return Plus;
		if (name.includes('update') || name.includes('edit') || name.includes('modificar')) return Edit;
		if (name.includes('delete') || name.includes('eliminar') || name.includes('remove'))
			return Trash2;
		return Shield;
	}

	function getPermissionColor(permissionName: string): string {
		const name = permissionName.toLowerCase();
		if (name.includes('read') || name.includes('ver') || name.includes('view'))
			return 'text-blue-400';
		if (name.includes('write') || name.includes('crear') || name.includes('create'))
			return 'text-green-400';
		if (name.includes('update') || name.includes('edit') || name.includes('modificar'))
			return 'text-yellow-400';
		if (name.includes('delete') || name.includes('eliminar') || name.includes('remove'))
			return 'text-red-400';
		return 'text-gray-400';
	}

	function flattenOptions(options: Option[]): Option[] {
		const result: Option[] = [];
		for (const option of options) {
			result.push(option);
			if (option.children && option.children.length > 0) {
				result.push(...flattenOptions(option.children));
			}
		}
		return result;
	}

	const flatOptions = $derived(flattenOptions(optionsTree));

	async function handleSave() {
		try {
			await onSave();
		} catch (error) {
			console.error('Error saving permissions:', error);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>Permission Matrix</Card.Title>
				<Card.Description>
					Configure permissions for each menu option. Check the boxes to grant permissions.
				</Card.Description>
			</div>
			{#if pendingChanges > 0}
				<Badge variant="outline" class="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
					{pendingChanges} pending change{pendingChanges !== 1 ? 's' : ''}
				</Badge>
			{/if}
		</div>
	</Card.Header>

	<Card.Content class="px-0">
		<!-- Permission Matrix Table -->
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="sticky top-0 z-10 bg-muted/50 backdrop-blur">
					<tr class="border-b">
						<th class="w-[300px] p-4 text-left text-sm font-semibold">Option</th>
						{#each permissions as permission (permission.id)}
							{@const PermIcon = getPermissionIcon(permission.name || permission.permission)}
							{@const color = getPermissionColor(permission.name || permission.permission)}
							<th class="min-w-[100px] p-4 text-center text-sm font-semibold">
								<div class="flex flex-col items-center gap-1.5">
									<svelte:component this={PermIcon} class="h-4 w-4 {color}" />
									<span class="text-xs capitalize">{permission.name || permission.permission}</span>
								</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each flatOptions as option, index (option.id)}
						{@const isParent = option.children && option.children.length > 0}
						{@const isExpanded = expandedOptions.has(option.id)}
						{@const depth = flatOptions
							.slice(0, index)
							.filter((o) => o.children && o.children.some((c) => c.id === option.id)).length}

						<tr class="border-b transition-colors hover:bg-muted/30">
							<!-- Option Name Column -->
							<td class="p-4" style="padding-left: {depth * 24 + 16}px">
								<div class="flex items-center gap-2">
									{#if isParent}
										<button
											onclick={() => toggleExpand(option.id)}
											class="rounded p-1 transition-colors hover:bg-muted"
										>
											{#if isExpanded}
												<ChevronDown class="h-4 w-4" />
											{:else}
												<ChevronRight class="h-4 w-4" />
											{/if}
										</button>
									{:else}
										<div class="w-6"></div>
									{/if}
									<div class="flex flex-col">
										<span class="text-sm font-medium">
											{option.label || option.name}
										</span>
										{#if option.uri}
											<span class="font-mono text-xs text-muted-foreground">{option.uri}</span>
										{/if}
									</div>
									{#if isParent}
										<Badge variant="outline" class="ml-2 text-xs">
											{option.children?.length || 0}
										</Badge>
									{/if}
								</div>
							</td>

							<!-- Permission Checkboxes -->
							{#if !isParent}
								{#each permissions as permission (permission.id)}
									{@const checked = isPermissionChecked(option.id, permission.id)}
									<td class="p-4 text-center">
										<div class="flex items-center justify-center">
											<Checkbox
												{checked}
												onCheckedChange={(isChecked) =>
													onPermissionChange(option.id, permission.id, isChecked === true)}
												disabled={isSaving}
											/>
										</div>
									</td>
								{/each}
							{:else}
								{#each permissions as permission (permission.id)}
									<td class="bg-muted/20 p-4 text-center">
										<div class="text-xs text-muted-foreground">-</div>
									</td>
								{/each}
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card.Content>

	<Card.Footer class="flex justify-between border-t">
		<div class="text-sm text-muted-foreground">
			{flatOptions.filter((o) => !(o.children && o.children.length > 0)).length} options × {permissions.length}
			permissions
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={onCancel} disabled={isSaving}>
				<X class="mr-2 h-4 w-4" />
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={isSaving || pendingChanges === 0}>
				{#if isSaving}
					<div
						class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					></div>
					Saving...
				{:else}
					<Save class="mr-2 h-4 w-4" />
					Save Changes
				{/if}
			</Button>
		</div>
	</Card.Footer>
</Card.Root>
