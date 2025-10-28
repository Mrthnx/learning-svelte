<script lang="ts">
	import { authStore } from '$lib/store';
	import { menusStatic } from '$lib/shared/constants';
	import { DashboardCard } from '$lib/components/me';

	// Datos de ejemplo para las tarjetas
	const areas = menusStatic;
</script>

<!-- Sidebar Wrapper (Desktop + Mobile) -->
<!-- <SidebarWrapper /> -->

<!-- Contenido principal -->
<div class="p-4 transition-all duration-300 ease-in-out sm:p-6 md:p-8">
	<div class="mx-auto max-w-7xl">
		<!-- Encabezado -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-white">Dashboard</h1>
			<p class="text-gray-300">
				Bienvenido, {$authStore.user?.name || 'Usuario'}.
			</p>
		</div>

		<!-- Cuadrícula de Tarjetas -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each areas as area, i (i)}
				<DashboardCard title={area.title} description={area.description} />
			{/each}
		</div>
	</div>
</div>
