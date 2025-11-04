import { api } from './api';
import { createApiUrl, API_ENDPOINTS, buildEndpoint } from '../shared';
import type {
	PlantLubricant,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

export async function getAllPlantLubricants(
	params: PaginateRequest = {}
): Promise<PaginateResponse<PlantLubricant>> {
	const { page = 1, pageSize = 10, filters = {} } = params;

	const url = createApiUrl(API_ENDPOINTS.PLANT_LUBRICANTS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<PlantLubricant>> = await api.getLoader(url);

	return {
		rows: response.data.records || [],
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getPlantLubricantById(id: number): Promise<PlantLubricant> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANT_LUBRICANTS, id);
	const response: ApiResponse<PlantLubricant> = await api.get(endpoint);
	return response.data;
}

export async function createPlantLubricant(
	data: Omit<PlantLubricant, 'id'>
): Promise<{ success: boolean }> {
	const payload = {
		id: null,
		...data
	};
	await api.post(API_ENDPOINTS.PLANT_LUBRICANTS, payload);
	return { success: true };
}

export async function updatePlantLubricant(
	id: number,
	data: PlantLubricant
): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANT_LUBRICANTS, id);
	await api.put(endpoint, data);
	return { success: true };
}

export async function deletePlantLubricant(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANT_LUBRICANTS, id);
	await api.del(endpoint);
	return { success: true };
}

export const plantLubricantService = {
	getAll: getAllPlantLubricants,
	getById: getPlantLubricantById,
	create: createPlantLubricant,
	update: updatePlantLubricant,
	delete: deletePlantLubricant
};
