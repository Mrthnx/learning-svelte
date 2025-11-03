import { api } from './api';
import { createApiUrl, normalizeCoordinate } from '../shared';

export interface System {
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
	area?: {
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

function normalizeSystem(system: System): System {
	return {
		...system,
		latitude: normalizeCoordinate(system.latitude),
		longitude: normalizeCoordinate(system.longitude)
	};
}

export const systemService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<System>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('systems', page, pageSize, filters);
		const response: ApiResponse<PaginateData<System>> = await api.getLoader(url);

		return {
			rows: (response.data.records || []).map(normalizeSystem),
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<System> {
		const response: ApiResponse<System> = await api.get(`systems/${id}`);
		return normalizeSystem(response.data);
	},

	async create(system: Omit<System, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...system
		};
		await api.post('systems', data);
		return { success: true };
	},

	async update(id: number, system: System): Promise<{ success: boolean }> {
		await api.put(`systems/${id}`, system);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`systems/${id}`);
		return { success: true };
	}
};
