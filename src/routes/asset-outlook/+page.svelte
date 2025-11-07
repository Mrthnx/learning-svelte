<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search, Settings } from 'lucide-svelte';
	import { assetOutlookStore } from '$lib/store/asset-outlook.store';

	let searchTerm = '';
	let showColumnDropdown = false;

	// Control de visibilidad de columnas (excepto Asset, Type, Component)
	let columnVisibility: any = {
		vib: true, // Vibration
		trib: true, // Tribology
		mce: true, // Motor Current
		irrot: true, // IR Rotation
		irelec: true, // IR Electric
		irstruc: true, // IR Structural
		uerot: true, // UE Rotation
		ueelec: true, // UE Electric
		ueleak: true, // UE Leak
		bal: true, // Balance
		algn: true // Alignment
	};

	// Configuración de columnas para mostrar en checkboxes
	const columnConfig = [
		{ key: 'vib', label: 'Vib', tooltip: 'Vibration Analysis' },
		{ key: 'trib', label: 'Trib', tooltip: 'Tribology Analysis' },
		{ key: 'mce', label: 'MCE', tooltip: 'Motor Current Analysis' },
		{ key: 'irrot', label: 'IRr', tooltip: 'IR Rotational' },
		{ key: 'irelec', label: 'IRe', tooltip: 'IR Electrical' },
		{ key: 'irstruc', label: 'IRs', tooltip: 'IR Structural' },
		{ key: 'uerot', label: 'UEr', tooltip: 'UE Rotational' },
		{ key: 'ueelec', label: 'UEe', tooltip: 'UE Electrical' },
		{ key: 'ueleak', label: 'UEL', tooltip: 'UE Leak Detection' },
		{ key: 'bal', label: 'Bal', tooltip: 'Balance Analysis' },
		{ key: 'algn', label: 'Algn', tooltip: 'Alignment Analysis' }
	];

	// cargar datos al montar
	onMount(() => {
		assetOutlookStore.load();
	});

	// Filtrado local sobre los items cargados
	$: filteredAssets = ($assetOutlookStore.items || []).filter((asset) => {
		if (!searchTerm) return true;
		const q = searchTerm.toLowerCase();
		return (
			asset.code.toLowerCase().includes(q) ||
			asset.description.toLowerCase().includes(q) ||
			asset.components.some(
				(comp) => comp.code.toLowerCase().includes(q) || comp.description.toLowerCase().includes(q)
			)
		);
	});

	function formatDateStr(
		value?: string | null,
		hasSummary?: number | null,
		existSummary?: boolean
	) {
		if (!value) return '-';
		const d = new Date(value);
		const dateStr = isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
		// Agregar asterisco solo si tiene summary general Y summary específico para la tecnología
		return existSummary && hasSummary === 1 ? `${dateStr}*` : dateStr;
	}

	function getColorByAlarmCode(alarm: any) {
		const code = alarm?.color;
		if (!code) return 'text-muted-foreground';
		console.log(code);
		switch (String(code).toLowerCase()) {
			case 'green':
				return 'text-green-600 font-semibold';
			case 'yellow':
				return 'text-yellow-600 font-semibold';
			case 'red':
				return 'text-red-600 font-semibold';
			default:
				return 'text-muted-foreground';
		}
	}
</script>

<head>
	<title>Asset Outlook</title>
</head>

