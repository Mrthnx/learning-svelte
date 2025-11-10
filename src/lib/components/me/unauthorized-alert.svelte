<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, unauthorizedAlert } from '$lib/store';

	let message: string;
	let show: boolean;
	let delayedShow = false;
	let delayTimeout: ReturnType<typeof setTimeout> | null = null;

	unauthorizedAlert.subscribe((state) => {
		show = state.show;
		message = state.message;

		if (delayTimeout) {
			clearTimeout(delayTimeout);
			delayTimeout = null;
		}

		if (show) {
			delayTimeout = setTimeout(() => {
				delayedShow = true;
			}, 300);
		} else {
			delayedShow = false;
		}
	});

	function handleAccept() {
		authStore.logout();
		unauthorizedAlert.hide();
		goto('/auth');
	}
</script>

{#if delayedShow}
	<!-- Overlay with enhanced backdrop blur -->
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300"
	>
		<!-- Modal Card with glassmorphism effect -->
		<div
			class="relative w-full max-w-md animate-in duration-300 fade-in zoom-in"
			style="animation-delay: 50ms;"
		>
			<div
				class="relative overflow-hidden rounded-2xl border border-destructive/20 bg-card/95 p-8 text-center shadow-2xl backdrop-blur-xl"
			>
				<!-- Gradient Background Effect -->
				<div
					class="pointer-events-none absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5"
				></div>

				<!-- Content -->
				<div class="relative z-10">
					<!-- Icon with animation -->
					<div class="mb-6 flex justify-center">
						<div
							class="animate-pulse rounded-full bg-destructive/10 p-4 ring-4 ring-destructive/20"
						>
							<svg
								class="h-16 w-16 text-destructive"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 9v3.75m-9.303 3.376c-.866 1.5.174 3.35 1.9 3.35h13.713c1.726 0 2.766-1.85 1.9-3.35L13.713 2.2c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
								/>
							</svg>
						</div>
					</div>

					<!-- Title -->
					<h2
						class="mb-3 animate-in text-2xl font-bold text-foreground duration-500 fade-in slide-in-from-top-2"
						style="animation-delay: 100ms;"
					>
						Sesión Expirada
					</h2>

					<!-- Message -->
					<p
						class="mb-8 animate-in text-muted-foreground duration-500 fade-in slide-in-from-bottom-2"
						style="animation-delay: 150ms;"
					>
						{message}
					</p>

					<!-- Action Button -->
					<button
						class="group text-destructive-foreground relative w-full animate-in overflow-hidden rounded-lg bg-destructive px-6 py-3 text-base font-semibold shadow-lg transition-all duration-300 duration-500 fade-in zoom-in hover:scale-[1.02] hover:shadow-xl focus:ring-4 focus:ring-destructive/50 focus:outline-none active:scale-[0.98]"
						style="animation-delay: 200ms;"
						on:click={handleAccept}
					>
						<!-- Button shine effect on hover -->
						<div
							class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
						></div>
						<span class="relative flex items-center justify-center gap-2">
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
								/>
							</svg>
							Volver a Iniciar Sesión
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
