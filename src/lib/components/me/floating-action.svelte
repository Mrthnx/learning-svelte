<script lang="ts">
	import { authStore } from '$lib/store';
	import { processLabelToIcon } from '$lib/shared';
	import { cn } from '$lib/utils';
	import { slide } from 'svelte/transition';

	interface Props {
		isOpen?: boolean;
		class?: string;
	}

	let { isOpen = $bindable(false), class: className }: Props = $props();

	const selectedSubmenus = $derived($authStore?.submenus || []);

	function closeDrawer() {
		isOpen = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeDrawer();
		}
	}

	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeDrawer();
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		transition:slide
		class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
		onclick={handleBackdropClick}
		onkeydown={handleBackdropKeydown}
		role="button"
		tabindex="0"
		aria-label="Cerrar menú lateral"
	></div>

	<!-- Drawer -->
	<div
		transition:slide={{ axis: 'x' }}
		class={cn('fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] md:hidden', className)}
	>
		<div class="flex h-full flex-col border-l bg-card text-card-foreground shadow-lg">
			<!-- Header -->
			<div class="flex flex-shrink-0 items-center justify-between border-b p-4">
				<div class="flex items-center space-x-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						<svg
							class="h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-lg font-semibold">Menu</h2>
						<p class="text-sm text-muted-foreground">Navegación</p>
					</div>
				</div>
				<button
					onclick={closeDrawer}
					class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
					aria-label="Cerrar menú"
				>
					<svg
						class="h-6 w-6"
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
				</button>
			</div>

			<!-- Navigation Content -->
			<div class="min-h-0 flex-1 overflow-y-auto">
				<div class="p-4">
					{#if selectedSubmenus && selectedSubmenus.length > 0}
						<div class="space-y-2">
							<h3
								class="sticky top-0 z-10 -mx-4 mb-3 bg-card/90 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase backdrop-blur-sm"
							>
								Secciones
							</h3>
							<div class="space-y-2 pb-4">
								{#each selectedSubmenus as submenu, i (i)}
									<a
										href={'/' + submenu.uri}
										onclick={closeDrawer}
										class="group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
									>
										<div
											class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary transition-colors group-hover:bg-primary/30"
										>
											<span class="text-xs">
												<div
													class="icon-mask icon-{processLabelToIcon(
														submenu.icon,
														submenu.label
													)}"
												></div>
											</span>
										</div>

										<div class="ml-3 min-w-0 flex-1">
											<span class="block truncate font-medium">{submenu.label}</span>
										</div>

										<svg
											class="h-5 w-5 flex-shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</a>
								{/each}
							</div>
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-12 text-center">
							<div
								class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
							>
								<svg
									class="h-8 w-8 text-muted-foreground"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
									/>
								</svg>
							</div>
							<h3 class="mb-2 text-lg font-medium">Sin elementos</h3>
							<p class="text-sm text-muted-foreground">
								No hay menús disponibles en esta sección.
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div class="flex-shrink-0 border-t p-4">
				<div class="flex items-center space-x-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						<svg
							class="h-4 w-4"
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
					</div>
					<div class="text-xs text-muted-foreground">
						<span class="block font-medium">PDM Director</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
