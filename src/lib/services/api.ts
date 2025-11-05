import { PUBLIC_API_URL } from '$env/static/public';
import { get as _get } from 'svelte/store';
import { authStore, loadingStore, unauthorizedAlert } from '../store';
import { logger } from '../utils/logger';
import { browser } from '$app/environment';
import { HTTP_STATUS } from '$lib/shared';

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

/**
 * Handle unauthorized (401) responses
 * Clean Code: Extract duplicate logic to single function
 */
function handleUnauthorized(): never {
	if (browser) {
		logger.debug('Unauthorized request detected (401)');
		if (!isUnauthorizedAlertShowing) {
			isUnauthorizedAlertShowing = true;
			unauthorizedAlert.show(
				'Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión de nuevo.'
			);
		}
	}
	throw new ApiError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Parse error response and extract message
 * Clean Code: DRY - Reuse error parsing logic
 */
async function parseErrorResponse(res: Response, defaultMessage: string): Promise<string> {
	try {
		const json = await res.json();
		return json.response?.description || json.message || defaultMessage;
	} catch (error) {
		logger.debug('Failed to parse error response as JSON', error);
		return defaultMessage;
	}
}

async function send(method: string, path: string, data?: unknown, _token?: string) {
	const opts: RequestInit = { method, headers: {} };
	const token = _token ?? _get(authStore).token;

	opts.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
	if (data) {
		opts.body = JSON.stringify(data);
	}

	const res = await fetch(`${base}/${path}`, opts);

	// Clean Code: Use extracted function for 401 handling
	if (res.status === HTTP_STATUS.UNAUTHORIZED) {
		handleUnauthorized();
	}

	if (!res.ok) {
		const defaultMessage = `Request failed with status ${res.status}`;
		const message = await parseErrorResponse(res, defaultMessage);
		throw new ApiError(message, res.status);
	}

	// Clean Code: Use named constants instead of magic numbers
	if (res.status === HTTP_STATUS.NO_CONTENT || res.status === HTTP_STATUS.CREATED) {
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

export function post(path: string, data: unknown) {
	return send('POST', path, data);
}

export async function postLoader(path: string, data: unknown) {
	loadingStore.set(true);
	try {
		const result = await send('POST', path, data);
		return result;
	} finally {
		loadingStore.set(false);
	}
}

export function put(path: string, data: unknown) {
	return send('PUT', path, data);
}

export async function putLoader(path: string, data: unknown) {
	loadingStore.set(true);
	try {
		const result = await send('PUT', path, data);
		return result;
	} finally {
		loadingStore.set(false);
	}
}

async function sendFormData(method: string, path: string, formData: FormData, _token?: string) {
	const token = _token ?? _get(authStore).token;

	const opts: RequestInit = {
		method,
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: formData
	};

	const res = await fetch(`${base}/${path}`, opts);

	// Clean Code: Reuse extracted function
	if (res.status === HTTP_STATUS.UNAUTHORIZED) {
		handleUnauthorized();
	}

	if (!res.ok) {
		const defaultMessage = `Request failed with status ${res.status}`;
		const message = await parseErrorResponse(res, defaultMessage);
		throw new ApiError(message, res.status);
	}

	// Clean Code: Use named constants
	if (res.status === HTTP_STATUS.NO_CONTENT || res.status === HTTP_STATUS.CREATED) {
		return { success: true };
	}

	return await res.json();
}

export function postFormData(path: string, formData: FormData) {
	return sendFormData('POST', path, formData);
}

export function patch(path: string, data: unknown) {
	return send('PATCH', path, data);
}

export async function patchLoader(path: string, data: unknown) {
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
	postFormData,
	put,
	putLoader,
	patch,
	patchLoader,
	del,
	delLoader
};
