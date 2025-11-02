/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
	if (!email?.trim()) return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Phone validation (international format)
 */
export function isValidPhone(phone: string): boolean {
	if (!phone?.trim()) return false;
	const phoneRegex = /^[\d\s\-+()]+$/;
	return phoneRegex.test(phone);
}

/**
 * Latitude validation (-90 to 90)
 */
export function isValidLatitude(latitude: number | undefined): boolean {
	if (latitude === undefined || latitude === null) return true; // Optional
	return latitude >= -90 && latitude <= 90;
}

/**
 * Longitude validation (-180 to 180)
 */
export function isValidLongitude(longitude: number | undefined): boolean {
	if (longitude === undefined || longitude === null) return true; // Optional
	return longitude >= -180 && longitude <= 180;
}

/**
 * Required field validation
 */
export function isRequired(value: string | undefined | null): boolean {
	return !!value?.trim();
}

/**
 * Validation error messages
 */
export const validationMessages = {
	required: (field: string) => `${field} is required`,
	invalidEmail: 'Invalid email format',
	invalidPhone: 'Invalid phone format',
	invalidLatitude: 'Latitude must be between -90 and 90',
	invalidLongitude: 'Longitude must be between -180 and 180'
};
