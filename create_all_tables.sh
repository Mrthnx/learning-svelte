#!/bin/bash

echo "🔧 Creando tablas para todos los módulos..."

# Area Table
cat > src/lib/components/modules/areas/area-table.svelte << 'EOF'
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Pencil, Trash2, MapPin } from 'lucide-svelte';
	import type { Area } from '$lib/services/area.service';

	interface Props {
		areas: Area[];
		onEdit: (area: Area) => void;
		onDelete: (area: Area) => void;
		isLoading?: boolean;
	}

	let { areas, onEdit, onDelete, isLoading = false }: Props = $props();
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Code</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head>Plant</Table.Head>
				<Table.Head>Contact</Table.Head>
				<Table.Head>Location</Table.Head>
				<Table.Head>Order</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if isLoading}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center">
						<div class="flex items-center justify-center py-8">
							<div
								class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
							></div>
						</div>
					</Table.Cell>
				</Table.Row>
			{:else if areas.length === 0}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center text-muted-foreground">
						No areas found
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each areas as area}
					<Table.Row>
						<Table.Cell class="font-medium">{area.code}</Table.Cell>
						<Table.Cell>{area.description}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline">{area.plant?.code}</Badge>
						</Table.Cell>
						<Table.Cell>
							{#if area.nameContactor}
								<div class="text-sm">
									<div>{area.nameContactor}</div>
									{#if area.telephoneContactor}
										<div class="text-xs text-muted-foreground">{area.telephoneContactor}</div>
									{/if}
								</div>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if area.latitude && area.longitude}
								<div class="flex items-center gap-1 text-sm">
									<MapPin class="h-3 w-3" />
									<span class="text-xs text-muted-foreground">
										{area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
									</span>
								</div>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>{area.order}</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onEdit(area)}
									disabled={isLoading}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onDelete(area)}
									disabled={isLoading}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
EOF

echo "✅ Area table creada"

# System Table
cat > src/lib/components/modules/systems/system-table.svelte << 'EOF'
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Pencil, Trash2, MapPin } from 'lucide-svelte';
	import type { System } from '$lib/services/system.service';

	interface Props {
		systems: System[];
		onEdit: (system: System) => void;
		onDelete: (system: System) => void;
		isLoading?: boolean;
	}

	let { systems, onEdit, onDelete, isLoading = false }: Props = $props();
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Code</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head>Area</Table.Head>
				<Table.Head>Contact</Table.Head>
				<Table.Head>Location</Table.Head>
				<Table.Head>Order</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if isLoading}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center">
						<div class="flex items-center justify-center py-8">
							<div
								class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
							></div>
						</div>
					</Table.Cell>
				</Table.Row>
			{:else if systems.length === 0}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center text-muted-foreground">
						No systems found
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each systems as system}
					<Table.Row>
						<Table.Cell class="font-medium">{system.code}</Table.Cell>
						<Table.Cell>{system.description}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline">{system.area?.code}</Badge>
						</Table.Cell>
						<Table.Cell>
							{#if system.nameContactor}
								<div class="text-sm">
									<div>{system.nameContactor}</div>
									{#if system.telephoneContactor}
										<div class="text-xs text-muted-foreground">{system.telephoneContactor}</div>
									{/if}
								</div>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if system.latitude && system.longitude}
								<div class="flex items-center gap-1 text-sm">
									<MapPin class="h-3 w-3" />
									<span class="text-xs text-muted-foreground">
										{system.latitude.toFixed(4)}, {system.longitude.toFixed(4)}
									</span>
								</div>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>{system.order}</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onEdit(system)}
									disabled={isLoading}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onDelete(system)}
									disabled={isLoading}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
EOF

echo "✅ System table creada"

# Asset Table
cat > src/lib/components/modules/assets/asset-table.svelte << 'EOF'
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Pencil, Trash2, MapPin, Activity } from 'lucide-svelte';
	import type { Asset } from '$lib/services/asset.service';

	interface Props {
		assets: Asset[];
		onEdit: (asset: Asset) => void;
		onDelete: (asset: Asset) => void;
		isLoading?: boolean;
	}

	let { assets, onEdit, onDelete, isLoading = false }: Props = $props();
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Code</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head>System</Table.Head>
				<Table.Head>RPM</Table.Head>
				<Table.Head>Location</Table.Head>
				<Table.Head>Order</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if isLoading}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center">
						<div class="flex items-center justify-center py-8">
							<div
								class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
							></div>
						</div>
					</Table.Cell>
				</Table.Row>
			{:else if assets.length === 0}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center text-muted-foreground">
						No assets found
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each assets as asset}
					<Table.Row>
						<Table.Cell class="font-medium">{asset.code}</Table.Cell>
						<Table.Cell>{asset.description}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline">{asset.system?.code}</Badge>
						</Table.Cell>
						<Table.Cell>
							{#if asset.rpm}
								<div class="flex items-center gap-1">
									<Activity class="h-3 w-3 text-blue-500" />
									<span>{asset.rpm}</span>
								</div>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if asset.latitude && asset.longitude}
								<div class="flex items-center gap-1 text-sm">
									<MapPin class="h-3 w-3" />
									<span class="text-xs text-muted-foreground">
										{asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}
									</span>
								</div>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>{asset.order}</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onEdit(asset)}
									disabled={isLoading}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onDelete(asset)}
									disabled={isLoading}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
