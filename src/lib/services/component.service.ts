import { api } from './api';
import { createApiUrl } from '../shared';

export interface Component {
	id?: number | null;
	code?: string;
	description?: string;
	order?: number;
	image?: string;
	mawoi?: {
		id?: number;
		code?: string;
		description?: string;
	};
	componentType?: {
		id?: number;
		code?: string;
		description?: string;
		image?: string;
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

export const componentService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Component>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('component', page, pageSize, filters);
		const response: ApiResponse<PaginateData<Component>> = await api.getLoader(url);

		return {
			rows: response.data.records || [],
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<Component> {
		const response: ApiResponse<Component> = await api.get(`component/${id}`);
		return response.data;
	},

	async create(component: Omit<Component, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...component
		};
		await api.post('component', data);
		return { success: true };
	},

	async update(id: number, component: Component): Promise<{ success: boolean }> {
		await api.put(`component/${id}`, component);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`component/${id}`);
		return { success: true };
	}
};
