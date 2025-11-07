import { getLoader } from '$lib/services/api';

export interface AssetFilter {
	code?: string;
	description?: string;
	componentCode?: string;
	componentDescription?: string;
	account?: { id?: number };
	plant?: { id?: number };
	area?: { id?: number };
	system?: { id?: number };
}

export const getAssets = async (page: number, pageSize: number, filters: AssetFilter) => {
	const filterParams = new URLSearchParams({
		page: page.toString(),
		pageSize: pageSize.toString(),
		'filters.code': filters.code || '',
		'filters.description': filters.description || '',
		'filters.componentCode': filters.componentCode || '',
		'filters.componentDescription': filters.componentDescription || '',
		'filters.account.id': filters.account?.id?.toString() || '',
		'filters.plant.id': filters.plant?.id?.toString() || '',
		'filters.area.id': filters.area?.id?.toString() || '',
		'filters.system.id': filters.system?.id?.toString() || '',
		'filters.includeComponent': 'true'
	});

	const response = await getLoader(`assets?${filterParams.toString()}`);
	return response.data;
};

