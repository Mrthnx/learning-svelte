<script lang="ts">
	import { SidebarDesktop, SidebarMobile, FloatingAction } from '$lib/components/me';

	let isMobileDrawerOpen = false;

	// Sincronizar el estado del drawer con el FAB
	$: if (isMobileDrawerOpen !== undefined) {
		// El estado se maneja desde FloatingActionButton
	}
</script>

<!-- Desktop Sidebar (existing) -->
<SidebarDesktop />

<!-- Mobile: FAB + Drawer -->
<FloatingAction bind:isdraweropen={isMobileDrawerOpen} />
<SidebarMobile bind:isOpen={isMobileDrawerOpen} />
