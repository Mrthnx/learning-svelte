import { writable } from 'svelte/store';

interface UnauthorizedAlertState {
	show: boolean;
	message: string;
}

const initialState: UnauthorizedAlertState = {
	show: false,
	message: ''
};

function createUnauthorizedAlertStore() {
	const { subscribe, set } = writable<UnauthorizedAlertState>(initialState);

	return {
		subscribe,
		show: (message: string) => set({ show: true, message }),
		hide: () => set(initialState)
	};
}

export const unauthorizedAlert = createUnauthorizedAlertStore();
