import { describe, it, expect } from 'vitest';
import { logger } from '../logger';

describe('Logger Utility', () => {
it('should have log method', () => {
expect(typeof logger.log).toBe('function');
});

it('should have error method', () => {
expect(typeof logger.error).toBe('function');
});

it('should not throw when called', () => {
expect(() => logger.log('test')).not.toThrow();
expect(() => logger.error('error')).not.toThrow();
});
});
