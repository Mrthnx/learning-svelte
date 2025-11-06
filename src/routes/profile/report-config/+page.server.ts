import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { api } from '$lib/services/api';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		throw error(401, 'Authentication required');
	}

	try {
		const response = await api.getLoader('users/me/information', token);

		if (!response || !response.data) {
			throw error(404, 'User not found');
		}

		return {
			user: response.data
		};
	} catch (err: any) {
		// Re-throw SvelteKit errors
		if (err.status) {
			throw err;
		}
		// Handle network or other errors
		console.error('Error fetching user:', err);
		throw error(500, 'Failed to load user data');
	}
};
