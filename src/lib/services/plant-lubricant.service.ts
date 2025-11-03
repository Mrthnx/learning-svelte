import { api } from './api';

export interface PlantLubricant {
	id: number | null;
	lubricant?: Lubricant;
	plant?: Plant;
}

export interface Lubricant {
	id: number | null;
	code?: string;
	description?: string;
}

export interface Plant {
	id?: number;
	code?: string;
	description?: string;
}

export interface PaginateResponse<T> {
	rows: T[];
	page: number;
	size: number;
	total: number;
}

export interface GetAllParams {
	page?: number;
	pageSize?: number;
	filters?: Record<string, any>;
}

class PlantLubricantService {
	private baseUrl = 'plant-lubricants';

	async getAll(params?: GetAllParams): Promise<PaginateResponse<PlantLubricant>> {
		const { page = 1, pageSize = 10, filters = {} } = params || {};

		const queryParams = new URLSearchParams({
			page: page.toString(),
			size: pageSize.toString(),
			...filters
		});

		const response = await api.get(`${this.baseUrl}?${queryParams}`);
		return response.data;
	}

	async getById(id: number): Promise<PlantLubricant> {
		const response = await api.get(`${this.baseUrl}/${id}`);
		return response.data;
	}

	async create(data: Partial<PlantLubricant>): Promise<PlantLubricant> {
		const response = await api.post(this.baseUrl, data);
		return response.data;
	}

	async update(id: number, data: Partial<PlantLubricant>): Promise<PlantLubricant> {
		const response = await api.patch(`${this.baseUrl}/${id}`, data);
		return response.data;
	}

	async delete(id: number): Promise<void> {
		await api.delete(`${this.baseUrl}/${id}`);
	}
}

export const plantLubricantService = new PlantLubricantService();
