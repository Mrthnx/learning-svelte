import { api } from './api';
import { createApiUrl } from '../shared';

export interface PlantFailure {
	id: number | null;
	plant?: Plant;
	failureMode?: ComponentFailureMode;
}

export interface Plant {
	id?: number | null;
	code?: string;
	description?: string;
}

export interface ComponentFailureMode {
	id: number | null;
	code?: string;
	description?: string;
	failureGroup?: ComponentFailureGroup;
}

export interface ComponentFailureGroup {
	id: number | null;
	code?: string;
	description?: string;
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

export const plantFailureService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<PlantFailure>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('plant-failure', page, pageSize, filters);
		const response: ApiResponse<PaginateData<PlantFailure>> = await api.getLoader(url);

		return {
			rows: response.data.records || [],
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<PlantFailure> {
		const response: ApiResponse<PlantFailure> = await api.get(`plant-failure/${id}`);
		return response.data;
	},

	async create(data: Omit<PlantFailure, 'id'>): Promise<{ success: boolean }> {
		const payload = {
			id: null,
			...data
		};
		await api.post('plant-failure', payload);
		return { success: true };
	},

	async update(id: number, data: PlantFailure): Promise<{ success: boolean }> {
		await api.put(`plant-failure/${id}`, data);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`plant-failure/${id}`);
		return { success: true };
	}
};
