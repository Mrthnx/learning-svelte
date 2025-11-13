<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search, Settings, Filter, ChevronUp, ChevronDown } from 'lucide-svelte';
	import { assetOutlookStore } from '$lib/store/asset-outlook.store';
	import type { AssetFilter } from '$lib/services/get-assets';
	import SearchInput from '$lib/components/ui/search-input.svelte';
	import { AccountModalTable } from '$lib/components/modules/accounts';

	import { PlantModalTable } from '$lib/components/modules/plants';
	import { AreaModalTable } from '$lib/components/modules/areas';
	import { SystemModalTable } from '$lib/components/modules/systems';
	import {
		saveUserTechnologyPreferences,
		getUserTechnologyPreferences
	} from '$lib/services/user-technology';
	import { authStore, hierarchyStore } from '$lib/store';

	let searchTerm = $state('');
	let showColumnDropdown = $state(false);
	let showFiltersPanel = $state(true);
	let columnDropdownRef: HTMLDivElement;

	// Sorting state
	type SortField = 'asset' | 'type' | 'component' | 'vib' | 'trib' | 'mce' | 'irrot' | 'irelec' | 'irstruc' | 'uerot' | 'ueelec' | 'ueleak' | 'bal' | 'algn';
	type SortOrder = 'asc' | 'desc' | 'none';
	let sortField = $state<SortField | null>(null);
	let sortOrder = $state<SortOrder>('none');

	// Filtros del sistema
	let filters: AssetFilter = $state({
		code: '',
		description: '',
		componentCode: '',
		componentDescription: '',
		account: { id: undefined },
		plant: { id: undefined },
		area: { id: undefined },
		system: { id: undefined }
	});

	// Variables para SearchInput - inicializadas con valores del hierarchy store
	let accountSearch = $state({ id: null, description: '', readonly: false });
	let plantSearch = $state({ id: null, description: '', readonly: false });
	let areaSearch = $state({ id: null, description: '', readonly: false });
	let systemSearch = $state({ id: null, description: '', readonly: false });

	// Control de visibilidad de columnas (excepto Asset, Type, Component)
	let columnVisibility = $state({
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
	});

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

	// Función para cargar preferencias de columnas
	async function loadColumnPreferences() {
		try {
			const userId = $authStore.user?.id;
			if (!userId) {
				console.warn('No user ID found, using default column preferences');
				return;
			}

			const preferences = await getUserTechnologyPreferences(userId);
			// Actualizar columnVisibility con las preferencias del usuario
			columnVisibility.vib = preferences.vib;
			columnVisibility.trib = preferences.trib;
			columnVisibility.mce = preferences.mce;
			columnVisibility.irrot = preferences.irrot;
			columnVisibility.irelec = preferences.irelec;
			columnVisibility.irstruc = preferences.irstruc;
			columnVisibility.uerot = preferences.uerot;
			columnVisibility.ueelec = preferences.ueelec;
			columnVisibility.ueleak = preferences.ueleak;
			columnVisibility.bal = preferences.bal;
			columnVisibility.algn = preferences.algn;
			console.log('Column preferences loaded successfully');
		} catch (error) {
			console.error('Error loading column preferences:', error);
		}
	}

	// Función para cerrar dropdown cuando se hace click fuera
	function handleClickOutside(event: MouseEvent) {
		if (columnDropdownRef && !columnDropdownRef.contains(event.target as Node)) {
			showColumnDropdown = false;
		}
	}

	// cargar datos al montar
	onMount(async () => {
		// Sincronizar SearchInputs con hierarchy store
		const hierarchy = $hierarchyStore;
		accountSearch = { ...hierarchy.account };
		plantSearch = { ...hierarchy.plant };
		areaSearch = { ...hierarchy.area };
		systemSearch = { ...hierarchy.system };

		// Cargar assets con valores del hierarchy store automáticamente aplicados
		assetOutlookStore.loadWithHierarchy();
		await loadColumnPreferences();

		// Agregar event listener para cerrar dropdown al hacer click fuera
		document.addEventListener('click', handleClickOutside);

		// Cleanup function
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Filtrado y ordenamiento local sobre los items cargados
	const filteredAssets = $derived(() => {
		// Primero filtrar
		let filtered = ($assetOutlookStore.items || []).filter((asset) => {
			if (!searchTerm) return true;
			const q = searchTerm.toLowerCase();
			return (
				asset.code.toLowerCase().includes(q) ||
				asset.description.toLowerCase().includes(q) ||
				asset.components.some(
					(comp) =>
						comp.code.toLowerCase().includes(q) || comp.description.toLowerCase().includes(q)
				)
			);
		});

		// Luego ordenar si hay un campo de ordenamiento activo
		if (sortField && sortOrder !== 'none') {
			filtered = filtered.map(asset => ({
				...asset,
				components: [...asset.components].sort((a, b) => {
					let aValue: any;
					let bValue: any;
					let aAlarmPriority = 0;
					let bAlarmPriority = 0;

					switch (sortField) {
						case 'asset':
							aValue = asset.code;
							bValue = asset.code;
							break;
						case 'type':
							aValue = a.componentType?.code || '';
							bValue = b.componentType?.code || '';
							break;
						case 'component':
							aValue = a.code;
							bValue = b.code;
							break;
						case 'vib':
							aValue = new Date(a.vibdate || 0);
							bValue = new Date(b.vibdate || 0);
							aAlarmPriority = getAlarmPriority(a.vibalarm);
							bAlarmPriority = getAlarmPriority(b.vibalarm);
							break;
						case 'trib':
							aValue = new Date(a.tribdate || 0);
							bValue = new Date(b.tribdate || 0);
							aAlarmPriority = getAlarmPriority(a.tribalarm);
							bAlarmPriority = getAlarmPriority(b.tribalarm);
							break;
						case 'mce':
							aValue = new Date(a.mcedate || 0);
							bValue = new Date(b.mcedate || 0);
							aAlarmPriority = getAlarmPriority(a.mcealarm);
							bAlarmPriority = getAlarmPriority(b.mcealarm);
							break;
						case 'irrot':
							aValue = new Date(a.irrotdate || 0);
							bValue = new Date(b.irrotdate || 0);
							aAlarmPriority = getAlarmPriority(a.irrotalarm);
							bAlarmPriority = getAlarmPriority(b.irrotalarm);
							break;
						case 'irelec':
							aValue = new Date(a.irelecdate || 0);
							bValue = new Date(b.irelecdate || 0);
							aAlarmPriority = getAlarmPriority(a.irelecalarm);
							bAlarmPriority = getAlarmPriority(b.irelecalarm);
							break;
						case 'irstruc':
							aValue = new Date(a.irstrucdate || 0);
							bValue = new Date(b.irstrucdate || 0);
							aAlarmPriority = getAlarmPriority(a.irstrucalarm);
							bAlarmPriority = getAlarmPriority(b.irstrucalarm);
							break;
						case 'uerot':
							aValue = new Date(a.uerotdate || 0);
							bValue = new Date(b.uerotdate || 0);
							aAlarmPriority = getAlarmPriority(a.uerotalarm);
							bAlarmPriority = getAlarmPriority(b.uerotalarm);
							break;
						case 'ueelec':
							aValue = new Date(a.ueelecdate || 0);
							bValue = new Date(b.ueelecdate || 0);
							aAlarmPriority = getAlarmPriority(a.ueelecalarm);
							bAlarmPriority = getAlarmPriority(b.ueelecalarm);
							break;
						case 'ueleak':
							aValue = new Date(a.ueleakdate || 0);
							bValue = new Date(b.ueleakdate || 0);
							aAlarmPriority = getAlarmPriority(a.ueleakalarm);
							bAlarmPriority = getAlarmPriority(b.ueleakalarm);
							break;
						case 'bal':
							aValue = new Date(a.baldate || 0);
							bValue = new Date(b.baldate || 0);
							aAlarmPriority = getAlarmPriority(a.balalarm);
							bAlarmPriority = getAlarmPriority(b.balalarm);
							break;
						case 'algn':
							aValue = new Date(a.algndate || 0);
							bValue = new Date(b.algndate || 0);
							aAlarmPriority = getAlarmPriority(a.algnalarm);
							bAlarmPriority = getAlarmPriority(b.algnalarm);
							break;
						default:
							return 0;
					}

					// Para columnas de tecnología, ordenar por: 1) fecha, 2) prioridad de alarma
					if (['vib', 'trib', 'mce', 'irrot', 'irelec', 'irstruc', 'uerot', 'ueelec', 'ueleak', 'bal', 'algn'].includes(sortField)) {
						// Primero por fecha
						const dateComparison = sortOrder === 'desc' ? 
							bValue.getTime() - aValue.getTime() : 
							aValue.getTime() - bValue.getTime();
						
						// Si las fechas son iguales, ordenar por prioridad de alarma
						if (dateComparison === 0) {
							return sortOrder === 'desc' ? 
								bAlarmPriority - aAlarmPriority : 
								aAlarmPriority - bAlarmPriority;
						}
						return dateComparison;
					} else {
						// Para columnas de texto, ordenamiento alfabético
						const comparison = String(aValue).localeCompare(String(bValue));
						return sortOrder === 'desc' ? -comparison : comparison;
					}
				})
			}));
		}

		return filtered;
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

	// Get alarm priority for sorting (red=3, yellow=2, green=1, none=0)
	function getAlarmPriority(alarm: any): number {
		const code = alarm?.color;
		if (!code) return 0;
		switch (String(code).toLowerCase()) {
			case 'red': return 3;
			case 'yellow': return 2;
			case 'green': return 1;
			default: return 0;
		}
	}

	// Handle column header click for sorting
	function handleSort(field: SortField) {
		if (sortField === field) {
			// Cycle through: none -> desc -> asc -> none
			if (sortOrder === 'none') {
				sortOrder = 'desc';
			} else if (sortOrder === 'desc') {
				sortOrder = 'asc';
			} else {
				sortOrder = 'none';
				sortField = null;
			}
		} else {
			sortField = field;
			sortOrder = 'desc'; // Start with desc for dates (most recent first)
		}
	}

	// Get sort icon component for header
	function getSortIcon(field: SortField) {
		if (sortField !== field || sortOrder === 'none') {
			return null;
		}
		return sortOrder === 'desc' ? ChevronDown : ChevronUp;
	}

	// Función para guardar preferencias de columnas
	async function saveColumnPreferences() {
		try {
			const userId = $authStore.user?.id;
			if (!userId) {
				console.warn('No user ID found, cannot save column preferences');
				return;
			}

			const preferences = {
				component: true, // Siempre visible
				type: true, // Siempre visible
				vib: columnVisibility.vib,
				trib: columnVisibility.trib,
				mce: columnVisibility.mce,
				irrot: columnVisibility.irrot,
				irelec: columnVisibility.irelec,
				irstruc: columnVisibility.irstruc,
				uerot: columnVisibility.uerot,
				ueelec: columnVisibility.ueelec,
				ueleak: columnVisibility.ueleak,
				bal: columnVisibility.bal,
				algn: columnVisibility.algn
			};

			await saveUserTechnologyPreferences(userId, preferences);
			console.log('Column preferences saved successfully');
		} catch (error) {
			console.error('Error saving column preferences:', error);
		}
	}

	function handleApplyFilters() {
		// Sincronizar SearchInputs con filters usando variables de estado
		filters.account.id = accountSearch.id;
		filters.plant.id = plantSearch.id;
		filters.area.id = areaSearch.id;
		filters.system.id = systemSearch.id;
		// Aplicar filtros
		assetOutlookStore.setFilters(filters);
		assetOutlookStore.load();
	}
</script>

<svelte:head>
	<title>Asset Outlook</title>
</svelte:head>

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
				<div class="flex items-center gap-2">
					<!-- Botón de filtros -->
					<Button
						variant="outline"
						size="sm"
						class="flex items-center gap-2"
						onclick={() => (showFiltersPanel = !showFiltersPanel)}
					>
						<Filter class="h-4 w-4" />
						Filters
					</Button>

					<!-- Dropdown compacto para visibilidad de columnas -->
					<div class="relative" bind:this={columnDropdownRef}>
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
								class="absolute top-full right-0 z-50 mt-2 w-80 rounded-md border bg-popover p-4 shadow-lg"
							>
								<h3 class="mb-4 text-sm font-medium text-foreground">Show/Hide Columns</h3>
								<div class="max-h-72 space-y-3 overflow-y-auto pr-2">
									{#each columnConfig as column (column.key)}
										<label
											class="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-accent"
											title={column.tooltip}
										>
											<input
												type="checkbox"
												bind:checked={columnVisibility[column.key]}
												class="rounded"
												onchange={saveColumnPreferences}
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
			</div>

			<!-- Panel de filtros -->
			{#if showFiltersPanel}
				<div class="mb-6 rounded-lg border bg-muted/30 p-4">
					<h3 class="mb-4 text-sm font-medium text-foreground">Advanced Filters</h3>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<!-- Asset Code -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">Asset Code</label>
							<Input bind:value={filters.code} placeholder="e.g. PUMP-001" class="mt-1" />
						</div>

						<!-- Asset Description -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">Asset Description</label>
							<Input bind:value={filters.description} placeholder="e.g. Main Pump" class="mt-1" />
						</div>

						<!-- Component Code -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">Component Code</label>
							<Input bind:value={filters.componentCode} placeholder="e.g. MOTOR-001" class="mt-1" />
						</div>

						<!-- Component Description -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">Component Description</label>
							<Input
								bind:value={filters.componentDescription}
								placeholder="e.g. Electric Motor"
								class="mt-1"
							/>
						</div>

						<!-- Account -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">Account</label>
							<div class="mt-1">
								<SearchInput
									bind:value={accountSearch}
									placeholder="Select account..."
									width="w-full"
									modalTitle="Select Account"
									modalDescription="Choose an account from the list"
									modalContent={AccountModalTable}
									hierarchyLevel="account"
									onclear={() => {
										hierarchyStore.clearAccount();
										// Limpiar todos los hijos en cascada
										hierarchyStore.clearPlant();
										hierarchyStore.clearArea();
										hierarchyStore.clearSystem();
										accountSearch = { id: null, description: '', readonly: false };
										plantSearch = { id: null, description: '', readonly: false };
										areaSearch = { id: null, description: '', readonly: false };
										systemSearch = { id: null, description: '', readonly: false };
										handleApplyFilters();
									}}
									modalContentProps={{
										onselect: (account: any) => {
											hierarchyStore.updateAccount({
												id: account.id,
												description: account.description || account.name || `Account ${account.id}`
											});
											// Limpiar todos los hijos cuando se selecciona un account diferente
											hierarchyStore.clearPlant();
											hierarchyStore.clearArea();
											hierarchyStore.clearSystem();
											accountSearch = {
												id: account.id,
												description: account.description || account.name || `Account ${account.id}`,
												readonly: false
											};
											plantSearch = { id: null, description: '', readonly: false };
											areaSearch = { id: null, description: '', readonly: false };
											systemSearch = { id: null, description: '', readonly: false };
											handleApplyFilters();
										}
									}}
								/>
							</div>
						</div>

						<!-- Plant -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">Plant</label>
							<div class="mt-1">
								<SearchInput
									bind:value={plantSearch}
									placeholder="Select plant..."
									width="w-full"
									modalTitle="Select Plant"
									modalDescription="Choose a plant from the list"
									modalContent={PlantModalTable}
									hierarchyLevel="plant"
									onclear={() => {
										hierarchyStore.clearPlant();
										// Limpiar hijos de plant (area y system)
										hierarchyStore.clearArea();
										hierarchyStore.clearSystem();
										plantSearch = { id: null, description: '', readonly: false };
										areaSearch = { id: null, description: '', readonly: false };
										systemSearch = { id: null, description: '', readonly: false };
										handleApplyFilters();
									}}
									modalContentProps={{
										onselect: (plant) => {
											hierarchyStore.updatePlant({
												id: plant.id,
												description: plant.description || plant.name || `Plant ${plant.id}`
											});
											// Limpiar hijos cuando se selecciona un plant diferente
											hierarchyStore.clearArea();
											hierarchyStore.clearSystem();
											plantSearch = {
												id: plant.id,
												description: plant.description || plant.name || `Plant ${plant.id}`,
												readonly: false
											};
											areaSearch = { id: null, description: '', readonly: false };
											systemSearch = { id: null, description: '', readonly: false };
											handleApplyFilters();
										}
									}}
								/>
							</div>
						</div>

						<!-- Area -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">Area</label>
							<div class="mt-1">
								<SearchInput
									bind:value={areaSearch}
									placeholder="Select area..."
									width="w-full"
									modalTitle="Select Area"
									modalDescription="Choose an area from the list"
									modalContent={AreaModalTable}
									hierarchyLevel="area"
									onclear={() => {
										hierarchyStore.clearArea();
										// Limpiar hijo de area (system)
										hierarchyStore.clearSystem();
										areaSearch = { id: null, description: '', readonly: false };
										systemSearch = { id: null, description: '', readonly: false };
										handleApplyFilters();
									}}
									modalContentProps={{
										onselect: (area) => {
											hierarchyStore.updateArea({
												id: area.id,
												description: area.description || area.name || `Area ${area.id}`
											});
											// Limpiar hijo cuando se selecciona un area diferente
											hierarchyStore.clearSystem();
											areaSearch = {
												id: area.id,
												description: area.description || area.name || `Area ${area.id}`,
												readonly: false
											};
											systemSearch = { id: null, description: '', readonly: false };
											handleApplyFilters();
										}
									}}
								/>
							</div>
						</div>

						<!-- System -->
						<div>
							<label class="text-xs font-medium text-muted-foreground">System</label>
							<div class="mt-1">
								<SearchInput
									bind:value={systemSearch}
									placeholder="Select system..."
									width="w-full"
									modalTitle="Select System"
									modalDescription="Choose a system from the list"
									modalContent={SystemModalTable}
									hierarchyLevel="system"
									onclear={() => {
										hierarchyStore.clearSystem();
										systemSearch = { id: null, description: '', readonly: false };
										handleApplyFilters();
									}}
									modalContentProps={{
										onselect: (system) => {
											hierarchyStore.updateSystem({
												id: system.id,
												description: system.description || system.name || `System ${system.id}`
											});
											systemSearch = {
												id: system.id,
												description: system.description || system.name || `System ${system.id}`,
												readonly: false
											};
											handleApplyFilters();
										}
									}}
								/>
							</div>
						</div>
					</div>

					<!-- Botones de acción -->
					<div class="mt-4 flex items-center justify-end gap-3">
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								// Limpiar filtros de texto
								filters = {
									code: '',
									description: '',
									componentCode: '',
									componentDescription: '',
									account: { id: undefined },
									plant: { id: undefined },
									area: { id: undefined },
									system: { id: undefined }
								};
								// Reinicializar jerarquía desde el login
								const userHierarchies = authStore.getUserHierarchies();
								hierarchyStore.initFromLogin(userHierarchies);
								// Sincronizar SearchInputs con hierarchy store actualizado
								const hierarchy = $hierarchyStore;
								accountSearch = { ...hierarchy.account };
								plantSearch = { ...hierarchy.plant };
								areaSearch = { ...hierarchy.area };
								systemSearch = { ...hierarchy.system };
								// Recargar con jerarquía
								assetOutlookStore.loadWithHierarchy();
							}}
						>
							Clear All
						</Button>
						<Button size="sm" onclick={() => handleApplyFilters()}>Apply Filters</Button>
					</div>
				</div>
			{/if}

			<!-- Tabla de componentes -->
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head 
								class="cursor-pointer hover:text-foreground select-none"
								onclick={() => handleSort('asset')}
							>
								<div class="flex items-center gap-1">
									Asset
									{#if getSortIcon('asset')}
										<svelte:component this={getSortIcon('asset')} class="h-4 w-4" />
									{/if}
								</div>
							</Table.Head>
							<Table.Head 
								class="cursor-pointer hover:text-foreground select-none"
								onclick={() => handleSort('type')}
							>
								<div class="flex items-center gap-1">
									Type
									{#if getSortIcon('type')}
										<svelte:component this={getSortIcon('type')} class="h-4 w-4" />
									{/if}
								</div>
							</Table.Head>
							<Table.Head 
								class="cursor-pointer hover:text-foreground select-none"
								onclick={() => handleSort('component')}
							>
								<div class="flex items-center gap-1">
									Component
									{#if getSortIcon('component')}
										<svelte:component this={getSortIcon('component')} class="h-4 w-4" />
									{/if}
								</div>
							</Table.Head>
							{#if columnVisibility.vib}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="Vibration Analysis - Click to sort by date/alarm"
									onclick={() => handleSort('vib')}
								>
									<div class="flex items-center gap-1 justify-center">
										Vib
										{#if getSortIcon('vib')}
											<svelte:component this={getSortIcon('vib')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.trib}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="Tribology Analysis - Click to sort by date/alarm"
									onclick={() => handleSort('trib')}
								>
									<div class="flex items-center gap-1 justify-center">
										Trib
										{#if getSortIcon('trib')}
											<svelte:component this={getSortIcon('trib')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.mce}
								<Table.Head
									class="cursor-pointer hover:text-foreground select-none"
									title="Motor Current Analysis - Click to sort by date/alarm"
									onclick={() => handleSort('mce')}
								>
									<div class="flex items-center gap-1 justify-center">
										MCE
										{#if getSortIcon('mce')}
											<svelte:component this={getSortIcon('mce')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.irrot}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="IR Rotational - Click to sort by date/alarm"
									onclick={() => handleSort('irrot')}
								>
									<div class="flex items-center gap-1 justify-center">
										IRr
										{#if getSortIcon('irrot')}
											<svelte:component this={getSortIcon('irrot')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.irelec}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="IR Electrical - Click to sort by date/alarm"
									onclick={() => handleSort('irelec')}
								>
									<div class="flex items-center gap-1 justify-center">
										IRe
										{#if getSortIcon('irelec')}
											<svelte:component this={getSortIcon('irelec')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.irstruc}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="IR Structural - Click to sort by date/alarm"
									onclick={() => handleSort('irstruc')}
								>
									<div class="flex items-center gap-1 justify-center">
										IRs
										{#if getSortIcon('irstruc')}
											<svelte:component this={getSortIcon('irstruc')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.uerot}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="UE Rotational - Click to sort by date/alarm"
									onclick={() => handleSort('uerot')}
								>
									<div class="flex items-center gap-1 justify-center">
										UEr
										{#if getSortIcon('uerot')}
											<svelte:component this={getSortIcon('uerot')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.ueelec}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="UE Electrical - Click to sort by date/alarm"
									onclick={() => handleSort('ueelec')}
								>
									<div class="flex items-center gap-1 justify-center">
										UEe
										{#if getSortIcon('ueelec')}
											<svelte:component this={getSortIcon('ueelec')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.ueleak}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="UE Leak Detection - Click to sort by date/alarm"
									onclick={() => handleSort('ueleak')}
								>
									<div class="flex items-center gap-1 justify-center">
										UEL
										{#if getSortIcon('ueleak')}
											<svelte:component this={getSortIcon('ueleak')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.bal}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="Balance Analysis - Click to sort by date/alarm"
									onclick={() => handleSort('bal')}
								>
									<div class="flex items-center gap-1 justify-center">
										Bal
										{#if getSortIcon('bal')}
											<svelte:component this={getSortIcon('bal')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
							{/if}
							{#if columnVisibility.algn}
								<Table.Head 
									class="cursor-pointer hover:text-foreground select-none" 
									title="Alignment Analysis - Click to sort by date/alarm"
									onclick={() => handleSort('algn')}
								>
									<div class="flex items-center gap-1 justify-center">
										Algn
										{#if getSortIcon('algn')}
											<svelte:component this={getSortIcon('algn')} class="h-4 w-4" />
										{/if}
									</div>
								</Table.Head>
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
