import { describe, it, expect } from 'vitest';
import { storage } from '../storage';

describe('Storage Utility', () => {
	it('should have get method', () => {
		expect(typeof storage.get).toBe('function');
	});

	it('should have set method', () => {
		expect(typeof storage.set).toBe('function');
	});

	it('should have remove method', () => {
		expect(typeof storage.remove).toBe('function');
	});

	it('should have clear method', () => {
		expect(typeof storage.clear).toBe('function');
	});
});
