<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/store';
	import { cn } from '$lib/utils';

	interface Props {
		title?: string;
		description?: string;
		submenus?: { logo: string; label: string; path: string }[];
		class?: string;
	}

	let {
		title = 'Título de la Tarjeta',
		description = 'Descripción de la tarjeta...',
		submenus = [],
		class: className
	}: Props = $props();

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

<div
	class={cn(
		'group flex transform-gpu cursor-pointer flex-col rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
		className
	)}
>
	<div class="mb-4">
		<svg
			class="h-10 w-10 text-primary transition-colors group-hover:text-primary/80"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
			/>
		</svg>
	</div>
	<h3 class="mb-2 text-xl font-bold">{title}</h3>
	<p class="text-muted-foreground">{description}</p>

	{#if submenus.length > 0}
		<div class="mt-4 border-t pt-4">
			<h4 class="mb-2 text-lg font-semibold">Submenús:</h4>
			<ul class="space-y-2">
				{#each submenus as submenu, i (i)}
					<li>
						<a
							href={submenu.path}
							class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
						>
							{#if submenu.logo}
								<img src={submenu.logo} alt={submenu.label} class="mr-2 h-5 w-5" />
							{/if}
							{submenu.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="mt-auto pt-4">
		<button
			onclick={() => searchSubMenus(title)}
			class="text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
			>Ver más →</button
		>
	</div>
</div>
