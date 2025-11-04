<script lang="ts">
	import { NavbarLinks, NavbarUserMenu, NavbarMobileMenu, Icon } from '$lib/components/me';

	let isMobileMenuOpen = $state(false);
	let isUserMenuOpen = $state(false);
</script>

<nav
	class="sticky top-0 z-30 w-full border-b border-white/20 bg-black/95 shadow-lg shadow-black/20 backdrop-blur-lg"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Left side: Logo -->
			<div class="flex items-center hover:text-primary">
				<Icon name="logo" class="text-login-accent h-8 w-auto" />
				<a href="/dashboard" class="ml-2 text-xl font-bold text-white hover:text-primary"
					>PDM Director</a
				>
			</div>

			<!-- Center: Menu Links (Desktop) -->
			<NavbarLinks />

			<!-- Right side: User Menu (Desktop) / Hamburger (Mobile) -->
			<div class="flex items-center">
				<!-- Hamburger Menu -->
				<div class="-mr-2 flex md:hidden">
					<button
						on:click={() => (isMobileMenuOpen = !isMobileMenuOpen)}
						class="inline-flex items-center justify-center rounded-lg border border-white/10 p-3 text-gray-300 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-primary focus:outline-none"
					>
						<span class="sr-only">Abrir menú principal</span>
						<Icon
							name={isMobileMenuOpen ? 'close' : 'menu'}
							class="block h-6 w-6 transition-transform duration-200"
						/>
					</button>
				</div>

				<!-- User Menu (Desktop) -->
				<div class="relative hidden md:block">
					<NavbarUserMenu bind:isUserMenuOpen />
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if isMobileMenuOpen}
		<NavbarMobileMenu bind:isMobileMenuOpen />
	{/if}
</nav>
