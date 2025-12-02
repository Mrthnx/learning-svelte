import { TECHNOLOGIES, type TechnologyKey } from '$lib/constants/technologies';

export type SortField = TechnologyKey | 'asset' | 'type' | 'component';
export type SortOrder = 'asc' | 'desc' | 'none';

export function getAlarmPriority(alarm: any): number {
	const code = alarm?.color;
	if (!code) return 0;
	switch (String(code).toLowerCase()) {
		case 'red':
			return 3;
		case 'yellow':
			return 2;
		case 'green':
			return 1;
		default:
			return 0;
	}
}

export function getColorByAlarmCode(alarm: any): string {
	const code = alarm?.color;
	if (!code) return 'text-muted-foreground';
	switch (String(code).toLowerCase()) {
		case 'green':
			return 'text-green-600 font-semibold';
		case 'yellow':
			return 'text-yellow-600 font-semibold';
		case 'red':
			return 'text-red-600 font-semibold';
		default:
			return 'text-muted-foreground';
	}
}

export function formatDateStr(
	value?: string | null,
	hasSummary?: number | null,
	existSummary?: boolean
): string {
	if (!value) return '-';
	const d = new Date(value);
	const dateStr = isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
	return existSummary && hasSummary === 1 ? `${dateStr}*` : dateStr;
}

export function getSortValues(
	component: any,
	asset: any,
	sortField: SortField
): { aValue: any; bValue: any; aAlarmPriority: number; bAlarmPriority: number } {
	let aValue: any;
	let aAlarmPriority = 0;

	switch (sortField) {
		case 'asset':
			aValue = asset.code;
			break;
		case 'type':
			aValue = component.componentType?.code || '';
			break;
		case 'component':
			aValue = component.code;
			break;
		default:
			if (sortField in TECHNOLOGIES) {
				const tech = TECHNOLOGIES[sortField as TechnologyKey];
				aValue = new Date(component[tech.dateField] || 0);
				aAlarmPriority = getAlarmPriority(component[tech.alarmField]);
			} else {
				aValue = '';
			}
	}

	return { aValue, bValue: aValue, aAlarmPriority, bAlarmPriority: aAlarmPriority };
}

export function compareComponents(
	a: any,
	b: any,
	asset: any,
	sortField: SortField,
	sortOrder: SortOrder
): number {
	const aData = getSortValues(a, asset, sortField);
	const bData = getSortValues(b, asset, sortField);

	if (sortField in TECHNOLOGIES) {
		const dateComparison =
			sortOrder === 'desc'
				? bData.aValue.getTime() - aData.aValue.getTime()
				: aData.aValue.getTime() - bData.aValue.getTime();

		if (dateComparison === 0) {
			return sortOrder === 'desc'
				? bData.aAlarmPriority - aData.aAlarmPriority
				: aData.aAlarmPriority - bData.aAlarmPriority;
		}
		return dateComparison;
	} else {
		const comparison = String(aData.aValue).localeCompare(String(bData.aValue));
		return sortOrder === 'desc' ? -comparison : comparison;
	}
}
