import { PUBLIC_API_URL } from '$env/static/public';
import { get as _get } from 'svelte/store';
import { authStore, loadingStore, unauthorizedAlert } from '../store';

import { browser } from '$app/environment';

const base = PUBLIC_API_URL;

let isUnauthorizedAlertShowing = false;

// Custom Error for API responses
export class ApiError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

async function send(method: string, path: string, data?: any, _token?: string) {
	const opts: RequestInit = { method, headers: {} };
	const token = _token ?? _get(authStore).token;

	opts.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
	if (data) {
		opts.body = JSON.stringify(data);
	}

	const res = await fetch(`${base}/${path}`, opts);

	if (res.status === 401) {
		if (browser) {
			console.log('Entró al if de 401 (browser)');
			if (!isUnauthorizedAlertShowing) {
				isUnauthorizedAlertShowing = true;
				unauthorizedAlert.show(
					'Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión de nuevo.'
				);
			}
		}
		// En SSR solo lanzamos el error, sin mostrar alertas
		throw new ApiError('Unauthorized', 401);
	}

	if (!res.ok) {
		let message = `Request failed with status ${res.status}`;
		try {
			const json = await res.json();
			message = json.response?.description || json.message || message;
		} catch (e: any) {
			// The response body was not JSON. Use the default message.
			console.log(e);
		}
		throw new ApiError(message, res.status);
	}

	// If we get here, res.ok is true
	// 204 No Content and 201 Created don't have response body
	if (res.status === 204 || res.status === 201) {
		return { success: true };
	}

	return await res.json();
}

export function get(path: string) {
	return send('GET', path);
}

export async function getLoader(path: string, token?: string) {
	loadingStore.set(true);
	try {
		const result = await send('GET', path, undefined, token);
		return result;
	} finally {
		loadingStore.set(false);
	}
}

export function del(path: string) {
	return send('DELETE', path);
}

export async function delLoader(path: string) {
	loadingStore.set(true);
	try {
		const result = await send('DELETE', path);
		return result;
	} finally {
		loadingStore.set(false);
	}
}

export function post(path: string, data: any) {
	return send('POST', path, data);
}

export async function postLoader(path: string, data: any) {
	loadingStore.set(true);
	try {
		const result = await send('POST', path, data);
		return result;
	} finally {
		loadingStore.set(false);
	}
}

export function put(path: string, data: any) {
	return send('PUT', path, data);
}

export async function putLoader(path: string, data: any) {
	loadingStore.set(true);
	try {
		const result = await send('PUT', path, data);
		return result;
	} finally {
		loadingStore.set(false);
	}
}

export function patch(path: string, data: any) {
	return send('PATCH', path, data);
}

export async function patchLoader(path: string, data: any) {
	loadingStore.set(true);
	try {
		const result = await send('PATCH', path, data);
		return result;
	} finally {
		loadingStore.set(false);
	}
}

// Export as object for convenience
export const api = {
	get,
	getLoader,
	post,
	postLoader,
	put,
	putLoader,
	patch,
	patchLoader,
	del,
	delLoader
};
