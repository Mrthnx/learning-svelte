import { api } from './api';
import {
	createApiUrl,
	normalizeCoordinate,
	API_ENDPOINTS,
	buildEndpoint,
	PAGINATION
} from '../shared';
import type {
	Plant,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

function normalizePlant(plant: Plant): Plant {
	return {
		...plant,
		latitude: normalizeCoordinate(plant.latitude),
		longitude: normalizeCoordinate(plant.longitude)
	};
}

export async function getAllPlants(params: PaginateRequest = {}): Promise<PaginateResponse<Plant>> {
	const {
		page = PAGINATION.DEFAULT_PAGE,
		pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
		filters = {}
	} = params;

	const url = createApiUrl(API_ENDPOINTS.PLANTS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<Plant>> = await api.getLoader(url);

	return {
		rows: (response.data.records || []).map(normalizePlant),
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getPlantById(id: number): Promise<Plant> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANTS, id);
	const response: ApiResponse<Plant> = await api.get(endpoint);
	return normalizePlant(response.data);
}

export async function createPlant(plant: Omit<Plant, 'id'>): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...plant
	};
	await api.post(API_ENDPOINTS.PLANTS, data);
	return { success: true };
}

export async function updatePlant(id: number, plant: Plant): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANTS, id);
	await api.put(endpoint, plant);
	return { success: true };
}

export async function deletePlant(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.PLANTS, id);
	await api.del(endpoint);
	return { success: true };
}

export const plantService = {
	getAll: getAllPlants,
	getById: getPlantById,
	create: createPlant,
	update: updatePlant,
	delete: deletePlant
};
