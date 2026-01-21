/**
 * Zod Validation Schemas
 * 
 * These schemas validate input data BEFORE it reaches Supabase,
 * preventing constraint violations and providing user-friendly errors.
 */

import { z } from 'zod';

// ============================================================
// ENUMS (matching database CHECK constraints)
// ============================================================

export const UserRoleSchema = z.enum(['ADMIN', 'USER']);
export const OrgRoleSchema = z.enum(['OWNER', 'ADMIN', 'USER']);
export const SubscriptionPlanSchema = z.enum(['FREE', 'BASIC', 'PRO', 'ENTERPRISE']);
export const SubscriptionStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED']);
export const BookingStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']);
export const AdminRequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const ExperienceLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);
export const FollowTargetTypeSchema = z.enum(['USER', 'EVENT', 'CATEGORY']);
export const ReportReasonSchema = z.enum(['SPAM', 'INAPPROPRIATE', 'FAKE', 'OFFENSIVE', 'OTHER']);
export const ReportStatusSchema = z.enum(['PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED']);
export const InvitationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED']);

// ============================================================
// COMMON VALIDATORS
// ============================================================

/** UUID validation */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/** Email validation */
export const emailSchema = z.string()
	.email('Invalid email address')
	.max(255, 'Email must be less than 255 characters');

/** Password validation - Supabase minimum is 6 characters */
export const passwordSchema = z.string()
	.min(6, 'Password must be at least 6 characters')
	.max(72, 'Password must be less than 72 characters');

/** Non-empty string */
export const requiredStringSchema = z.string()
	.min(1, 'This field is required')
	.max(255, 'Must be less than 255 characters');

/** Optional string with max length */
export const optionalStringSchema = z.string()
	.max(255, 'Must be less than 255 characters')
	.optional()
	.or(z.literal(''));

/** Text field (longer content) */
export const textSchema = z.string()
	.max(10000, 'Must be less than 10,000 characters')
	.optional()
	.or(z.literal(''));

/** URL validation */
export const urlSchema = z.string()
	.url('Invalid URL format')
	.optional()
	.or(z.literal(''));

/** Phone number - basic validation */
export const phoneSchema = z.string()
	.regex(/^[\d\s\-+()]*$/, 'Invalid phone number format')
	.max(20, 'Phone number too long')
	.optional()
	.or(z.literal(''));

/** Positive number */
export const positiveNumberSchema = z.number()
	.positive('Must be a positive number')
	.optional();

/** Rating 1-5 (matching reviews_rating_check constraint) */
export const ratingSchema = z.number()
	.int('Rating must be a whole number')
	.min(1, 'Rating must be at least 1')
	.max(5, 'Rating must be at most 5');

/** Date string in YYYY-MM-DD format */
export const dateSchema = z.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/** Time string in HH:MM format */
export const timeSchema = z.string()
	.regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM or HH:MM:SS format');

/** Slug validation (URL-safe string) */
export const slugSchema = z.string()
	.min(1, 'Slug is required')
	.max(100, 'Slug must be less than 100 characters')
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

// ============================================================
// EVENT SCHEMAS
// ============================================================

/** Schema for creating an event */
export const CreateEventSchema = z.object({
	title: requiredStringSchema.refine(
		(val) => val.trim().length >= 3,
		'Title must be at least 3 characters'
	),
	description: textSchema,
	date: dateSchema,
	time: timeSchema,
	location: optionalStringSchema,
	price: z.number().min(0, 'Price cannot be negative').optional().nullable(),
	category_id: uuidSchema.optional().nullable(),
	event_space_id: uuidSchema.optional().nullable(),
	organization_id: uuidSchema.optional().nullable(),
	is_public: z.boolean().default(true),
	requires_approval: z.boolean().default(false),
});

/** Schema for updating an event */
export const UpdateEventSchema = CreateEventSchema.partial().extend({
	image_url: urlSchema.nullable(),
});

// ============================================================
// USER & AUTH SCHEMAS
// ============================================================

/** Schema for user login */
export const LoginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, 'Password is required'),
});

/** Schema for user registration */
export const RegisterSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	confirmPassword: z.string().min(1, 'Please confirm your password'),
	username: optionalStringSchema,
	firstName: optionalStringSchema,
	lastName: optionalStringSchema,
	contactNumber: phoneSchema,
	city: optionalStringSchema,
	pincode: z.string().regex(/^\d{0,10}$/, 'Invalid pincode').optional().or(z.literal('')),
	streetAddress: textSchema,
	role: UserRoleSchema.default('USER'),
	isAdminRequest: z.boolean().default(false),
}).refine(
	(data) => data.password === data.confirmPassword,
	{
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	}
);

// ============================================================
// BOOKING SCHEMAS
// ============================================================

