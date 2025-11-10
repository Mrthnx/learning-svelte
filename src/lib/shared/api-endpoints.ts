/**
 * API Endpoints Constants
 * Centralized location for all API endpoint paths
 */
export const API_ENDPOINTS = {
	// Auth
	AUTH: 'auth',
	LOGIN: 'auth/login',
	LOGOUT: 'auth/logout',

	// Users
	USERS: 'users',

	// Accounts
	ACCOUNTS: 'accounts',

	// Plants
	PLANTS: 'plants',

	// Areas
	AREAS: 'areas',

	// Systems
	SYSTEMS: 'systems',

	// Assets
	ASSETS: 'assets',

	// Components
	COMPONENTS: 'component',

	// Plant Failures
	PLANT_FAILURES: 'plant-failures',

	// Plant Lubricants
	PLANT_LUBRICANTS: 'plant-lubricants',

	// Roles
	ROLES: 'roles'
} as const;

/**
 * Helper to build endpoint with ID
 */
export function buildEndpoint(base: string, id?: number | string): string {
	return id !== undefined ? `${base}/${id}` : base;
}
