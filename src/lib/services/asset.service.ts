import { api } from './api';
import { createApiUrl, normalizeCoordinate, API_ENDPOINTS, buildEndpoint } from '../shared';
import type {
	Asset,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

function normalizeAsset(asset: Asset): Asset {
	return {
		...asset,
		latitude: normalizeCoordinate(asset.latitude),
		longitude: normalizeCoordinate(asset.longitude)
	};
}

export async function getAllAssets(params: PaginateRequest = {}): Promise<PaginateResponse<Asset>> {
	const { page = 1, pageSize = 10, filters = {} } = params;

	const url = createApiUrl(API_ENDPOINTS.ASSETS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<Asset>> = await api.getLoader(url);

	return {
		rows: (response.data.records || []).map(normalizeAsset),
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getAssetById(id: number): Promise<Asset> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ASSETS, id);
	const response: ApiResponse<Asset> = await api.get(endpoint);
	return normalizeAsset(response.data);
}

export async function createAsset(asset: Omit<Asset, 'id'>): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...asset
	};
	await api.post(API_ENDPOINTS.ASSETS, data);
	return { success: true };
}

export async function updateAsset(id: number, asset: Asset): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ASSETS, id);
	await api.put(endpoint, asset);
	return { success: true };
}

export async function deleteAsset(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ASSETS, id);
	await api.del(endpoint);
	return { success: true };
}

export const assetService = {
	getAll: getAllAssets,
	getById: getAssetById,
	create: createAsset,
	update: updateAsset,
	delete: deleteAsset
};
