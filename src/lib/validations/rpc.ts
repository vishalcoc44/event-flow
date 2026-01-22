import { z } from 'zod';

/**
 * Validation schema for create_organization_event RPC
 */
export const createOrganizationEventSchema = z.object({
  p_title: z.string().min(1, 'Title is required').max(255),
  p_description: z.string().min(1, 'Description is required'),
  p_category_id: z.string().uuid().nullable(),
  p_location: z.string().max(255).nullable(),
  p_price: z.number().min(0, 'Price cannot be negative'),
  p_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  p_time: z.string(),
  p_image_url: z.string().nullable(),
  p_organization_id: z.string().uuid(),
  p_created_by: z.string().uuid(),
});

/**
 * Validation schema for create_event_safely RPC (Supports tags, venue, max_attendees)
 */
export const createEventSafelySchema = z.object({
  p_title: z.string().min(1, 'Title is required'),
  p_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  p_time: z.string(),
  p_created_by: z.string().uuid(),
  p_description: z.string().nullable().optional(),
  p_category_id: z.string().uuid().nullable().optional(),
  p_location: z.string().nullable().optional(),
  p_price: z.number().min(0).nullable().optional(),
  p_image_url: z.string().nullable().optional(),
  p_is_public: z.boolean().nullable().optional(),
  p_requires_approval: z.boolean().nullable().optional(),
  p_event_space_id: z.string().uuid().nullable().optional(),
  p_organization_id: z.string().uuid().nullable().optional(),
  p_max_attendees: z.number().int().min(0).nullable().optional(),
  p_venue_id: z.string().uuid().nullable().optional(),
  p_tags: z.array(z.string()).nullable().optional(),
});

/**
 * Validation schema for delete_event_space RPC
 */
export const deleteEventSpaceSchema = z.object({
  p_space_id: z.string().uuid(),
  p_user_id: z.string().uuid(),
});

/**
 * Validation schema for cancel_booking_admin RPC
 */
export const cancelBookingAdminSchema = z.object({
  booking_id: z.string().uuid(),
});

export type CreateOrganizationEventInput = z.infer<typeof createOrganizationEventSchema>;
export type CreateEventSafelyInput = z.infer<typeof createEventSafelySchema>;
export type DeleteEventSpaceInput = z.infer<typeof deleteEventSpaceSchema>;
export type CancelBookingAdminInput = z.infer<typeof cancelBookingAdminSchema>;