import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, MenuItem, SubMenuItem } from '$lib/types';
import { transformMenuItems } from '$lib/utils/index';

// Define la estructura de los datos de autenticación
interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
	is2fa: boolean;
	menu: any[];
	submenus?: any[];
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
	if (!browser) {
		return initialValue;
	}

	const storedValue = localStorage.getItem(STORAGE_KEY);
	if (storedValue) {
		try {
			return JSON.parse(storedValue);
		} catch (e) {
			console.error('Error parsing auth data from localStorage', e);
			return initialValue;
		}
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
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		}
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
			// Opcional: también puedes removerlo explícitamente
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
		},

		isSuperAdmin: () => {
			let isSuper = false;
			const unsubscribe = subscribe((state) => {
				isSuper = state.user?.role?.level === 1;
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
