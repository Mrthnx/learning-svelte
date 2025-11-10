<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Table from '$lib/components/me/table.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Settings } from 'lucide-svelte';
	import { api } from '$lib/services/api';
	import { toast } from 'svelte-sonner';
	import type { Role } from '$lib/services/role.service';

	let roles = $state<Role[]>([]);
	let loading = $state(true);

	onMount(async () => {
		await loadRoles();
	});

	async function loadRoles() {
		try {
			loading = true;
			const response = await api.get('menu-management/roles');
			roles = response.data || [];
		} catch (error) {
			console.error('Error loading roles:', error);
			toast.error('Error loading roles');
		} finally {
			loading = false;
		}
	}

	function handleConfigurePermissions(role: Role) {
		goto(`/database-setup/role-permissions/${role.id}`);
	}

	function getRoleLevelColor(level: number): string {
		if (level <= 1) return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
		if (level <= 2) return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
		if (level <= 3) return 'bg-green-100 text-green-800 hover:bg-green-100';
		return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
	}

	const columns = [
		{
			key: 'code',
			label: 'Code',
			render: (role: Role) => role.code || '-',
			class: 'font-mono text-sm'
		},
		{
			key: 'name',
			label: 'Name',
			render: (role: Role) => role.name || '-',
			class: 'font-medium'
		},
		{
			key: 'description',
			label: 'Description',
			render: (role: Role) => role.description || '-'
		},
		{
			key: 'level',
			label: 'Level',
			render: (role: Role) => role.level?.toString() || '-',
			class: 'text-center'
		}
	];

	const actions = [
		{
			label: 'Configure Permissions',
			icon: Settings,
			onClick: handleConfigurePermissions,
			variant: 'default' as const
		}
	];
</script>

{#if loading}
	<div class="flex items-center justify-center py-12">
		<div class="animate-pulse text-muted-foreground">Loading roles...</div>
	</div>
{:else}
	<Table data={roles} {columns} {actions} emptyMessage="No roles found in the system." />
{/if}
