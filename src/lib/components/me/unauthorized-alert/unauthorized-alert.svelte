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
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent backdrop-blur-sm"
	>
		<div
			class="glass-container relative w-full max-w-sm rounded-2xl border border-red-500/30 p-8 text-center shadow-xl"
		>
			<div class="mb-6 flex justify-center">
				<svg
					class="h-20 w-20 text-red-500"
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
			<h2 class="mb-3 text-2xl font-bold text-red-400">Sesión Expirada</h2>
			<p class="mb-8 text-gray-200">{message}</p>
			<button
				class="focus:ring-opacity-50 w-full rounded-full bg-gradient-to-r from-red-600 to-red-800 px-6 py-3 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:from-red-700 hover:to-red-900 focus:ring-4 focus:ring-red-500 focus:outline-none"
				on:click={handleAccept}
			>
				Volver a Iniciar Sesión
			</button>
		</div>
	</div>
{/if}
