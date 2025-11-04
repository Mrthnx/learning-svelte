<script lang="ts">
	import { SidebarDesktop, SidebarMobile, FloatingAction } from '$lib/components/me';

	let isMobileDrawerOpen = $state(false);
</script>

<!-- Desktop Sidebar (existing) -->
<SidebarDesktop />

<!-- Mobile: FAB + Drawer -->
<FloatingAction bind:isdraweropen={isMobileDrawerOpen} />
<SidebarMobile bind:isOpen={isMobileDrawerOpen} />
