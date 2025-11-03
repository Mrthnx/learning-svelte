import { api } from './api';
import { createApiUrl, normalizeCoordinate } from '../shared';

export interface Area {
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
	plant?: {
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

function normalizeArea(area: Area): Area {
	return {
		...area,
		latitude: normalizeCoordinate(area.latitude),
		longitude: normalizeCoordinate(area.longitude)
	};
}
			...filters
		});

		const response = await api.get(`${this.basePath}?${queryParams}`);
		return response.data || { rows: [], page: 1, size: pageSize, total: 0 };
	}

	async getById(id: number): Promise<Area> {
		const response = await api.get(`${this.basePath}/${id}`);
		return response.data;
	}

	async create(area: Area): Promise<Area> {
		const response = await api.postLoader(this.basePath, area);
		return response.data;
	}

	async update(id: number, area: Area): Promise<Area> {
		const response = await api.putLoader(`${this.basePath}/${id}`, area);
		return response.data;
	}

	async delete(id: number): Promise<void> {
		await api.delLoader(`${this.basePath}/${id}`);
	}
}

export const areaService = new AreaService();
