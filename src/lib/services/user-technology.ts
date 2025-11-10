import { postLoader, getLoader } from '$lib/services/api';

export interface UserTechnologyPreferences {
	component: boolean;
	type: boolean;
	vib: boolean;
	trib: boolean;
	mce: boolean;
	irrot: boolean;
	irelec: boolean;
	irstruc: boolean;
	uerot: boolean;
	ueelec: boolean;
	ueleak: boolean;
	bal: boolean;
	algn: boolean;
	id: number;
}

export const saveUserTechnologyPreferences = async (
	userId: number,
	preferences: Omit<UserTechnologyPreferences, 'id'>
): Promise<void> => {
	const body = {
		...preferences,
		id: userId
	};

	await postLoader(`users/save-technology/${userId}`, body);
};

export const getUserTechnologyPreferences = async (
	userId: number
): Promise<UserTechnologyPreferences> => {
	const response = await getLoader(`users/get-technology/${userId}`);
	return response.data;
};
