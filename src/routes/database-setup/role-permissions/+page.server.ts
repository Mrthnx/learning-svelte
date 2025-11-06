import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		throw redirect(302, '/auth');
	}

	try {
		// Usar fetch directamente en el servidor
		const res = await fetch(`${PUBLIC_API_URL}/users/me/information`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) {
			throw redirect(302, '/auth');
		}

		const response = await res.json();
		const user = response.data;

		// Verificar si es superadmin (level 1)
		if (user?.role?.level !== 1) {
			throw redirect(302, '/dashboard');
		}

		return { user };
	} catch (err: any) {
		// Re-throw SvelteKit errors
		if (err.status) {
			throw err;
		}
		// Handle network or other errors
		console.error('Error fetching user:', err);
		throw redirect(302, '/auth');
	}
};
