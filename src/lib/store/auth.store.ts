import { writable } from 'svelte/store';
import type { User, MenuItem, SubMenuItem } from '$lib/types';
import { transformMenuItems } from '$lib/utils/index';
import { storage } from '$lib/utils/storage';
import { logger } from '$lib/utils/logger';
import { ROLE_LEVELS } from '$lib/shared';

// Define la estructura de los datos de autenticación
interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
	is2fa: boolean;
	menu: MenuItem[];
	submenus?: SubMenuItem[];
}

// La clave que usaremos en localStorage
const STORAGE_KEY = 'auth-data';

// Valor inicial del store (desconectado)
const initialValue: AuthState = {
	isAuthenticated: false,
	user: null,
	token: null,
	is2fa: false,
	menu: []
};

/**
 * Carga el estado inicial desde localStorage si existe.
 * Esta función se asegura de ejecutarse solo en el navegador.
 */
function getInitialState(): AuthState {
	const storedValue = storage.get<AuthState>(STORAGE_KEY);
	if (storedValue) {
		return storedValue;
	}
	return initialValue;
}

/**
 * Crea un store personalizado para la autenticación.
 */
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(getInitialState());

	// Persiste en localStorage cada vez que el store cambia
	subscribe((state) => {
		storage.set(STORAGE_KEY, state);
	});

	return {
		subscribe,
		// Método para iniciar sesión
		login: async (user: User, token: string, menu: MenuItem[]) => {
			const transformedMenu = transformMenuItems(menu);
			const newState: AuthState = {
				isAuthenticated: true,
				user,
				token,
				is2fa: false,
				menu: transformedMenu
			};
			set(newState);
		},
		information2FA: async (user: User) => {
			const newState: AuthState = {
				isAuthenticated: false,
				user,
				token: null,
				is2fa: true,
				menu: []
			};
			set(newState);
		},
		saveSubMenus: (submenus: SubMenuItem[]) => {
			update((state) => ({
				...state,
				submenus
			}));
		},
		// Método para cerrar sesión
		logout: () => {
			set(initialValue);
			storage.remove(STORAGE_KEY);
		},

		isSuperAdmin: () => {
			let isSuper = false;
			const unsubscribe = subscribe((state) => {
				// Clean Code: Use named constant instead of magic number
				isSuper = state.user?.role?.level === ROLE_LEVELS.SUPERADMIN;
			});
			unsubscribe();
			return isSuper;
		},

		// Método para obtener las jerarquías del usuario
		getUserHierarchies: () => {
			let currentState: AuthState = initialValue;
			// Subscribe to get the current value, then immediately unsubscribe.
			const unsubscribe = subscribe((state) => {
				currentState = state;
			});
			unsubscribe();

			if (!currentState.user) {
				return {
					account: undefined,
					plant: undefined,
					area: undefined,
					system: undefined
				};
			}

			return {
				account: currentState.user.account,
				plant: currentState.user.plant,
				area: currentState.user.area,
				system: currentState.user.system
			};
		}
	};
}

export const authStore = createAuthStore();
