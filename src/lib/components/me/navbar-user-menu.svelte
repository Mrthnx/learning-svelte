<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/store';
	import { fly } from 'svelte/transition';
	import { cn } from '$lib/utils';

	interface Props {
		isUserMenuOpen?: boolean;
		class?: string;
	}

	let { isUserMenuOpen = $bindable(false), class: className }: Props = $props();

	let menuRef: HTMLDivElement;
	let buttonRef: HTMLButtonElement;

	function toggleMenu() {
		isUserMenuOpen = !isUserMenuOpen;
	}

	function closeMenu() {
		isUserMenuOpen = false;
	}

	function logout() {
		authStore.logout();
		closeMenu();
		goto('/auth');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isUserMenuOpen) {
			closeMenu();
			buttonRef?.focus();
		}
	}

	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!node.contains(target) && !buttonRef?.contains(target)) {
				closeMenu();
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class={cn('relative', className)}>
	<button
		bind:this={buttonRef}
		onclick={toggleMenu}
		aria-label="Menú de usuario"
		aria-expanded={isUserMenuOpen}
		aria-haspopup="true"
		class="flex items-center gap-2 rounded-full bg-muted p-2 pr-3 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
	>
		<svg
			class="h-8 w-8"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
			/>
		</svg>
		<span class="hidden text-sm font-medium text-white sm:block">
			{$authStore.user?.name || 'User'}
		</span>
	</button>

	{#if isUserMenuOpen}
		<div
			bind:this={menuRef}
			use:clickOutside
			role="menu"
			aria-orientation="vertical"
			transition:fly={{ y: -10, duration: 200 }}
			class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg border bg-popover text-popover-foreground shadow-lg focus:outline-none"
		>
			<div class="py-1">
				<a
					href="/profile"
					role="menuitem"
					onclick={closeMenu}
					class="block px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
				>
					My Profile
				</a>
				<button
					role="menuitem"
					onclick={logout}
					class="block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
				>
					Log out
				</button>
			</div>
		</div>
	{/if}
</div>
