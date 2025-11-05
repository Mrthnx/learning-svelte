<script lang="ts">
	import { authStore } from '$lib/store';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card } from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { User, Mail, Phone, Building2, MapPin, Shield, Save, Edit2, X } from 'lucide-svelte';
	import { api } from '$lib/services/api';

	let user = $derived($authStore.user);
	let isEditing = $state(false);
	let isSaving = $state(false);

	// Form state
	let formData = $state({
		name: user?.name || '',
		email: user?.email || '',
		phone: user?.phone || '',
		city: user?.city || '',
		province: user?.province || '',
		address: user?.address || '',
		zip: user?.zip || ''
	});

	// Reset form data when user changes or editing mode toggles
	$effect(() => {
		if (!isEditing && user) {
			formData = {
				name: user.name || '',
				email: user.email || '',
				phone: user.phone || '',
				city: user.city || '',
				province: user.province || '',
				address: user.address || '',
				zip: user.zip || ''
			};
		}
	});

	function handleEdit() {
		isEditing = true;
	}

	function handleCancel() {
		isEditing = false;
		// Reset form to original values
		formData = {
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			city: user?.city || '',
			province: user?.province || '',
			address: user?.address || '',
			zip: user?.zip || ''
		};
	}

	async function handleSave() {
		if (!user?.id) return;

		isSaving = true;
		try {
			const updateData = {
				id: user.id,
				...formData
			};

			await api.patch(`users/${user.id}`, updateData);

			// Update the auth store with new user data
			const updatedUser = { ...user, ...formData };
			await authStore.login(updatedUser, $authStore.token || '', $authStore.menu);

			toast.success('Profile updated successfully');
			isEditing = false;
		} catch (error: any) {
			console.error('Error updating profile:', error);
			toast.error(error.message || 'Failed to update profile');
		} finally {
			isSaving = false;
		}
	}

	function getInitials(name?: string): string {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class="container mx-auto max-w-5xl space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Profile</h1>
			<p class="text-muted-foreground">Manage your personal information</p>
		</div>
		<div class="flex gap-2">
			{#if isEditing}
				<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2">
					<X class="h-4 w-4" />
					Cancel
				</Button>
				<Button onclick={handleSave} disabled={isSaving} class="gap-2">
					<Save class="h-4 w-4" />
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			{:else}
				<Button onclick={handleEdit} class="gap-2">
					<Edit2 class="h-4 w-4" />
					Edit Profile
				</Button>
			{/if}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Profile Card -->
		<Card class="lg:col-span-1">
			<div class="p-6">
				<div class="flex flex-col items-center space-y-4">
					<!-- Avatar -->
					<div
						class="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-bold text-primary"
					>
						{#if user?.image}
							<img src={user.image} alt={user.name} class="h-full w-full rounded-full object-cover" />
						{:else}
							{getInitials(user?.name)}
						{/if}
					</div>

					<!-- Name and Email -->
					<div class="text-center">
						<h2 class="text-2xl font-bold">{user?.name || 'User'}</h2>
						<p class="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
					</div>

					<!-- Role Badge -->
					{#if user?.role}
						<div
							class="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
						>
							<Shield class="h-4 w-4" />
							{user.role.name || user.role.description || 'User'}
						</div>
					{/if}

					<!-- Organization Info -->
					<div class="w-full space-y-3 border-t pt-4">
						{#if user?.account}
							<div class="flex items-center gap-2 text-sm">
								<Building2 class="h-4 w-4 text-muted-foreground" />
								<span class="text-muted-foreground">Account:</span>
								<span class="font-medium">{user.account.description || user.account.code}</span>
							</div>
						{/if}
						{#if user?.plant}
							<div class="flex items-center gap-2 text-sm">
								<Building2 class="h-4 w-4 text-muted-foreground" />
								<span class="text-muted-foreground">Plant:</span>
								<span class="font-medium">{user.plant.description || user.plant.code}</span>
							</div>
						{/if}
						{#if user?.area}
							<div class="flex items-center gap-2 text-sm">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<span class="text-muted-foreground">Area:</span>
								<span class="font-medium">{user.area.description || user.area.code}</span>
							</div>
						{/if}
						{#if user?.system}
							<div class="flex items-center gap-2 text-sm">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<span class="text-muted-foreground">System:</span>
								<span class="font-medium">{user.system.description || user.system.code}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</Card>

		<!-- Information Form -->
		<Card class="lg:col-span-2">
			<div class="p-6">
				<h3 class="mb-6 text-xl font-semibold">Personal Information</h3>

				<form class="space-y-6" on:submit|preventDefault={handleSave}>
					<!-- Name -->
					<div class="space-y-2">
						<Label for="name" class="flex items-center gap-2">
							<User class="h-4 w-4" />
							Full Name
						</Label>
						<Input
							id="name"
							type="text"
							bind:value={formData.name}
							disabled={!isEditing}
							placeholder="Enter your full name"
							required
						/>
					</div>

					<!-- Email -->
					<div class="space-y-2">
						<Label for="email" class="flex items-center gap-2">
							<Mail class="h-4 w-4" />
							Email
						</Label>
						<Input
							id="email"
							type="email"
							bind:value={formData.email}
							disabled={!isEditing}
							placeholder="Enter your email"
							required
						/>
					</div>

					<!-- Phone -->
					<div class="space-y-2">
						<Label for="phone" class="flex items-center gap-2">
							<Phone class="h-4 w-4" />
							Phone
						</Label>
						<Input
							id="phone"
							type="tel"
							bind:value={formData.phone}
							disabled={!isEditing}
							placeholder="Enter your phone number"
						/>
					</div>

					<!-- Address Section -->
					<div class="space-y-4 border-t pt-4">
						<h4 class="font-medium">Address Information</h4>

						<!-- Address -->
						<div class="space-y-2">
							<Label for="address">Street Address</Label>
							<Input
								id="address"
								type="text"
								bind:value={formData.address}
								disabled={!isEditing}
								placeholder="Enter your address"
							/>
						</div>

						<!-- City and Province -->
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for="city">City</Label>
								<Input
									id="city"
									type="text"
									bind:value={formData.city}
									disabled={!isEditing}
									placeholder="City"
								/>
							</div>
							<div class="space-y-2">
								<Label for="province">Province/State</Label>
								<Input
									id="province"
									type="text"
									bind:value={formData.province}
									disabled={!isEditing}
									placeholder="Province"
								/>
							</div>
						</div>

						<!-- ZIP -->
						<div class="space-y-2">
							<Label for="zip">ZIP/Postal Code</Label>
							<Input
								id="zip"
								type="text"
								bind:value={formData.zip}
								disabled={!isEditing}
								placeholder="ZIP Code"
							/>
						</div>
					</div>
				</form>
			</div>
		</Card>
	</div>

	<!-- Additional Info Card -->
	<Card>
		<div class="p-6">
			<h3 class="mb-4 text-xl font-semibold">Account Settings</h3>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">User Code</p>
					<p class="font-medium">{user?.code || 'N/A'}</p>
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">Language</p>
					<p class="font-medium">{user?.languagePreference || 'System Default'}</p>
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">Two-Factor Authentication</p>
					<p class="font-medium">{user?.twoFactorAuth ? 'Enabled' : 'Disabled'}</p>
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">Email Notifications</p>
					<p class="font-medium">{user?.allowAlarmsSentEmail ? 'Enabled' : 'Disabled'}</p>
				</div>
			</div>
		</div>
	</Card>
</div>
