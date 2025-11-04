import { api } from './api';
import { createApiUrl, API_ENDPOINTS, buildEndpoint } from '../shared';
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
	const { page = 1, pageSize = 10, filters = {} } = params;

	const url = createApiUrl(API_ENDPOINTS.COMPONENTS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<Component>> = await api.getLoader(url);

	return {
		rows: response.data.records || [],
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getComponentById(id: number): Promise<Component> {
	const endpoint = buildEndpoint(API_ENDPOINTS.COMPONENTS, id);
	const response: ApiResponse<Component> = await api.get(endpoint);
	return response.data;
}

export async function createComponent(
	component: Omit<Component, 'id'>
): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...component
	};
	await api.post(API_ENDPOINTS.COMPONENTS, data);
	return { success: true };
}

export async function updateComponent(
	id: number,
	component: Component
): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.COMPONENTS, id);
	await api.put(endpoint, component);
	return { success: true };
}

export async function deleteComponent(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.COMPONENTS, id);
	await api.del(endpoint);
	return { success: true };
}

export const componentService = {
	getAll: getAllComponents,
	getById: getComponentById,
	create: createComponent,
	update: updateComponent,
	delete: deleteComponent
};
