import { api } from './api';
import { createApiUrl, API_ENDPOINTS, buildEndpoint, PAGINATION } from '../shared';
import type {
	PlantFailure,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

export async function getAllPlantFailures(
	params: PaginateRequest = {}
): Promise<PaginateResponse<PlantFailure>> {
	const {
		page = PAGINATION.DEFAULT_PAGE,
		pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
		filters = {}
	} = params;

	const url = createApiUrl(API_ENDPOINTS.PLANT_FAILURES, page, pageSize, filters);
	const response: ApiResponse<PaginateData<PlantFailure>> = await api.getLoader(url);

	return {
		rows: response.data.records || [],
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getPlantFailureById(id: number): Promise<PlantFailure> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANT_FAILURES, id);
	const response: ApiResponse<PlantFailure> = await api.get(endpoint);
	return response.data;
}

export async function createPlantFailure(
	data: Omit<PlantFailure, 'id'>
): Promise<{ success: boolean }> {
	const payload = {
		id: null,
		...data
	};
	await api.post(API_ENDPOINTS.PLANT_FAILURES, payload);
	return { success: true };
}

export async function updatePlantFailure(
	id: number,
	data: PlantFailure
): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANT_FAILURES, id);
	await api.put(endpoint, data);
	return { success: true };
}

export async function deletePlantFailure(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANT_FAILURES, id);
	await api.del(endpoint);
	return { success: true };
}

export const plantFailureService = {
	getAll: getAllPlantFailures,
	getById: getPlantFailureById,
	create: createPlantFailure,
	update: updatePlantFailure,
	delete: deletePlantFailure
};
