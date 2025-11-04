export interface User {
	id?: number | null;
	code?: string;
	email?: string;
	password?: string;
	name?: string;
	country?: number;
	city?: string;
	province?: string;
	address?: string;
	zip?: string;
	phone?: string;
	countryPhoneCode?: string;
	countryCode?: string;
	phoneConfirmed?: boolean;
	image?: string | null;
	passwordValidate?: boolean;
	twoFactorAuth?: boolean;
	allowAlarmsSentSms?: boolean;
	allowAlarmsSentEmail?: boolean;
	allowCommentAlarmsSentEmail?: boolean;
	allowCommentAlarmsSentSms?: boolean;
	languagePreference?: string;
	description?: string;
	isBlocked?: boolean;
	imageCompany?: string;
	nameCompany?: string;
	addressCompany?: string;
	footerCompany?: string;
	company?: number;
	role?: {
		id?: number;
		code?: string;
		description?: string;
		level?: number;
		name?: string;
	};
	account?: {
		id?: number;
		code?: string;
		description?: string;
	};
	plant?: {
		id?: number;
		code?: string;
		description?: string;
	};
	area?: {
		id?: number;
		code?: string;
		description?: string;
	};
	system?: {
		id?: number;
		code?: string;
		description?: string;
	};
}

export interface Plant {
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
	account?: {
		id?: number;
		code?: string;
		description?: string;
	};
}

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

export interface ComponentType {
	id?: number;
	code?: string;
	description?: string;
	image?: string;
}

export interface Role {
	id?: number | null;
	code?: string;
	description?: string;
	name?: string;
	level?: number;
}

export interface RolePermission {
	id: number;
	label?: string;
	permission?: string;
	checked?: boolean;
}

export interface PlantFailure {
	id: number | null;
	plant?: Plant;
	failureMode?: ComponentFailureMode;
}

export interface ComponentFailureMode {
	id: number | null;
	code?: string;
	description?: string;
	failureGroup?: ComponentFailureGroup;
}

export interface ComponentFailureGroup {
	id: number | null;
	code?: string;
	description?: string;
}

export interface PlantLubricant {
	id: number | null;
	lubricant?: Lubricant;
	plant?: Plant;
	excelData?: ExcelRow[];
}

export interface Lubricant {
	id: number | null;
	code?: string;
	description?: string;
	text?: string;
	link?: string;
	pdfUrl?: string;
}

export interface ExcelRow {
	id?: string;
	date: string;
	details: string;
}

export interface MenuItem {
	label: string;
	uri?: string;
	menus?: SubMenuItem[];
}

export interface SubMenuItem {
	label: string;
	uri: string;
	icon?: string;
}
