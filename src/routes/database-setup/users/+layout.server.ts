import { api } from '$lib/services/api';
import { redirect, error } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
	try {
		// Get all roles with a large page size to load all roles
		const token = cookies.get('token');
		const roles = await api.getLoader('roles', token);

		return {
			roles: roles?.data || []
		};
	} catch (err: any) {
		console.error('Error loading roles:', err);

		// Handle 401 Unauthorized errors
		if (err.status === 401 || err.message?.includes('Unauthorized')) {
			throw redirect(303, '/auth?unauthorized=1');
		}

		// Re-throw SvelteKit errors
		if (err.status) {
			throw error(err.status, err.message || 'Failed to load user data');
		}

		// Generic error fallback
		throw error(500, 'Failed to load user data');
	}
};
