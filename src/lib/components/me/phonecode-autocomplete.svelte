<script lang="ts">
	import { COUNTRY_VALUES } from '$lib/shared/constants';
	import { createEventDispatcher } from 'svelte';
	import { ChevronDown, X, Phone } from 'lucide-svelte';

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
		label = '',
		placeholder = 'Select phone code',
		disabled = false,
		required = false,
		error = '',
		class: className = ''
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		change: { phoneCode: string; country: string };
	}>();

	// Filter countries that have phone codes
	const countriesWithPhoneCode = COUNTRY_VALUES.filter((c) => c.phoneCode);

	let isOpen = $state(false);
	let searchTerm = $state('');
	let filteredCountries = $derived(
		countriesWithPhoneCode.filter(
			(country) =>
				country.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
				country.phoneCode.includes(searchTerm)
		)
	);

	// Remove '+' and '-' from phoneCode for storage
	let selectedCountry = $derived(
		countriesWithPhoneCode.find((c) => c.phoneCode.replace(/[+-]/g, '') === value)
	);

	function selectCountry(country: (typeof COUNTRY_VALUES)[0]) {
		// Store phone code without '+' or '-'
		value = country.phoneCode.replace(/[+-]/g, '');
		isOpen = false;
		searchTerm = '';
		dispatch('change', { phoneCode: value, country: country.value });
	}

	function clear() {
		value = null;
		searchTerm = '';
		dispatch('change', { phoneCode: '', country: '' });
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
			class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			class:border-destructive={error}
			{disabled}
			onclick={toggleDropdown}
		>
			{#if selectedCountry}
				<span class="flex items-center gap-2">
					<Phone class="h-3.5 w-3.5 text-muted-foreground" />
					<span class="font-medium">{selectedCountry.phoneCode}</span>
				</span>
			{:else}
				<span class="text-muted-foreground">{placeholder}</span>
			{/if}
			<div class="flex items-center gap-1">
				{#if selectedCountry && !disabled}
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							clear();
						}}
						class="rounded-sm p-0.5 hover:bg-muted"
					>
						<X class="h-3.5 w-3.5" />
					</button>
				{/if}
				<ChevronDown class="h-4 w-4 opacity-50" />
			</div>
		</button>

		{#if isOpen}
			<div
				class="absolute z-50 mt-1 max-h-[300px] w-max min-w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
			>
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search by code or country..."
					class="mb-2 w-full rounded-sm border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
				/>

				{#if filteredCountries.length === 0}
					<div class="py-6 text-center text-sm text-muted-foreground">No phone codes found.</div>
				{:else}
					{#each filteredCountries as country (country.key)}
						<button
							type="button"
							class="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent"
							data-selected={value === country.phoneCode.replace(/[+-]/g, '')}
							onclick={() => selectCountry(country)}
						>
							<Phone class="h-3.5 w-3.5 text-muted-foreground" />
							<span class="font-medium">{country.phoneCode}</span>
							<span class="text-muted-foreground">- {country.value}</span>
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
	<button type="button" class="fixed inset-0 z-40" onclick={() => (isOpen = false)} tabindex="-1"
	></button>
{/if}
