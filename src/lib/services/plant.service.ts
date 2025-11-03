import { api } from './api';
	import { createApiUrl, normalizeCoordinate } from '../shared';

export interface Plant {
	id?: number | null;
	code?: string;
	description?: string;
	nameContactor?: string;
	telephoneContactor?: string;
	mailContactor?: string;
	order?: number;
	latitude?: number;
	longitude?: number;
	image?: string;
	account?: {
		id?: number;
		code?: string;
		description?: string;
	};
}

export interface PaginateRequest {
	page?: number;
	pageSize?: number;
	filters?: Record<string, any>;
}

export interface ApiResponse<T> {
	trackingId: string;
	data: T;
	response: any;
}

export interface PaginateData<T> {
	ok: boolean;
	records: T[];
	total: number;
}

export interface PaginateResponse<T> {
	rows: T[];
	page: number;
	size: number;
	total: number;
}

function normalizePlant(plant: Plant): Plant {
	return {
		...plant,
		latitude: normalizeCoordinate(plant.latitude),
		longitude: normalizeCoordinate(plant.longitude)
	};
}

export const plantService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Plant>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('plants', page, pageSize, filters);
		const response: ApiResponse<PaginateData<Plant>> = await api.getLoader(url);

		return {
			rows: (response.data.records || []).map(normalizePlant),
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<Plant> {
		const response: ApiResponse<Plant> = await api.get(`plants/${id}`);
		return normalizePlant(response.data);
	},

	async create(plant: Omit<Plant, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...plant
		};
		await api.post('plants', data);
		return { success: true };
	},

	async update(id: number, plant: Plant): Promise<{ success: boolean }> {
		await api.put(`plants/${id}`, plant);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`plants/${id}`);
		return { success: true };
	}
};
