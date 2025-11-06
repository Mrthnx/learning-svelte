<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { api } from '$lib/services/api';
	import { RolePermissionsEditor } from '$lib/components/modules/role-permissions';
	import type { Role } from '$lib/services/role.service';
	import { authStore } from '$lib/store';

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

	let roleId: number;
	let role: Role | null = $state(null);
	let optionsTree: Option[] = $state([]);
	let permissions: Permission[] = $state([]);
	let rolePermissions: RolePermissionDetail[] = $state([]);
	let loading = $state(true);
	let saving = $state(false);
	let companyId: number = 1; // Get from authStore

	// Track changes
	let pendingChanges: Map<
		string,
		{ optionId: number; permissionId: number; action: 'add' | 'remove' }
	> = $state(new Map());

	$effect(() => {
		roleId = parseInt($page.params.id);
	});

	onMount(async () => {
		// Get company ID from auth store
		let currentAuth: any;
		const unsubscribe = authStore.subscribe((state) => {
			currentAuth = state;
		});
		unsubscribe();
		
		if (currentAuth?.user?.company) {
			companyId = currentAuth.user.company;
		}
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;

			// Load all data in parallel using correct menu-management endpoints
			const [roleData, optionsData, permissionsData, rolePermData] = await Promise.all([
				api.get(`menu-management/roles/${roleId}`),
				api.get('menu-management/options/tree'),
				api.get('menu-management/permissions'),
				api.get(`menu-management/roles/${roleId}/permissions?company=${companyId}`)
			]);

			role = roleData.data;
			// Sort options tree by order property
			optionsTree = sortOptionsTree(optionsData.data || []);
			permissions = permissionsData.data || [];
			// Extract permissions array from the response structure
			rolePermissions = rolePermData.data?.permissions || [];
		} catch (error: any) {
			console.error('Error loading data:', error);
			toast.error('Error loading permissions data');
			setTimeout(() => goto('/database-setup/role-permissions'), 2000);
		} finally {
			loading = false;
		}
	}

	// Sort options tree recursively by order property
	function sortOptionsTree(options: Option[]): Option[] {
		return options
			.sort((a, b) => a.order - b.order)
			.map((option) => ({
				...option,
				children: option.children ? sortOptionsTree(option.children) : undefined
			}));
	}

	function handlePermissionChange(optionId: number, permissionId: number, checked: boolean) {
		const key = `${optionId}-${permissionId}`;

		if (checked) {
			// Check if permission already exists
			const exists = rolePermissions.some(
				(rp) => rp.optionId === optionId && rp.permissionId === permissionId
			);

			if (!exists) {
				// Add to pending changes
				pendingChanges.set(key, { optionId, permissionId, action: 'add' });

				// Add temporarily to rolePermissions for UI
				rolePermissions = [
					...rolePermissions,
					{
						id: -1, // Temporary ID
						optionId,
						permissionId
					}
				];
			}
		} else {
			// Remove permission
			pendingChanges.set(key, { optionId, permissionId, action: 'remove' });

			// Remove temporarily from rolePermissions for UI
			rolePermissions = rolePermissions.filter(
				(rp) => !(rp.optionId === optionId && rp.permissionId === permissionId)
			);
		}

		pendingChanges = pendingChanges; // Trigger reactivity
	}

	async function saveChanges() {
		if (pendingChanges.size === 0) {
			toast.info('No changes to save');
			return;
		}

		try {
			saving = true;

			// Group changes by action
			const additions: { optionId: number; permissionId: number }[] = [];
			const removals: { optionId: number; permissionId: number }[] = [];

			for (const [, change] of pendingChanges) {
				if (change.action === 'add') {
					additions.push({ optionId: change.optionId, permissionId: change.permissionId });
				} else {
					removals.push({ optionId: change.optionId, permissionId: change.permissionId });
				}
			}

			// Process all changes
			const promises = [];

			// Remove permissions first
			for (const removal of removals) {
				promises.push(
					api.del(
						`menu-management/roles/${roleId}/permissions/${removal.optionId}/${removal.permissionId}?company=${companyId}`
					)
				);
			}

			// Add permissions
			for (const addition of additions) {
				promises.push(
					api.post(`menu-management/roles/${roleId}/permissions`, {
						company: companyId,
						optionId: addition.optionId,
						permissionId: addition.permissionId
					})
				);
			}

			await Promise.all(promises);

			// Clear pending changes
			pendingChanges.clear();
			pendingChanges = pendingChanges;

			toast.success('Permissions updated successfully');

			// Reload data to ensure consistency
			await loadData();
		} catch (error: any) {
			console.error('Error saving changes:', error);
			toast.error('Error saving changes');
		} finally {
			saving = false;
		}
	}

	async function resetChanges() {
		pendingChanges.clear();
		pendingChanges = pendingChanges;
		await loadData();
		toast.info('Changes discarded');
	}

	function goBack() {
		goto('/database-setup/role-permissions');
	}

	function getRoleLevelBadgeClass(level: number): string {
		if (level <= 1) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
		if (level <= 2) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		if (level <= 3) return 'bg-green-500/20 text-green-300 border-green-500/30';
		return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
	}

	function handleCancel() {
		if (pendingChanges.size > 0) {
			const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
			if (!confirm) return;
		}
		goBack();
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center gap-4 mb-6">
		<Button variant="ghost" size="icon" onclick={goBack}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		{#if role}
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold tracking-tight">{role.description}</h1>
				<Badge variant="outline" class={getRoleLevelBadgeClass(role.level)}>
					Level {role.level}
				</Badge>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-16">
			<div class="animate-pulse text-muted-foreground">Loading permissions configuration...</div>
		</div>
	{:else if optionsTree.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<p class="text-muted-foreground">No menu options found in the system</p>
			<p class="text-sm text-muted-foreground mt-2">Contact your system administrator</p>
		</div>
	{:else}
		<RolePermissionsEditor
			{optionsTree}
			{permissions}
			{rolePermissions}
			{onPermissionChange}
			onSave={saveChanges}
			onCancel={handleCancel}
			pendingChanges={pendingChanges.size}
			isSaving={saving}
		/>
	{/if}
</div>
