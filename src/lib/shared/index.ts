import { Md5 } from 'ts-md5';

export const encryptText = (text: string): string => {
	return text != null ? String(new Md5().appendStr(text).end(false)) : text;
};

export function processLabelToIcon(icon: string, label: string) {
	const iconOrLabel = !icon.includes('.svg') ? label : icon.replace('.svg', '');
	return iconOrLabel.toLowerCase().replace(/ /g, '-').replace('_', '-');
}

export function createApiUrl(
	basePath: string,
	page: number,
	pageSize: number,
	filters: Record<string, string | number | undefined | null | Record<string, any>> = {}
): string {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize)
	});

	for (const key in filters) {
		const value = filters[key];
		if (value !== null && value !== undefined && value !== '') {
			if (typeof value === 'object' && value !== null) {
				for (const subKey in value) {
					const subValue = value[subKey];
					if (subValue !== null && subValue !== undefined && subValue !== '') {
						params.append(`filters.${key}.${subKey}`, String(subValue));
					}
				}
			} else {
				params.append(`filters.${key}`, String(value));
			}
		}
	}

	return `${basePath}?${params.toString()}`;
}

export function normalizeCoordinate(value: number | string | null | undefined): number | undefined {
	if (value === null || value === undefined) {
		return undefined;
	}
	return typeof value === 'string' ? parseFloat(value) : value;
}