<div class="container mx-auto px-4 py-6">
	<div class="mb-6">
		<h1 class="mb-2 text-3xl font-bold text-foreground">Asset Outlook</h1>
		<p class="text-muted-foreground">Monitor assets and their components</p>
	</div>

	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Components Overview</Card.Title>
					<Card.Description>Details of each asset and its components</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<!-- Barra de búsqueda y controles -->
			<div class="mb-6 flex items-center justify-between gap-4">
				<div class="relative max-w-md flex-1">
					<Search
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
					/>
					<Input
						bind:value={searchTerm}
						placeholder="Search assets or components..."
						class="pl-9"
					/>
				</div>

				<!-- Dropdown compacto para visibilidad de columnas -->
				<div class="relative">
					<Button
						variant="outline"
						size="sm"
						class="flex items-center gap-2"
						onclick={() => (showColumnDropdown = !showColumnDropdown)}
					>
						<Settings class="h-4 w-4" />
						Columns
					</Button>

					{#if showColumnDropdown}
						<div
							class="absolute top-full right-0 z-50 mt-2 w-64 rounded-md border bg-popover p-3 shadow-lg"
						>
							<h3 class="mb-3 text-sm font-medium">Show/Hide Columns</h3>
							<div class="max-h-60 space-y-2 overflow-y-auto">
								{#each columnConfig as column}
									<label
										class="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-accent"
										title={column.tooltip}
									>
										<input
											type="checkbox"
											bind:checked={columnVisibility[column.key]}
											class="rounded"
										/>
										<span class="text-sm">{column.label}</span>
										<span class="ml-auto text-xs text-muted-foreground">{column.tooltip}</span>
									</label>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Tabla de componentes -->
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Asset</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head>Component</Table.Head>
							{#if columnVisibility.vib}
								<Table.Head class="cursor-pointer hover:text-foreground" title="Vibration Analysis"
									>Vib</Table.Head
								>
							{/if}
							{#if columnVisibility.trib}
								<Table.Head class="cursor-pointer hover:text-foreground" title="Tribology Analysis"
									>Trib</Table.Head
								>
							{/if}
							{#if columnVisibility.mce}
								<Table.Head
									class="cursor-pointer hover:text-foreground"
									title="Motor Current Analysis">MCE</Table.Head
								>
							{/if}
							{#if columnVisibility.irrot}
								<Table.Head class="cursor-pointer hover:text-foreground" title="IR Rotational"
									>IRr</Table.Head
								>
							{/if}
							{#if columnVisibility.irelec}
								<Table.Head class="cursor-pointer hover:text-foreground" title="IR Electrical"
									>IRe</Table.Head
								>
							{/if}
							{#if columnVisibility.irstruc}
								<Table.Head class="cursor-pointer hover:text-foreground" title="IR Structural"
									>IRs</Table.Head
								>
							{/if}
							{#if columnVisibility.uerot}
								<Table.Head class="cursor-pointer hover:text-foreground" title="UE Rotational"
									>UEr</Table.Head
								>
							{/if}
							{#if columnVisibility.ueelec}
								<Table.Head class="cursor-pointer hover:text-foreground" title="UE Electrical"
									>UEe</Table.Head
								>
							{/if}
							{#if columnVisibility.ueleak}
								<Table.Head class="cursor-pointer hover:text-foreground" title="UE Leak Detection"
									>UEL</Table.Head
								>
							{/if}
							{#if columnVisibility.bal}
								<Table.Head class="cursor-pointer hover:text-foreground" title="Balance Analysis"
									>Bal</Table.Head
								>
							{/if}
							{#if columnVisibility.algn}
								<Table.Head class="cursor-pointer hover:text-foreground" title="Alignment Analysis"
									>Algn</Table.Head
								>
							{/if}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if $assetOutlookStore.loading}
							<Table.Row>
								<Table.Cell colspan="100%" class="py-6 text-center text-muted-foreground">
									Loading...
								</Table.Cell>
							</Table.Row>
						{/if}
						{#if $assetOutlookStore.error}
							<Table.Row>
								<Table.Cell colspan="100%" class="py-6 text-center text-red-600">
									{$assetOutlookStore.error}
								</Table.Cell>
							</Table.Row>
						{/if}
						{#each filteredAssets as asset (asset.id)}
							{#each asset.components as component, i (component.id)}
								<Table.Row class="hover:bg-muted/50">
									{#if i === 0}
										<Table.Cell class="align-middle" rowspan={asset.components.length}>
											<div class="flex items-center gap-3">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-primary"
												>
													<span class="text-sm font-bold text-primary-foreground"
														>{asset.code.slice(0, 2)}</span
													>
												</div>
												<div>
													<div class="font-medium">{asset.code}</div>
													<div class="text-sm text-muted-foreground">{asset.description}</div>
												</div>
											</div>
										</Table.Cell>
									{/if}
									<Table.Cell class="">
										<Badge variant="outline" class="text-muted-foreground"
											>{component.componentType?.code}</Badge
										>
									</Table.Cell>
									<Table.Cell class="">
										<div class="flex items-center gap-2">
											<div>
												<div class="font-medium">{component.code}</div>
												<div class="text-sm text-muted-foreground">{component.description}</div>
											</div>
											{#if component.existSummary}
												<Badge variant="secondary" class="h-5 text-xs">S</Badge>
											{/if}
										</div>
									</Table.Cell>
									<!-- Vibration Analysis -->
									{#if columnVisibility.vib}
										<Table.Cell class="text-center {getColorByAlarmCode(component.vibalarm)}">
											{formatDateStr(component.vibdate, component.vib, component.existSummary)}
										</Table.Cell>
									{/if}
									<!-- Tribology Analysis -->
									{#if columnVisibility.trib}
										<Table.Cell class="text-center {getColorByAlarmCode(component.tribalarm)}">
											{formatDateStr(component.tribdate, component.trib, component.existSummary)}
										</Table.Cell>
									{/if}
									<!-- Motor Current Analysis -->
									{#if columnVisibility.mce}
										<Table.Cell class="text-center {getColorByAlarmCode(component.mcealarm)}">
											{formatDateStr(component.mcedate, component.mce, component.existSummary)}
										</Table.Cell>
									{/if}
									<!-- IR Rotational -->
									{#if columnVisibility.irrot}
										<Table.Cell class="text-center {getColorByAlarmCode(component.irrotalarm)}">
											{formatDateStr(component.irrotdate, component.irrot, component.existSummary)}
										</Table.Cell>
									{/if}
									<!-- IR Electrical -->
									{#if columnVisibility.irelec}
										<Table.Cell class="text-center {getColorByAlarmCode(component.irelecalarm)}">
											{formatDateStr(
												component.irelecdate,
												component.irelec,
												component.existSummary
											)}
										</Table.Cell>
									{/if}
									<!-- IR Structural -->
									{#if columnVisibility.irstruc}
										<Table.Cell class="text-center {getColorByAlarmCode(component.irstrucalarm)}">
											{formatDateStr(
												component.irstrucdate,
												component.irstruc,
												component.existSummary
											)}
										</Table.Cell>
									{/if}
									<!-- UE Rotational -->
									{#if columnVisibility.uerot}
										<Table.Cell class="text-center {getColorByAlarmCode(component.uerotalarm)}">
											{formatDateStr(component.uerotdate, component.uerot, component.existSummary)}
										</Table.Cell>
									{/if}
									<!-- UE Electrical -->
									{#if columnVisibility.ueelec}
										<Table.Cell class="text-center {getColorByAlarmCode(component.ueelecalarm)}">
											{formatDateStr(
												component.ueelecdate,
												component.ueelec,
												component.existSummary
											)}
										</Table.Cell>
									{/if}
									<!-- UE Leak Detection -->
									{#if columnVisibility.ueleak}
										<Table.Cell class="text-center {getColorByAlarmCode(component.ueleakalarm)}">
											{formatDateStr(
												component.ueleakdate,
												component.ueleak,
												component.existSummary
											)}
										</Table.Cell>
									{/if}
									<!-- Balance Analysis -->
									{#if columnVisibility.bal}
										<Table.Cell class="text-center {getColorByAlarmCode(component.balalarm)}">
											{formatDateStr(component.baldate, component.bal, component.existSummary)}
										</Table.Cell>
									{/if}
									<!-- Alignment Analysis -->
									{#if columnVisibility.algn}
										<Table.Cell class="text-center {getColorByAlarmCode(component.algnalarm)}">
											{formatDateStr(component.algndate, component.algn, component.existSummary)}
										</Table.Cell>
									{/if}
								</Table.Row>
							{/each}
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			{#if !$assetOutlookStore.loading && !$assetOutlookStore.error && filteredAssets.length === 0}
				<div class="py-12 text-center">
					<div class="mb-4 text-muted-foreground">No assets found</div>
					{#if searchTerm}
						<Button variant="outline" onclick={() => (searchTerm = '')}>Clear search</Button>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
