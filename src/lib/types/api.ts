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

export interface PaginateRequest {
	page?: number;
	pageSize?: number;
	filters?: Record<string, any>;
}

export interface FilterParams {
	code?: string;
	description?: string;
	account?: { id: number };
	plant?: { id: number };
	area?: { id: number };
	system?: { id: number };
	asset?: { id: number };
}
