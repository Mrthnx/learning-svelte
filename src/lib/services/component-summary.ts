import { postLoader } from '$lib/services/api';

export interface ComponentSummaryData {
	id: number;
	code: string;
	name: string;
	description: string;
	vib?: number | null;
	trib?: number | null;
	irrot?: number | null;
	irelec?: number | null;
	irstruc?: number | null;
	uerot?: number | null;
	ueelec?: number | null;
	ueleak?: number | null;
	mce?: number | null;
	bal?: number | null;
	algn?: number | null;
	vibdate?: string | null;
	tribdate?: string | null;
	mcedate?: string | null;
	irrotdate?: string | null;
	irelecdate?: string | null;
	irstrucdate?: string | null;
	uerotdate?: string | null;
	ueelecdate?: string | null;
	ueleakdate?: string | null;
	algndate?: string | null;
	baldate?: string | null;
	vibface?: string | null;
	existSummary?: boolean;
}

export interface ComponentSummaryResponse {
	trackingId: string;
	data: ComponentSummaryData[];
}

export const getComponentsWithSummary = async (
	componentIds: number[]
): Promise<ComponentSummaryResponse> => {
	const response = await postLoader('component/get-with-flag-exist-summary', {
		componentIds
	});
	return response;
};
