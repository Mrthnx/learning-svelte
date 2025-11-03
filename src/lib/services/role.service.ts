import { api } from './api';
import { createApiUrl } from '../shared';
import type { PaginateResponse, PaginateRequest, ApiResponse, PaginateData } from './account.service';

export interface RolePermission {
	id: number;
	label?: string;
	permission?: string;
	checked?: boolean;
}

export interface Role {
	id?: number | null;
	code?: string;
	description?: string;
	permissions?: number[];
}

export interface RoleWithPermissions extends Role {
	permissions?: RolePermission[];
}

export const roleService = {
	/**
	 * Get all roles with pagination
	 */
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Role>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('roles', page, pageSize, filters);

		const response: ApiResponse<PaginateData<Role>> = await api.getLoader(url);

		return {
			rows: response.data.records || [],
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	/**
	 * Get role by ID
	 */
	async getById(id: number): Promise<Role> {
		const response: ApiResponse<Role> = await api.get(`roles/${id}`);
		return response.data;
	},

	/**
	 * Create new role
	 */
	async create(role: Omit<Role, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...role
		};
		await api.post('roles', data);
		return { success: true };
	},

	/**
	 * Update existing role
	 */
	async update(id: number, role: Role): Promise<{ success: boolean }> {
		await api.put(`roles/${id}`, role);
		return { success: true };
	},

	/**
	 * Delete role
	 */
	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`roles/${id}`);
		return { success: true };
	},

	/**
	 * Get available permissions
	 */
	async getPermissions(): Promise<RolePermission[]> {
		const response: ApiResponse<RolePermission[]> = await api.get('roles/permissions');
		return response.data;
	}
};
