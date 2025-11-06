<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/store';
	import { onMount } from 'svelte';
	import { menusStatic } from '$lib/shared/constants';
	import { cn } from '$lib/utils';
	import { slide } from 'svelte/transition';

	interface Props {
		isMobileMenuOpen?: boolean;
		class?: string;
	}

	let { isMobileMenuOpen = $bindable(false), class: className }: Props = $props();

	const areas = menusStatic;

	let menus: any[] = [];
	onMount(() => {
		menus = $authStore.menu;
	});

	const searchSubMenus = async (title: string) => {
		const menu: any = menus.find((menu) => menu.label === title);
		authStore.saveSubMenus(menu?.menus ?? []);
		isMobileMenuOpen = false;

		const newTitle = title.replace(/\s/g, '-').toLowerCase();

		goto(`/${menu?.menus[0].uri ?? newTitle}`);
	};

	const closeMenu = () => {
		isMobileMenuOpen = false;
	};

	function logout() {
		authStore.logout();
		goto('/auth');
		isMobileMenuOpen = false;
	}
</script>

<div class={cn('md:hidden', className)}>
	{#if isMobileMenuOpen}
		<div
			transition:slide={{ duration: 300 }}
			class="mx-4 mt-2 mb-2 rounded-xl border bg-card text-card-foreground shadow-lg"
		>
			<div class="space-y-1 px-4 pt-4 pb-3">
				{#each areas as area, i (i)}
					<button
						onclick={() => searchSubMenus(area.title)}
						class="block w-full rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
						>{area.title}</button
					>
				{/each}
			</div>
			<div class="border-t pt-4 pb-3">
				<div class="flex items-center px-4">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
					>
						{($authStore.user?.name || 'U').charAt(0).toUpperCase()}
					</div>
					<div class="ml-3">
						<div class="text-base leading-none font-medium">
							{$authStore.user?.name || 'Usuario'}
						</div>
						<div class="mt-1 text-sm leading-none font-medium text-muted-foreground">
							{$authStore.user?.email}
						</div>
					</div>
				</div>
				<div class="mt-3 space-y-1 px-4">
					<a
						href="/profile"
						onclick={closeMenu}
						class="block rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
						>My Profile</a
					>
					<button
						onclick={logout}
						class="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive focus:outline-none"
						>Log out</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
