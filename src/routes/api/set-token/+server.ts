import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { token } = await request.json();
	cookies.set('token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7 // 1 semana
	});
	return new Response(JSON.stringify({ ok: true }));
};
