import { api } from './api';
import { createApiUrl, normalizeCoordinate, API_ENDPOINTS, buildEndpoint, PAGINATION } from '../shared';
import type {
	Area,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

function normalizeArea(area: Area): Area {
	return {
		...area,
		latitude: normalizeCoordinate(area.latitude),
		longitude: normalizeCoordinate(area.longitude)
	};
}

export async function getAllAreas(params: PaginateRequest = {}): Promise<PaginateResponse<Area>> {
	const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE, filters = {} } = params;

	const url = createApiUrl(API_ENDPOINTS.AREAS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<Area>> = await api.getLoader(url);

	return {
		rows: (response.data.records || []).map(normalizeArea),
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getAreaById(id: number): Promise<Area> {
	const endpoint = buildEndpoint(API_ENDPOINTS.AREAS, id);
	const response: ApiResponse<Area> = await api.get(endpoint);
	return normalizeArea(response.data);
}

export async function createArea(area: Omit<Area, 'id'>): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...area
	};
	await api.post(API_ENDPOINTS.AREAS, data);
	return { success: true };
}

export async function updateArea(id: number, area: Area): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.AREAS, id);
	await api.put(endpoint, area);
	return { success: true };
}

export async function deleteArea(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.AREAS, id);
	await api.del(endpoint);
	return { success: true };
}

export const areaService = {
	getAll: getAllAreas,
	getById: getAreaById,
	create: createArea,
	update: updateArea,
	delete: deleteArea
};