/** Schema for creating a booking */
export const CreateBookingSchema = z.object({
	event_id: uuidSchema,
});

// ============================================================
// REVIEW SCHEMAS
// ============================================================

/** Schema for creating a review */
export const CreateReviewSchema = z.object({
	event_id: uuidSchema,
	rating: ratingSchema,
	title: z.string().max(200, 'Title must be less than 200 characters').optional(),
	comment: textSchema,
});

/** Schema for updating a review */
export const UpdateReviewSchema = z.object({
	rating: ratingSchema.optional(),
	title: z.string().max(200).optional(),
	comment: textSchema,
});

/** Schema for reporting a review */
export const ReportReviewSchema = z.object({
	review_id: uuidSchema,
	reason: ReportReasonSchema,
	description: textSchema,
});

// ============================================================
// ADMIN REQUEST SCHEMAS
// ============================================================

/** Schema for creating an admin request */
export const CreateAdminRequestSchema = z.object({
	reason: requiredStringSchema.refine(
		(val) => val.trim().length >= 10,
		'Please provide at least 10 characters explaining why you need admin access'
	),
	first_name: optionalStringSchema,
	last_name: optionalStringSchema,
	contact_number: phoneSchema,
	organization: optionalStringSchema,
	experience_level: ExperienceLevelSchema.optional(),
	intended_use: textSchema,
	organization_id: uuidSchema.optional().nullable(),
	requested_role: z.union([UserRoleSchema, OrgRoleSchema]).default('ADMIN'),
});

// ============================================================
// ORGANIZATION SCHEMAS
// ============================================================

/** Schema for creating an organization */
export const CreateOrganizationSchema = z.object({
	name: requiredStringSchema.refine(
		(val) => val.trim().length >= 2,
		'Organization name must be at least 2 characters'
	),
	slug: slugSchema.optional(),
	description: requiredStringSchema.refine(
		(val) => val.trim().length >= 10,
		'Please provide a description of at least 10 characters'
	),
	logo_url: urlSchema.optional().or(z.literal('')),
	website_url: urlSchema,
	contact_email: emailSchema.optional().or(z.literal('')),
	contact_phone: phoneSchema,
	address: textSchema,
	city: optionalStringSchema,
	state: optionalStringSchema,
	country: optionalStringSchema,
	postal_code: optionalStringSchema,
	is_public: z.boolean().default(true),
	allow_public_events: z.boolean().default(true),
	require_approval_for_events: z.boolean().default(false),
	allow_user_registration: z.boolean().default(true),
});

/** Schema for updating an organization */
export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

/** Schema for creating an event space */
export const CreateEventSpaceSchema = z.object({
	name: requiredStringSchema,
	description: textSchema,
	slug: slugSchema,
	organization_id: uuidSchema,
	is_public: z.boolean().default(true),
	allow_public_events: z.boolean().default(true),
	require_approval_for_events: z.boolean().default(false),
});

/** Schema for inviting a member */
export const InviteMemberSchema = z.object({
	email: emailSchema,
	role: z.enum(['ADMIN', 'USER']),
	message: textSchema,
});

// ============================================================
// NOTIFICATION SCHEMAS
// ============================================================

/** Schema for notification preferences */
export const UpdateNotificationPreferencesSchema = z.object({
	email_notifications: z.boolean().optional(),
	push_notifications: z.boolean().optional(),
	event_reminders: z.boolean().optional(),
	booking_reminders: z.boolean().optional(),
	follow_updates: z.boolean().optional(),
	category_updates: z.boolean().optional(),
	reminder_hours: z.number().int().min(1).max(168).optional(), // 1 hour to 7 days
});

// ============================================================
// CATEGORY SCHEMAS
// ============================================================

/** Schema for creating a category */
export const CreateCategorySchema = z.object({
	name: requiredStringSchema.refine(
		(val) => val.trim().length >= 2,
		'Category name must be at least 2 characters'
	),
	description: textSchema,
});

/** Schema for updating a category */
export const UpdateCategorySchema = CreateCategorySchema.partial();

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Validate data against a schema and return typed result
 */
export function validateData<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, errors: result.error };
}

/**
 * Get user-friendly error messages from Zod errors
 */
export function getErrorMessages(error: z.ZodError): string[] {
	return error.errors.map((err) => {
		const path = err.path.join('.');
		return path ? `${path}: ${err.message}` : err.message;
	});
}

/**
 * Get first error message from Zod errors
 */
export function getFirstError(error: z.ZodError): string {
	const firstError = error.errors[0];
	if (!firstError) return 'Validation error';
	const path = firstError.path.join('.');
	return path ? `${path}: ${firstError.message}` : firstError.message;
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type CreateAdminRequestInput = z.infer<typeof CreateAdminRequestSchema>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type CreateEventSpaceInput = z.infer<typeof CreateEventSpaceSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesSchema>;
