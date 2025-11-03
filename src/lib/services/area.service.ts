import { api } from './api';
import { createApiUrl, normalizeCoordinate } from '../shared';

export interface Area {
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
	plant?: {
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

function normalizeArea(area: Area): Area {
	return {
		...area,
		latitude: normalizeCoordinate(area.latitude),
		longitude: normalizeCoordinate(area.longitude)
	};
}

export const areaService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Area>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('areas', page, pageSize, filters);
		const response: ApiResponse<PaginateData<Area>> = await api.getLoader(url);

		return {
			rows: (response.data.records || []).map(normalizeArea),
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<Area> {
		const response: ApiResponse<Area> = await api.get(`areas/${id}`);
		return normalizeArea(response.data);
	},

	async create(area: Omit<Area, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...area
		};
		await api.post('areas', data);
		return { success: true };
	},

	async update(id: number, area: Area): Promise<{ success: boolean }> {
		await api.put(`areas/${id}`, area);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`areas/${id}`);
		return { success: true };
	}
};