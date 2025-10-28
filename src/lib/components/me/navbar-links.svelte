<script lang="ts">
	import { menusStatic } from '$lib/shared/constants';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/store';
	import { goto } from '$app/navigation';

	const areas = menusStatic;

	let menus: any[] = [];
	onMount(() => {
		menus = $authStore.menu;
	});

	const searchSubMenus = async (title: string) => {
		const menu: any = menus.find((menu) => menu.label === title);
		authStore.saveSubMenus(menu?.menus ?? []);

		const newTitle = title.replace(/\s/g, '-').toLowerCase();

		goto(`/${menu?.menus[0].uri ?? newTitle}`);
	};
</script>

<div class="hidden md:flex md:justify-center">
	<div class="ml-10 flex items-baseline space-x-4">
		{#each areas as area, i (i)}
			<button
				type="button"
				on:click={() => searchSubMenus(area.title)}
				class="rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-white/10 hover:bg-primary hover:text-secondary"
				>{area.title}</button
			>
		{/each}
	</div>
</div>
