<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { UserForm } from '$lib/components/modules/users';
	import { userService, type User } from '$lib/services/user.service';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let user: User | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updatedUserCode = $state('');

	const userId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadUser();
	});

	async function loadUser() {
		isLoading = true;
		try {
			user = await userService.getById(userId);
		} catch (error: any) {
			console.error('Error loading user:', error);
			toast.error(error.message || 'Failed to load user');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: User) {
		await userService.update(userId, data);
		updatedUserCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
			goto('/database-setup/users');
		}
	}

	function handleCancel() {
		goto('/database-setup/users');
	}
</script>

<div class="container mx-auto max-w-6xl p-4 sm:p-6">
	<div class="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
		<Button variant="ghost" onclick={handleCancel} size="sm" class="gap-2">
			<ArrowLeft class="h-4 w-4" />
			<span class="sm:inline">Back to Users</span>
		</Button>
		<div>
			<h1 class="text-2xl font-bold sm:text-3xl">Edit User</h1>
			<p class="text-sm text-muted-foreground sm:text-base">Update the user information</p>
		</div>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else if user}
		<UserForm
			user={user}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
			isEdit={true}
			availableRoles={data.roles}
		/>
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="User Updated Successfully!"
	description={`The user "${updatedUserCode}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
