import { api } from './api';
import { createApiUrl, normalizeCoordinate } from '../shared';

export interface Asset {
	id?: number | null;
	code?: string;
	description?: string;
	order?: number;
	latitude?: number;
	longitude?: number;
	image?: string;
	rpm?: number;
	system?: {
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

function normalizeAsset(asset: Asset): Asset {
	return {
		...asset,
		latitude: normalizeCoordinate(asset.latitude),
		longitude: normalizeCoordinate(asset.longitude)
	};
}

export const assetService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Asset>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('assets', page, pageSize, filters);
		const response: ApiResponse<PaginateData<Asset>> = await api.getLoader(url);

		return {
			rows: (response.data.records || []).map(normalizeAsset),
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<Asset> {
		const response: ApiResponse<Asset> = await api.get(`assets/${id}`);
		return normalizeAsset(response.data);
	},

	async create(asset: Omit<Asset, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...asset
		};
		await api.post('assets', data);
		return { success: true };
	},

	async update(id: number, asset: Asset): Promise<{ success: boolean }> {
		await api.put(`assets/${id}`, asset);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`assets/${id}`);
		return { success: true };
	}
};
