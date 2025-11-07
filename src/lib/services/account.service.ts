import { api } from './api';
import { createApiUrl, normalizeCoordinate, API_ENDPOINTS, buildEndpoint, PAGINATION } from '../shared';
import type {
	Account,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

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

/**
 * Get all accounts with pagination
 */
export async function getAllAccounts(
	params: PaginateRequest = {}
): Promise<PaginateResponse<Account>> {
	const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE, filters = {} } = params;

	const url = createApiUrl(API_ENDPOINTS.ACCOUNTS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<Account>> = await api.getLoader(url);

	return {
		rows: (response.data.records || []).map(normalizeAccount),
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

/**
 * Get account by ID
 */
export async function getAccountById(id: number): Promise<Account> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ACCOUNTS, id);
	const response: ApiResponse<Account> = await api.get(endpoint);
	return normalizeAccount(response.data);
}

/**
 * Create new account
 */
export async function createAccount(account: Omit<Account, 'id'>): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...account
	};
	await api.post(API_ENDPOINTS.ACCOUNTS, data);
	return { success: true };
}

/**
 * Update existing account
 */
export async function updateAccount(id: number, account: Account): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ACCOUNTS, id);
	await api.put(endpoint, account);
	return { success: true };
}

/**
 * Delete account
 */
export async function deleteAccount(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ACCOUNTS, id);
	await api.del(endpoint);
	return { success: true };
}

// Legacy export for backward compatibility
export const accountService = {
	getAll: getAllAccounts,
	getById: getAccountById,
	create: createAccount,
	update: updateAccount,
	delete: deleteAccount
};
