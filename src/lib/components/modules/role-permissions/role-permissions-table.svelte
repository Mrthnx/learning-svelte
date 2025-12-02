<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Table from '$lib/components/me/table.svelte';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { Settings } from 'lucide-svelte';
	import { api } from '$lib/services/api';
	import { toast } from 'svelte-sonner';
	import type { Role } from '$lib/services/role.service';

	let roles = $state<Role[]>([]);
	let loading = $state(true);
	let companyModalOpen = $state(false);
	let rolePendingConfiguration: Role | null = $state(null);

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
		rolePendingConfiguration = role;
		companyModalOpen = true;
	}

	type ModalAction = 'close' | 'confirm' | 'cancel' | 'primary' | 'secondary';

	function handleCompanySelection(action: ModalAction) {
		if (!rolePendingConfiguration) {
			companyModalOpen = false;
			return;
		}

		if (action === 'primary' || action === 'secondary') {
			if (!rolePendingConfiguration.id) {
				companyModalOpen = false;
				rolePendingConfiguration = null;
				toast.error('Role information is incomplete');
				return;
			}
			const companyId = action === 'primary' ? 1 : 2;
			goto(`/database-setup/role-permissions/${rolePendingConfiguration.id}?company=${companyId}`);
			companyModalOpen = false;
			rolePendingConfiguration = null;
			return;
		}

		if (action === 'cancel' || action === 'close') {
			companyModalOpen = false;
			rolePendingConfiguration = null;
		}
	}

	const columns = [
		{
			key: 'code',
			label: 'Code',
			render: () => 'ROL-HC',
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
			render: () => 'Epica'
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
	<AlertModal
		bind:open={companyModalOpen}
		type="confirm"
		title="Seleccionar compañía"
		description={`¿Para qué compañía quieres configurar ${rolePendingConfiguration?.name || 'este rol'}?`}
		buttons={[
			{ label: 'PDM Monitor', action: 'primary', variant: 'default' },
			{ label: 'PDM Director', action: 'secondary', variant: 'secondary' },
			{ label: 'Cancelar', action: 'cancel', variant: 'outline' }
		]}
		onAction={handleCompanySelection}
	/>
{/if}
