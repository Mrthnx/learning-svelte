import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS, buildEndpoint } from '../api-endpoints';

describe('API Endpoints', () => {
it('should have USERS endpoint', () => {
expect(API_ENDPOINTS.USERS).toBe('users');
});

it('should build endpoint without ID', () => {
const endpoint = buildEndpoint('users');
expect(endpoint).toBe('users');
});

it('should build endpoint with ID', () => {
const endpoint = buildEndpoint('users', 123);
expect(endpoint).toBe('users/123');
});
});
