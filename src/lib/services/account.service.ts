import { api } from './api';
import { createApiUrl, normalizeCoordinate } from '../shared';

export interface Account {
	id: number | null;
	code: string;
	description: string;
	nameContactor?: string;
	telephoneContactor?: string;
	mailContactor?: string;
	latitude?: number;
	longitude?: number;
	image?: string;
}

export interface PaginateRequest {
	page?: number;
	pageSize?: number;
	filters?: {
		code?: string;
		description?: string;
		account?: { id: number };
		plant?: { id: number };
		area?: { id: number };
		system?: { id: number };
		asset?: { id: number };
	};
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

/**
 * Normalize account coordinates
 */
function normalizeAccount(account: Account): Account {
	return {
		...account,
		latitude: normalizeCoordinate(account.latitude),
		longitude: normalizeCoordinate(account.longitude)
	};
}

export const accountService = {
	/**
	 * Get all accounts with pagination
	 */
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Account>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('accounts', page, pageSize, filters);

		const response: ApiResponse<PaginateData<Account>> = await api.getLoader(url);

		return {
			rows: (response.data.records || []).map(normalizeAccount),
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	/**
	 * Get account by ID
	 */
	async getById(id: number): Promise<Account> {
		const response: ApiResponse<Account> = await api.get(`accounts/${id}`);
		return normalizeAccount(response.data);
	},

	/**
	 * Create new account
	 */
	async create(account: Omit<Account, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...account
		};
		await api.post('accounts', data);
		return { success: true };
	},

	/**
	 * Update existing account
	 */
	async update(id: number, account: Account): Promise<{ success: boolean }> {
		await api.put(`accounts/${id}`, account);
		return { success: true };
	},

	/**
	 * Delete account
	 */
	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`accounts/${id}`);
		return { success: true };
	}
};
