<script lang="ts">
	import { NavbarLinks, NavbarUserMenu, NavbarMobileMenu } from '$lib/components/me';

	let isMobileMenuOpen = false;
	let isUserMenuOpen = false;
</script>

<nav
	class="sticky top-0 z-30 w-full border-b border-white/20 bg-black/95 shadow-lg shadow-black/20 backdrop-blur-lg"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Left side: Logo -->
			<div class="flex items-center hover:text-primary">
				<svg
					class="text-login-accent h-8 w-auto"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 16a4 4 0 100-8 4 4 0 000 8z"
					/>
				</svg>
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
						{#if !isMobileMenuOpen}
							<svg
								class="block h-6 w-6 transition-transform duration-200"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						{:else}
							<svg
								class="block h-6 w-6 transition-transform duration-200"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						{/if}
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
