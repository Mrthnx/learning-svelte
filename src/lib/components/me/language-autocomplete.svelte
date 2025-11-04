<script lang="ts">
	import { LANG_VALUES } from '$lib/shared/constants';
	import { createEventDispatcher } from 'svelte';
	import { ChevronDown, X, Languages } from 'lucide-svelte';

	interface Props {
		value?: string | null;
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		class?: string;
	}

	let {
		value = $bindable(null),
		label = 'Language',
		placeholder = 'Select a language',
		disabled = false,
		required = false,
		error = '',
		class: className = ''
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		change: { key: string; value: string };
	}>();

	let isOpen = $state(false);
	let searchTerm = $state('');
	let filteredLanguages = $derived(
		LANG_VALUES.filter(
			(lang) =>
				lang.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
				lang.key.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	let selectedLanguage = $derived(LANG_VALUES.find((lang) => lang.key === value));

	function selectLanguage(language: (typeof LANG_VALUES)[0]) {
		value = language.key;
		isOpen = false;
		searchTerm = '';
		dispatch('change', { key: language.key, value: language.value });
	}

	function clear() {
		value = null;
		searchTerm = '';
		dispatch('change', { key: '', value: '' });
	}

	function toggleDropdown() {
		if (!disabled) {
			isOpen = !isOpen;
			searchTerm = '';
		}
	}
</script>

<div class="space-y-2 {className}">
	{#if label}
		<label class="text-sm font-medium">
			{label}
			{#if required}
				<span class="text-destructive">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		<button
			type="button"
			class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			class:border-destructive={error}
			{disabled}
			onclick={toggleDropdown}
		>
			{#if selectedLanguage}
				<span class="flex items-center gap-2">
					<Languages class="h-3.5 w-3.5 text-muted-foreground" />
					<span>{selectedLanguage.value}</span>
				</span>
			{:else}
				<span class="text-muted-foreground">{placeholder}</span>
			{/if}
			<div class="flex items-center gap-1">
				{#if selectedLanguage && !disabled}
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							clear();
						}}
						class="rounded-sm hover:bg-muted p-0.5"
					>
						<X class="h-3.5 w-3.5" />
					</button>
				{/if}
				<ChevronDown class="h-4 w-4 opacity-50" />
			</div>
		</button>

		{#if isOpen}
			<div
				class="absolute z-50 mt-1 max-h-[300px] w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
			>
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search languages..."
					class="mb-2 w-full rounded-sm border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
				/>

				{#if filteredLanguages.length === 0}
					<div class="py-6 text-center text-sm text-muted-foreground">No languages found.</div>
				{:else}
					{#each filteredLanguages as language (language.key)}
						<button
							type="button"
							class="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent"
							data-selected={value === language.key}
							onclick={() => selectLanguage(language)}
						>
							<Languages class="h-3.5 w-3.5 text-muted-foreground" />
							<span>{language.value}</span>
							<span class="ml-auto text-xs text-muted-foreground">({language.key})</span>
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-40"
		onclick={() => (isOpen = false)}
		tabindex="-1"
	></button>
{/if}