EOF

echo "✅ Asset table creada"

# Component Table
cat > src/lib/components/modules/components/component-table.svelte << 'EOF'
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import type { Component } from '$lib/services/component.service';

	interface Props {
		components: Component[];
		onEdit: (component: Component) => void;
		onDelete: (component: Component) => void;
		isLoading?: boolean;
	}

	let { components, onEdit, onDelete, isLoading = false }: Props = $props();
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Code</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head>Asset</Table.Head>
				<Table.Head>Type</Table.Head>
				<Table.Head>Order</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if isLoading}
				<Table.Row>
					<Table.Cell colspan={6} class="text-center">
						<div class="flex items-center justify-center py-8">
							<div
								class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
							></div>
						</div>
					</Table.Cell>
				</Table.Row>
			{:else if components.length === 0}
				<Table.Row>
					<Table.Cell colspan={6} class="text-center text-muted-foreground">
						No components found
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each components as component}
					<Table.Row>
						<Table.Cell class="font-medium">{component.code}</Table.Cell>
						<Table.Cell>{component.description}</Table.Cell>
						<Table.Cell>
							<Badge variant="outline">{component.mawoi?.code}</Badge>
						</Table.Cell>
						<Table.Cell>
							{#if component.componentType}
								<Badge variant="secondary">{component.componentType.code}</Badge>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>{component.order}</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onEdit(component)}
									disabled={isLoading}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onDelete(component)}
									disabled={isLoading}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
EOF

echo "✅ Component table creada"

# User Table
cat > src/lib/components/modules/users/user-table.svelte << 'EOF'
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Pencil, Trash2, Mail, Phone, CheckCircle2, XCircle } from 'lucide-svelte';
	import type { User } from '$lib/services/user.service';

	interface Props {
		users: User[];
		onEdit: (user: User) => void;
		onDelete: (user: User) => void;
		isLoading?: boolean;
	}

	let { users, onEdit, onDelete, isLoading = false }: Props = $props();

	function getInitials(name?: string, lastName?: string): string {
		const firstInitial = name?.charAt(0).toUpperCase() || '';
		const lastInitial = lastName?.charAt(0).toUpperCase() || '';
		return `${firstInitial}${lastInitial}`;
	}
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>User</Table.Head>
				<Table.Head>Email</Table.Head>
				<Table.Head>Account</Table.Head>
				<Table.Head>Role</Table.Head>
				<Table.Head>Contact</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if isLoading}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center">
						<div class="flex items-center justify-center py-8">
							<div
								class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
							></div>
						</div>
					</Table.Cell>
				</Table.Row>
			{:else if users.length === 0}
				<Table.Row>
					<Table.Cell colspan={7} class="text-center text-muted-foreground">
						No users found
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each users as user}
					<Table.Row>
						<Table.Cell>
							<div class="flex items-center gap-3">
								<Avatar class="h-8 w-8">
									<AvatarImage src={user.image} alt={`${user.name} ${user.lastName}`} />
									<AvatarFallback>{getInitials(user.name, user.lastName)}</AvatarFallback>
								</Avatar>
								<div>
									<div class="font-medium">{user.name} {user.lastName}</div>
									{#if user.dni}
										<div class="text-xs text-muted-foreground">DNI: {user.dni}</div>
									{/if}
								</div>
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<Mail class="h-3 w-3 text-muted-foreground" />
								<span class="text-sm">{user.email}</span>
							</div>
						</Table.Cell>
						<Table.Cell>
							<Badge variant="outline">{user.account?.code}</Badge>
						</Table.Cell>
						<Table.Cell>
							{#if user.role}
								<Badge variant="secondary">{user.role.code}</Badge>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if user.phone}
								<div class="flex items-center gap-2 text-sm">
									<Phone class="h-3 w-3 text-muted-foreground" />
									<span>{user.phone}</span>
								</div>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if user.active}
								<Badge variant="default" class="flex items-center gap-1">
									<CheckCircle2 class="h-3 w-3" />
									Active
								</Badge>
							{:else}
								<Badge variant="destructive" class="flex items-center gap-1">
									<XCircle class="h-3 w-3" />
									Inactive
								</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onEdit(user)}
									disabled={isLoading}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => onDelete(user)}
									disabled={isLoading}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
EOF

echo "✅ User table creada"

echo ""
echo "🎉 Todas las tablas han sido creadas!"
echo "- Area table"
echo "- System table"
echo "- Asset table"
echo "- Component table"
echo "- User table"
