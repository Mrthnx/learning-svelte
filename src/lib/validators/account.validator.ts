import { z } from 'zod';

/**
 * Account validation schema
 */
export const accountSchema = z.object({
	id: z.number().nullable().optional(),
	code: z.string().min(1, 'Code is required'),
	description: z.string().min(1, 'Description is required'),
	nameContactor: z.string().optional(),
	telephoneContactor: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
		.optional()
		.or(z.literal('')),
	mailContactor: z.string().email('Invalid email format').optional().or(z.literal('')),
	latitude: z
		.number()
		.min(-90, 'Latitude must be between -90 and 90')
		.max(90, 'Latitude must be between -90 and 90')
		.optional(),
	longitude: z
		.number()
		.min(-180, 'Longitude must be between -180 and 180')
		.max(180, 'Longitude must be between -180 and 180')
		.optional(),
	image: z.string().optional()
});

export type AccountFormData = z.infer<typeof accountSchema>;

/**
 * Partial schema for update operations
 */
export const accountUpdateSchema = accountSchema.partial().extend({
	id: z.number()
});
