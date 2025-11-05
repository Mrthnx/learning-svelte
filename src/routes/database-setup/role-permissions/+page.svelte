<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card } from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Shield, Save, RefreshCw, Search, Check, X } from 'lucide-svelte';
	import { roleService } from '$lib/services/role.service';
	import type { Role, RolePermission } from '$lib/types';

	let roles: Role[] = $state([]);
	let permissions: RolePermission[] = $state([]);
	let selectedRole: Role | null = $state(null);
	let selectedPermissions: Set<number> = $state(new Set());
	let isLoading = $state(false);
	let isSaving = $state(false);
	let searchTerm = $state('');

	// Filtered roles based on search
	let filteredRoles = $derived(
		roles.filter(
			(role) =>
				role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				role.description?.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	onMount(() => {
		loadData();
	});

	async function loadData() {
		isLoading = true;
		try {
			// Load roles and permissions in parallel
			const [rolesResponse, permissionsData] = await Promise.all([
				roleService.getAll({ pageSize: 100 }),
				roleService.getPermissions()
			]);

			roles = rolesResponse.rows;
			permissions = permissionsData;
		} catch (error: any) {
			console.error('Error loading data:', error);
			toast.error(error.message || 'Failed to load data');
		} finally {
			isLoading = false;
		}
	}

	function handleRoleSelect(role: Role) {
		selectedRole = role;
		// TODO: Load current permissions for this role
		// For now, we'll just clear the selection
		selectedPermissions = new Set();
	}

	function togglePermission(permissionId: number) {
		const newSet = new Set(selectedPermissions);
		if (newSet.has(permissionId)) {
			newSet.delete(permissionId);
		} else {
			newSet.add(permissionId);
		}
		selectedPermissions = newSet;
	}

	function toggleAllPermissions() {
		if (selectedPermissions.size === permissions.length) {
			selectedPermissions = new Set();
		} else {
			selectedPermissions = new Set(permissions.map((p) => p.id));
		}
	}

	async function handleSave() {
		if (!selectedRole) {
			toast.error('Please select a role');
			return;
		}

		isSaving = true;
		try {
			// TODO: Implement API call to save role permissions
			// await api.post(`roles/${selectedRole.id}/permissions`, {
			//   permissionIds: Array.from(selectedPermissions)
			// });

			toast.success('Permissions updated successfully');
		} catch (error: any) {
			console.error('Error saving permissions:', error);
			toast.error(error.message || 'Failed to save permissions');
		} finally {
			isSaving = false;
		}
	}

	function handleRefresh() {
		selectedRole = null;
		selectedPermissions = new Set();
		loadData();
	}

	// Group permissions by module/section if needed
	// For now we'll display them in a simple list
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Role Permissions</h1>
			<p class="text-muted-foreground">Assign permissions to roles</p>
		</div>
		<Button onclick={handleRefresh} variant="outline" disabled={isLoading} class="gap-2">
			<RefreshCw class={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
			Refresh
		</Button>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Roles List -->
		<Card class="lg:col-span-1">
			<div class="p-6">
				<h3 class="mb-4 text-lg font-semibold">Roles</h3>

				<!-- Search -->
				<div class="mb-4 space-y-2">
					<Label for="search-role" class="flex items-center gap-2">
						<Search class="h-4 w-4" />
						Search
					</Label>
					<Input
						id="search-role"
						type="text"
						bind:value={searchTerm}
						placeholder="Search roles..."
						disabled={isLoading}
					/>
				</div>

				<!-- Roles List -->
				<div class="space-y-2 max-h-[600px] overflow-y-auto pr-2">
					{#if isLoading}
						<div class="flex items-center justify-center py-8">
							<RefreshCw class="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					{:else if filteredRoles.length === 0}
						<p class="text-center text-sm text-muted-foreground py-8">No roles found</p>
					{:else}
						{#each filteredRoles as role (role.id)}
							<button
								class="w-full rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-accent {selectedRole?.id ===
								role.id
									? 'border-primary bg-accent'
									: 'border-border'}"
								onclick={() => handleRoleSelect(role)}
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
									>
										<Shield class="h-5 w-5" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-semibold truncate">{role.name || role.description}</p>
										{#if role.level !== undefined}
											<p class="text-xs text-muted-foreground">Level: {role.level}</p>
										{/if}
									</div>
									{#if selectedRole?.id === role.id}
										<Check class="h-5 w-5 text-primary flex-shrink-0" />
									{/if}
								</div>
							</button>
						{/each}
					{/if}
				</div>
			</div>
		</Card>

		<!-- Permissions Panel -->
		<Card class="lg:col-span-2">
			<div class="p-6">
				<div class="mb-6 flex items-center justify-between">
					<div>
						<h3 class="text-lg font-semibold">Permissions</h3>
						{#if selectedRole}
							<p class="text-sm text-muted-foreground">
								Configure permissions for {selectedRole.name || selectedRole.description}
							</p>
						{:else}
							<p class="text-sm text-muted-foreground">Select a role to configure permissions</p>
						{/if}
					</div>
					{#if selectedRole && permissions.length > 0}
						<Button
							variant="outline"
							size="sm"
							onclick={toggleAllPermissions}
							class="gap-2"
						>
							{selectedPermissions.size === permissions.length ? 'Deselect All' : 'Select All'}
						</Button>
					{/if}
				</div>

				{#if !selectedRole}
					<!-- Empty State -->
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<div class="mb-4 rounded-full bg-muted p-4">
							<Shield class="h-8 w-8 text-muted-foreground" />
						</div>
						<p class="text-lg font-medium">No Role Selected</p>
						<p class="text-sm text-muted-foreground">
							Select a role from the list to configure its permissions
						</p>
					</div>
				{:else if isLoading}
					<!-- Loading State -->
					<div class="flex items-center justify-center py-12">
						<RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				{:else if permissions.length === 0}
					<!-- No Permissions -->
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<p class="text-sm text-muted-foreground">No permissions available</p>
					</div>
				{:else}
					<!-- Permissions Grid -->
					<div class="space-y-4">
						<div class="grid gap-3 sm:grid-cols-2">
							{#each permissions as permission (permission.id)}
								<button
									class="group relative overflow-hidden rounded-lg border p-4 text-left transition-all hover:border-primary hover:shadow-md {selectedPermissions.has(
										permission.id
									)
										? 'border-primary bg-primary/5'
										: 'border-border'}"
									onclick={() => togglePermission(permission.id)}
								>
									<div class="flex items-start gap-3">
										<!-- Checkbox -->
										<div
											class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all {selectedPermissions.has(
												permission.id
											)
												? 'border-primary bg-primary'
												: 'border-input group-hover:border-primary'}"
										>
											{#if selectedPermissions.has(permission.id)}
												<Check class="h-3 w-3 text-primary-foreground" />
											{/if}
										</div>

										<!-- Permission Info -->
										<div class="flex-1 min-w-0">
											<p class="font-medium text-sm truncate">
												{permission.label || permission.permission || 'Permission'}
											</p>
											{#if permission.permission && permission.label !== permission.permission}
												<p class="text-xs text-muted-foreground mt-1 truncate">
													{permission.permission}
												</p>
											{/if}
										</div>
									</div>
								</button>
							{/each}
						</div>

						<!-- Summary -->
						<div class="rounded-lg border bg-muted/50 p-4">
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">Selected Permissions:</span>
								<span class="font-semibold">
									{selectedPermissions.size} / {permissions.length}
								</span>
							</div>
						</div>

						<!-- Save Button -->
						<div class="flex justify-end gap-3 border-t pt-4">
							<Button
								variant="outline"
								onclick={() => {
									selectedRole = null;
									selectedPermissions = new Set();
								}}
								disabled={isSaving}
								class="gap-2"
							>
								<X class="h-4 w-4" />
								Cancel
							</Button>
							<Button onclick={handleSave} disabled={isSaving} class="gap-2">
								<Save class="h-4 w-4" />
								{isSaving ? 'Saving...' : 'Save Permissions'}
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</Card>
	</div>
</div>
