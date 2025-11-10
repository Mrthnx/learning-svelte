import { api } from './api';
import { createApiUrl, API_ENDPOINTS, buildEndpoint, PAGINATION } from '../shared';
import type {
	Component,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

export async function getAllComponents(
	params: PaginateRequest = {}
): Promise<PaginateResponse<Component>> {
	const {
		page = PAGINATION.DEFAULT_PAGE,
		pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
		filters = {}
	} = params;

	try {
		const url = createApiUrl(API_ENDPOINTS.COMPONENTS, page, pageSize, filters);
		const response: ApiResponse<PaginateData<Component>> = await api.getLoader(url);

		return {
			rows: response.data.records || [],
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	} catch (error: any) {
		// If endpoint doesn't exist (404), return empty results instead of throwing
		if (error.status === 404) {
			console.warn('Components endpoint not implemented yet, returning empty results');
			return {
				rows: [],
				page,
				size: pageSize,
				total: 0
			};
		}
		throw error;
	}
}

export async function getComponentById(id: number): Promise<Component> {
	try {
		const endpoint = buildEndpoint(API_ENDPOINTS.COMPONENTS, id);
		const response: ApiResponse<Component> = await api.get(endpoint);
		return response.data;
	} catch (error: any) {
		if (error.status === 404) {
			throw new Error('Component endpoint not implemented yet');
		}
		throw error;
	}
}

export async function createComponent(
	component: Omit<Component, 'id'>
): Promise<{ success: boolean }> {
	try {
		const data = {
			id: null,
			...component
		};
		await api.post(API_ENDPOINTS.COMPONENTS, data);
		return { success: true };
	} catch (error: any) {
		if (error.status === 404) {
			throw new Error('Component endpoint not implemented yet');
		}
		throw error;
	}
}

export async function updateComponent(
	id: number,
	component: Component
): Promise<{ success: boolean }> {
	try {
		const endpoint = buildEndpoint(API_ENDPOINTS.COMPONENTS, id);
		await api.put(endpoint, component);
		return { success: true };
	} catch (error: any) {
		if (error.status === 404) {
			throw new Error('Component endpoint not implemented yet');
		}
		throw error;
	}
}

export async function deleteComponent(id: number): Promise<{ success: boolean }> {
	try {
		const endpoint = buildEndpoint(API_ENDPOINTS.COMPONENTS, id);
		await api.del(endpoint);
		return { success: true };
	} catch (error: any) {
		if (error.status === 404) {
			throw new Error('Component endpoint not implemented yet');
		}
		throw error;
	}
}

export const componentService = {
	getAll: getAllComponents,
	getById: getComponentById,
	create: createComponent,
	update: updateComponent,
	delete: deleteComponent
};
