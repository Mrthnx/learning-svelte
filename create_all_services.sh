#!/bin/bash

# System Service
cat > src/lib/services/system.service.ts << 'EOF'
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
EOF

# Asset Service (Mawoi)
cat > src/lib/services/asset.service.ts << 'EOF'
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

		const url = createApiUrl('mawois', page, pageSize, filters);
		const response: ApiResponse<PaginateData<Asset>> = await api.getLoader(url);

		return {
			rows: (response.data.records || []).map(normalizeAsset),
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<Asset> {
		const response: ApiResponse<Asset> = await api.get(`mawois/${id}`);
		return normalizeAsset(response.data);
	},

	async create(asset: Omit<Asset, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...asset
		};
		await api.post('mawois', data);
		return { success: true };
	},

	async update(id: number, asset: Asset): Promise<{ success: boolean }> {
		await api.put(`mawois/${id}`, asset);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`mawois/${id}`);
		return { success: true };
	}
};
EOF

# Component Service
cat > src/lib/services/component.service.ts << 'EOF'
import { api } from './api';
import { createApiUrl } from '../shared';

export interface Component {
	id?: number | null;
	code?: string;
	description?: string;
	order?: number;
	image?: string;
	mawoi?: {
		id?: number;
		code?: string;
		description?: string;
	};
	componentType?: {
		id?: number;
		code?: string;
		description?: string;
		image?: string;
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

export const componentService = {
	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<Component>> {
		const { page = 1, pageSize = 10, filters = {} } = params;

		const url = createApiUrl('components', page, pageSize, filters);
		const response: ApiResponse<PaginateData<Component>> = await api.getLoader(url);

		return {
			rows: response.data.records || [],
			page,
			size: pageSize,
			total: response.data.total || 0
		};
	},

	async getById(id: number): Promise<Component> {
		const response: ApiResponse<Component> = await api.get(`components/${id}`);
		return response.data;
	},

	async create(component: Omit<Component, 'id'>): Promise<{ success: boolean }> {
		const data = {
			id: null,
			...component
		};
		await api.post('components', data);
		return { success: true };
	},

	async update(id: number, component: Component): Promise<{ success: boolean }> {
		await api.put(`components/${id}`, component);
		return { success: true };
	},

	async delete(id: number): Promise<{ success: boolean }> {
		await api.del(`components/${id}`);
		return { success: true };
	}
};
EOF

# User Service
cat > src/lib/services/user.service.ts << 'EOF'
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
	role?: {
		id?: number;
		code?: string;
		description?: string;
	};
	plants?: Array<{
		id?: number;
		code?: string;
		description?: string;
	}>;
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
EOF

echo "✅ Todos los servicios han sido creados correctamente"