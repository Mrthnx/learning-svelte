<script lang="ts">
	import { authStore } from '$lib/store';
	import { processLabelToIcon } from '$lib/shared';
	import { cn } from '$lib/utils';
	import Logo from './logo.svelte';
	import { Shield } from 'lucide-svelte';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let isExpanded = $state(false);

	const selectedSubmenus = $derived($authStore?.submenus || []);
</script>

{#if selectedSubmenus && selectedSubmenus.length > 0}
	<div
		class={cn(
			'fixed top-16 bottom-0 left-0 z-20 hidden flex-col border-r bg-card shadow-sm transition-all duration-300 ease-in-out md:flex',
			isExpanded ? 'w-72' : 'w-20',
			className
		)}
	>
		<!-- Navigation Menu -->
		<div class="flex-1 overflow-y-auto py-4">
			<nav class="space-y-2 px-2">
				{#each selectedSubmenus as submenu, i (i)}
					<a
						href={'/' + submenu.uri}
						class="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
						title={submenu.label}
					>
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors group-hover:bg-primary group-hover:text-secondary/80"
						>
							<span class="text-xs">
								<div class="icon-mask icon-{processLabelToIcon(submenu.icon, submenu.label)}"></div>
							</span>
						</div>

						{#if isExpanded}
							<span class="ml-3 truncate font-medium transition-opacity duration-200"
								>{submenu.label}</span
							>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="ml-auto h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
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
						{/if}
					</a>
				{/each}

				<!-- Superadmin Only: Role Permissions -->
				{#if authStore.isSuperAdmin()}
					<div class="mt-2 border-t pt-2">
						<a
							href="/database-setup/role-permissions"
							class="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
							title="Role Permissions"
						>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors group-hover:bg-primary group-hover:text-secondary/80"
							>
								<Shield class="h-5 w-5" />
							</div>

							{#if isExpanded}
								<span class="ml-3 truncate font-medium transition-opacity duration-200"
									>Role Permissions</span
								>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="ml-auto h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
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
							{/if}
						</a>
					</div>
				{/if}
			</nav>
		</div>

		<!-- Footer -->
		<div class="border-t p-3">
			<!-- Expand/Collapse Button -->
			<button
				onclick={() => (isExpanded = !isExpanded)}
				class="mb-3 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
				title={isExpanded ? 'Contraer sidebar' : 'Expandir sidebar'}
			>
				<div class="flex h-6 w-6 items-center justify-center rounded bg-muted">
					<svg
						class="h-4 w-4 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}"
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
				</div>
				{#if isExpanded}
					<span class="ml-3">Contraer</span>
				{/if}
			</button>

			<!-- App Info -->
			<div class="flex items-center {isExpanded ? 'justify-start' : 'justify-center'}">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-secondary"
				>
					<Logo size="sm" />
				</div>
				{#if isExpanded}
					<div class="ml-3 text-xs text-muted-foreground">
						<span class="block font-medium text-foreground">PDM Director</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
