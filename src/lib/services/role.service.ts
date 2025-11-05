import { api } from './api';
import { createApiUrl, API_ENDPOINTS, buildEndpoint, PAGINATION } from '../shared';
import type {
	Role,
	RolePermission,
	PaginateResponse,
	PaginateRequest,
	ApiResponse,
	PaginateData
} from '$lib/types';

export async function getAllRoles(params: PaginateRequest = {}): Promise<PaginateResponse<Role>> {
	const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE, filters = {} } = params;

	const url = createApiUrl(API_ENDPOINTS.ROLES, page, pageSize, filters);
	const response: ApiResponse<PaginateData<Role>> = await api.getLoader(url);

	return {
		rows: response.data.records || [],
		page,
		size: pageSize,
		total: response.data.total || 0
	};
}

export async function getRoleById(id: number): Promise<Role> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ROLES, id);
	const response: ApiResponse<Role> = await api.get(endpoint);
	return response.data;
}

export async function createRole(role: Omit<Role, 'id'>): Promise<{ success: boolean }> {
	const data = {
		id: null,
		...role
	};
	await api.post(API_ENDPOINTS.ROLES, data);
	return { success: true };
}

export async function updateRole(id: number, role: Role): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ROLES, id);
	await api.put(endpoint, role);
	return { success: true };
}

export async function deleteRole(id: number): Promise<{ success: boolean }> {
	const endpoint = buildEndpoint(API_ENDPOINTS.ROLES, id);
	await api.del(endpoint);
	return { success: true };
}

export async function getRolePermissions(): Promise<RolePermission[]> {
	const response: ApiResponse<RolePermission[]> = await api.get('roles/permissions');
	return response.data;
}

export const roleService = {
	getAll: getAllRoles,
	getById: getRoleById,
	create: createRole,
	update: updateRole,
	delete: deleteRole,
	getPermissions: getRolePermissions
};
