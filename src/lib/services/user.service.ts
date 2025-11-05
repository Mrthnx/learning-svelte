import { api } from './api';
import { createApiUrl, API_ENDPOINTS, buildEndpoint, PAGINATION } from '../shared';
import type {
	User,
	PaginateRequest,
	PaginateResponse,
	ApiResponse,
	PaginateData
} from '$lib/types';

export async function getAllUsers(params: PaginateRequest = {}): Promise<PaginateResponse<User>> {
	// Clean Code: Use named constants instead of magic numbers
	const { 
		page = PAGINATION.DEFAULT_PAGE, 
		pageSize = PAGINATION.DEFAULT_PAGE_SIZE, 
		filters = {} 
	} = params;

	const url = createApiUrl(API_ENDPOINTS.USERS, page, pageSize, filters);
	const response: ApiResponse<PaginateData<User>> = await api.getLoader(url);

	return {
		rows: response.data.records || [],
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getUserById(id: number): Promise<User> {
	const endpoint = buildEndpoint(API_ENDPOINTS.USERS, id);
	const response: ApiResponse<User> = await api.get(endpoint);
	return response.data;
}

export async function createUser(user: Omit<User, 'id'>): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...user
	};
	await api.post(API_ENDPOINTS.USERS, data);
	return { success: true };
}

export async function updateUser(id: number, user: User): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.USERS, id);
	await api.put(endpoint, user);
	return { success: true };
}

export async function deleteUser(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.USERS, id);
	await api.del(endpoint);
	return { success: true };
}

export const userService = {
	getAll: getAllUsers,
	getById: getUserById,
	create: createUser,
	update: updateUser,
	delete: deleteUser
};
