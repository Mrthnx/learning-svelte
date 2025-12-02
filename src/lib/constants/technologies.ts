export type TechnologyKey =
	| 'vib'
	| 'trib'
	| 'mce'
	| 'irrot'
	| 'irelec'
	| 'irstruc'
	| 'uerot'
	| 'ueelec'
	| 'ueleak'
	| 'bal'
	| 'algn';

export interface TechnologyConfig {
	key: TechnologyKey;
	label: string;
	tooltip: string;
	dateField: string;
	alarmField: string;
	hasField: string;
}

export const TECHNOLOGIES: Record<TechnologyKey, TechnologyConfig> = {
	vib: {
		key: 'vib',
		label: 'Vib',
		tooltip: 'Vibration Analysis',
		dateField: 'vibdate',
		alarmField: 'vibalarm',
		hasField: 'vib'
	},
	trib: {
		key: 'trib',
		label: 'Trib',
		tooltip: 'Tribology Analysis',
		dateField: 'tribdate',
		alarmField: 'tribalarm',
		hasField: 'trib'
	},
	mce: {
		key: 'mce',
		label: 'MCE',
		tooltip: 'Motor Current Analysis',
		dateField: 'mcedate',
		alarmField: 'mcealarm',
		hasField: 'mce'
	},
	irrot: {
		key: 'irrot',
		label: 'IRr',
		tooltip: 'IR Rotational',
		dateField: 'irrotdate',
		alarmField: 'irrotalarm',
		hasField: 'irrot'
	},
	irelec: {
		key: 'irelec',
		label: 'IRe',
		tooltip: 'IR Electrical',
		dateField: 'irelecdate',
		alarmField: 'irelecalarm',
		hasField: 'irelec'
	},
	irstruc: {
		key: 'irstruc',
		label: 'IRs',
		tooltip: 'IR Structural',
		dateField: 'irstrucdate',
		alarmField: 'irstrucalarm',
		hasField: 'irstruc'
	},
	uerot: {
		key: 'uerot',
		label: 'UEr',
		tooltip: 'UE Rotational',
		dateField: 'uerotdate',
		alarmField: 'uerotalarm',
		hasField: 'uerot'
	},
	ueelec: {
		key: 'ueelec',
		label: 'UEe',
		tooltip: 'UE Electrical',
		dateField: 'ueelecdate',
		alarmField: 'ueelecalarm',
		hasField: 'ueelec'
	},
	ueleak: {
		key: 'ueleak',
		label: 'UEL',
		tooltip: 'UE Leak Detection',
		dateField: 'ueleakdate',
		alarmField: 'ueleakalarm',
		hasField: 'ueleak'
	},
	bal: {
		key: 'bal',
		label: 'Bal',
		tooltip: 'Balance Analysis',
		dateField: 'baldate',
		alarmField: 'balalarm',
		hasField: 'bal'
	},
	algn: {
		key: 'algn',
		label: 'Algn',
		tooltip: 'Alignment Analysis',
		dateField: 'algndate',
		alarmField: 'algnalarm',
		hasField: 'algn'
	}
} as const;

export const TECHNOLOGY_LIST = Object.values(TECHNOLOGIES);

export const isTechnologyField = (field: string): field is TechnologyKey => {
	return field in TECHNOLOGIES;
};
