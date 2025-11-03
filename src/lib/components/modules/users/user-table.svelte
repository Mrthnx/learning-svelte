<script lang="ts">
	import Table from '$lib/components/me/table.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { User } from '$lib/services/user.service';

	interface Props {
		users: User[];
		onEdit: (user: User) => void;
		onDelete: (user: User) => void;
		onResetPassword?: (user: User) => void;
		onSelectionChange?: (selected: User[]) => void;
		selectable?: boolean;
	}

	let {
		users,
		onEdit,
		onDelete,
		onResetPassword,
		onSelectionChange,
		selectable = false
	}: Props = $props();

	// Role colors based on role code
	function getRoleColor(roleCode?: string): string {
		if (!roleCode) return 'bg-gray-100 text-gray-800 hover:bg-gray-100';

		const code = roleCode.toLowerCase();

		// Super Admin
		if (code.includes('super')) {
			return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
		}
		// Account level
		if (code.includes('account')) {
			if (code.includes('admin')) {
				return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
			}
			return 'bg-blue-50 text-blue-700 hover:bg-blue-50';
		}
		// Plant level
		if (code.includes('plant')) {
			if (code.includes('admin')) {
				return 'bg-green-100 text-green-800 hover:bg-green-100';
			}
			return 'bg-green-50 text-green-700 hover:bg-green-50';
		}
		// Area level
		if (code.includes('area')) {
			if (code.includes('admin')) {
				return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
			}
			return 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50';
		}
		// System level
		if (code.includes('system')) {
			if (code.includes('admin')) {
				return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
			}
			return 'bg-orange-50 text-orange-700 hover:bg-orange-50';
		}

		return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
	}

	// Hierarchy level colors
	function getHierarchyColor(level: 'account' | 'plant' | 'area' | 'system'): string {
		switch (level) {
			case 'account':
				return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
			case 'plant':
				return 'bg-green-100 text-green-800 hover:bg-green-100';
			case 'area':
				return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
			case 'system':
				return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
			default:
				return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
		}
	}

	const columns = [
		{
			key: 'id',
			label: 'ID',
			class: 'w-16'
		},
		{
			key: 'name',
			label: 'Name',
			class: 'font-medium',
			render: (user: User) => `${user.name || ''} ${user.lastName || ''}`.trim() || '-'
		},
		{
			key: 'email',
			label: 'Email',
			render: (user: User) => user.email || '-',
			class: 'text-sm'
		},
		{
			key: 'phone',
			label: 'Phone',
			render: (user: User) => user.phone || '-'
		},
		{
			key: 'hierarchy',
			label: 'Hierarchy',
			render: (user: User) => {
				const parts = [];
				if (user.account?.code) parts.push(user.account.code);
				if (user.plant?.code) parts.push(user.plant.code);
				if (user.area?.code) parts.push(user.area.code);
				if (user.system?.code) parts.push(user.system.code);
				return parts.length > 0 ? parts.join(' > ') : '-';
			}
		},
		{
			key: 'role',
			label: 'Role',
			render: (user: User) => user.role?.name || user.role?.code || '-',
			class: 'text-primary'
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

	const dropdownActions = onResetPassword
		? [
				{
					label: 'Reset Password',
					onClick: onResetPassword
				}
			]
		: [];
</script>

<Table
	data={users}
	{columns}
	{actions}
	{dropdownActions}
	{selectable}
	{onSelectionChange}
	emptyMessage="No users found. Create your first user to get started."
/>
