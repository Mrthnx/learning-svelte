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

export const accountService = {
	/**
	 * Get all accounts with pagination
	 */
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Account>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('accounts', page, pageSize, filters);

		const response: ApiResponse<PaginateData<Account>> = await api.getLoader(url);

		// Transform API response to our expected format, normalizing coordinates as numbers
		const normalizedRecords = (response.data.records || []).map((record) => ({
			...record,
			latitude: normalizeCoordinate(record.latitude),
			longitude: normalizeCoordinate(record.longitude)
		}));

		return {
			rows: normalizedRecords,
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
		const account = response.data;

		// Normalize coordinates
		return {
			...account,
			latitude: normalizeCoordinate(account.latitude),
			longitude: normalizeCoordinate(account.longitude)
		};
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
		// Update/Create endpoints don't return data, just 201/204 status
		return { success: true };
	},

	/**
	 * Update existing account
	 */
	async update(id: number, account: Account): Promise<{ success: boolean }> {
		await api.put(`accounts/${id}`, account);
		// Update endpoints return 204 No Content
		return { success: true };
	},

	/**
	 * Delete account
	 */
	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`accounts/${id}`);
		// Delete endpoints return 204 No Content
		return { success: true };
	}
};
