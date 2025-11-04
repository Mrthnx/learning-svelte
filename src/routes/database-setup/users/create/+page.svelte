<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Plus, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { UserForm } from '$lib/components/modules/users';
	import { userService, type User } from '$lib/services/user.service';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showSuccessDialog = $state(false);
	let createdUserCode = $state('');

	async function handleSubmit(data: User) {
		await userService.create(data);
		createdUserCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			// Create Another
			showSuccessDialog = false;
			window.location.reload(); // Reload to reset form
		} else if (action === 'secondary') {
			// Go to List
			showSuccessDialog = false;
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
			<h1 class="text-2xl font-bold sm:text-3xl">Create User</h1>
			<p class="text-sm text-muted-foreground sm:text-base">Add a new user to the system</p>
		</div>
	</div>

	<UserForm onSubmit={handleSubmit} onCancel={handleCancel} availableRoles={data.roles} />
</div>

<!-- Success Dialog -->
<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="User Created Successfully!"
	description={`The user "${createdUserCode}" has been created successfully. What would you like to do next?`}
	buttons={[
		{ label: 'Create Another', action: 'primary', variant: 'default', icon: Plus },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>