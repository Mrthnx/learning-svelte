import { api } from './api';
import { createApiUrl } from '../shared';

export interface User {
	id?: number | null;
	name?: string;
	lastName?: string;
	email?: string;
	image?: string;
	active?: boolean;
	phone?: string;
	dni?: string;
	notifyWhatsapp?: boolean;
	notifyEmail?: boolean;
	language?: string;
	account?: {
		id?: number;
		code?: string;
		description?: string;
	};
	plant?: {
		id?: number;
		code?: string;
		description?: string;
	};
	area?: {
		id?: number;
		code?: string;
		description?: string;
	};
	system?: {
		id?: number;
		code?: string;
		description?: string;
	};
	role?: {
		id?: number;
		code?: string;
		description?: string;
		name?: string;
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

export const userService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<User>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('users', page, pageSize, filters);
		const response: ApiResponse<PaginateData<User>> = await api.getLoader(url);

		return {
			rows: response.data.records || [],
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<User> {
		const response: ApiResponse<User> = await api.get(`users/${id}`);
		return response.data;
	},

	async create(user: Omit<User, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...user
		};
		await api.post('users', data);
		return { success: true };
	},

	async update(id: number, user: User): Promise<{ success: boolean }> {
		await api.put(`users/${id}`, user);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`users/${id}`);
		return { success: true };
	}
};
