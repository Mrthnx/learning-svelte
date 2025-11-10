import { writable, derived } from 'svelte/store';
import { authStore } from './auth.store';
import type { Account, Plant, Area, System } from '$lib/types';
import { browser } from '$app/environment';

const HIERARCHY_STORAGE_KEY = 'hierarchy-store';

interface HierarchyValue {
	id: number | null;
	description: string;
	readonly: boolean;
}

interface HierarchyState {
	account: HierarchyValue;
	plant: HierarchyValue;
	area: HierarchyValue;
	system: HierarchyValue;
}

const initialValue: HierarchyState = {
	account: { id: null, description: '', readonly: false },
	plant: { id: null, description: '', readonly: false },
	area: { id: null, description: '', readonly: false },
	system: { id: null, description: '', readonly: false }
};

// Funciones de utilidad para localStorage
function loadFromStorage(): HierarchyState {
	if (!browser) return initialValue;
	try {
		const stored = localStorage.getItem(HIERARCHY_STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored) as HierarchyState;
			// Validar que la estructura sea correcta
			if (parsed.account && parsed.plant && parsed.area && parsed.system) {
				return parsed;
			}
		}
	} catch (error) {
		console.warn('Error loading hierarchy from localStorage:', error);
	}
	return initialValue;
}

function saveToStorage(state: HierarchyState): void {
	if (!browser) return;
	try {
		localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.warn('Error saving hierarchy to localStorage:', error);
	}
}

function clearStorage(): void {
	if (!browser) return;
	try {
		localStorage.removeItem(HIERARCHY_STORAGE_KEY);
	} catch (error) {
		console.warn('Error clearing hierarchy from localStorage:', error);
	}
}

/**
 * Crea un store personalizado para la jerarquía.
 */
function createHierarchyStore() {
	// Inicializar con datos de localStorage si están disponibles
	const { subscribe, set, update } = writable<HierarchyState>(loadFromStorage());

	// Función auxiliar para guardar estado automáticamente
	const setAndSave = (state: HierarchyState) => {
		set(state);
		saveToStorage(state);
	};

	const updateAndSave = (updater: (state: HierarchyState) => HierarchyState) => {
		update((state) => {
			const newState = updater(state);
			saveToStorage(newState);
			return newState;
		});
	};

	return {
		subscribe,

		// Inicializa la jerarquía desde los datos del login (readonly = true)
		initFromLogin: (userHierarchy: {
			account?: Account;
			plant?: Plant;
			area?: Area;
			system?: System;
		}) => {
			const newState: HierarchyState = {
				account: {
					id: userHierarchy.account?.id || null,
					description: userHierarchy.account?.description || '',
					readonly: !!userHierarchy.account
				},
				plant: {
					id: userHierarchy.plant?.id || null,
					description: userHierarchy.plant?.description || '',
					readonly: !!userHierarchy.plant
				},
				area: {
					id: userHierarchy.area?.id || null,
					description: userHierarchy.area?.description || '',
					readonly: !!userHierarchy.area
				},
				system: {
					id: userHierarchy.system?.id || null,
					description: userHierarchy.system?.description || '',
					readonly: !!userHierarchy.system
				}
			};
			setAndSave(newState);
		},

		// Actualiza un campo específico (readonly = false cuando se modifica)
		updateAccount: (account: { id: number; description: string }) => {
			updateAndSave((state) => ({
				...state,
				account: { ...account, readonly: false },
				// Reset de campos dependientes cuando se cambia el account
				plant: { id: null, description: '', readonly: false },
				area: { id: null, description: '', readonly: false },
				system: { id: null, description: '', readonly: false }
			}));
		},

		updatePlant: (plant: { id: number; description: string }) => {
			updateAndSave((state) => ({
				...state,
				plant: { ...plant, readonly: false },
				// Reset de campos dependientes cuando se cambia la plant
				area: { id: null, description: '', readonly: false },
				system: { id: null, description: '', readonly: false }
			}));
		},

		updateArea: (area: { id: number; description: string }) => {
			updateAndSave((state) => ({
				...state,
				area: { ...area, readonly: false },
				// Reset de campos dependientes cuando se cambia el area
				system: { id: null, description: '', readonly: false }
			}));
		},

		updateSystem: (system: { id: number; description: string }) => {
			updateAndSave((state) => ({
				...state,
				system: { ...system, readonly: false }
			}));
		},

		// Limpia un campo específico
		clearAccount: () => {
			updateAndSave((state) => ({
				...state,
				account: { id: null, description: '', readonly: false },
				plant: { id: null, description: '', readonly: false },
				area: { id: null, description: '', readonly: false },
				system: { id: null, description: '', readonly: false }
			}));
		},

		clearPlant: () => {
			updateAndSave((state) => ({
				...state,
				plant: { id: null, description: '', readonly: false },
				area: { id: null, description: '', readonly: false },
				system: { id: null, description: '', readonly: false }
			}));
		},

		clearArea: () => {
			updateAndSave((state) => ({
				...state,
				area: { id: null, description: '', readonly: false },
				system: { id: null, description: '', readonly: false }
			}));
		},

		clearSystem: () => {
			updateAndSave((state) => ({
				...state,
				system: { id: null, description: '', readonly: false }
			}));
		},

		// Resetea todo el store
		reset: () => {
			setAndSave(initialValue);
		},

		// Limpia completamente el store y localStorage
		clear: () => {
			clearStorage();
			set(initialValue);
		}
	};
}

export const hierarchyStore = createHierarchyStore();

// Derived stores para cada nivel de jerarquía
export const accountStore = derived(hierarchyStore, ($hierarchy) => $hierarchy.account);
export const plantStore = derived(hierarchyStore, ($hierarchy) => $hierarchy.plant);
export const areaStore = derived(hierarchyStore, ($hierarchy) => $hierarchy.area);
export const systemStore = derived(hierarchyStore, ($hierarchy) => $hierarchy.system);
