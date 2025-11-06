<script lang="ts">
	import { RolePermissionsTable } from '$lib/components/modules/role-permissions';
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold tracking-tight">Role Permissions</h1>
		<p class="text-muted-foreground">Manage role permissions and access control</p>
	</div>

	<!-- Roles Table Component -->
	<RolePermissionsTable />
</div>
