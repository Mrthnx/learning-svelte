import { api } from './api';
import { createApiUrl, normalizeCoordinate, API_ENDPOINTS, buildEndpoint } from '../shared';
import type {
	System,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

function normalizeSystem(system: System): System {
	return {
		...system,
		latitude: normalizeCoordinate(system.latitude),
		longitude: normalizeCoordinate(system.longitude)
	};
}

export async function getAllSystems(
	params: PaginateRequest = {}
): Promise<PaginateResponse<System>> {
	const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE, filters = {} } = params;

	const url = createApiUrl(API_ENDPOINTS.SYSTEMS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<System>> = await api.getLoader(url);

	return {
		rows: (response.data.records || []).map(normalizeSystem),
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getSystemById(id: number): Promise<System> {
	const endpoint = buildEndpoint(API_ENDPOINTS.SYSTEMS, id);
	const response: ApiResponse<System> = await api.get(endpoint);
	return normalizeSystem(response.data);
}

export async function createSystem(system: Omit<System, 'id'>): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...system
	};
	await api.post(API_ENDPOINTS.SYSTEMS, data);
	return { success: true };
}

export async function updateSystem(id: number, system: System): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.SYSTEMS, id);
	await api.put(endpoint, system);
	return { success: true };
}

export async function deleteSystem(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.SYSTEMS, id);
	await api.del(endpoint);
	return { success: true };
}

export const systemService = {
	getAll: getAllSystems,
	getById: getSystemById,
	create: createSystem,
	update: updateSystem,
	delete: deleteSystem
};
