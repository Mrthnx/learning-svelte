import { api } from './api';
import { createApiUrl } from '../shared';

export interface ExcelRow {
	id?: string;
	date: string;
	details: string;
}

export interface PlantLubricant {
	id: number | null;
	lubricant?: Lubricant;
	plant?: Plant;
	excelData?: ExcelRow[];
}

export interface Lubricant {
	id: number | null;
	code?: string;
	description?: string;
	text?: string;
	link?: string;
	pdfUrl?: string;
}

export interface Plant {
	id?: number | null;
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

export const plantLubricantService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<PlantLubricant>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('plant-lubricant', page, pageSize, filters);
		const response: ApiResponse<PaginateData<PlantLubricant>> = await api.getLoader(url);

		return {
			rows: response.data.records || [],
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<PlantLubricant> {
		const response: ApiResponse<PlantLubricant> = await api.get(`plant-lubricant/${id}`);
		return response.data;
	},

	async create(data: Omit<PlantLubricant, 'id'>): Promise<{ success: boolean }> {
		const payload = {
			id: null,
			...data
		};
		await api.post('plant-lubricant', payload);
		return { success: true };
	},

	async update(id: number, data: PlantLubricant): Promise<{ success: boolean }> {
		await api.put(`plant-lubricant/${id}`, data);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`plant-lubricant/${id}`);
		return { success: true };
	}
};
