/**
 * Database Types - Auto-generated from current_schema
 * 
 * These types directly mirror the database schema to ensure
 * frontend-backend alignment and type safety.
 */

// ============================================================
// ENUMS (matching DB CHECK constraints)
// ============================================================

/** User global role */
export type UserRole = 'ADMIN' | 'USER';

/** User role within an organization */
export type OrgRole = 'OWNER' | 'ADMIN' | 'USER';

/** Organization subscription plans */
export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

/** Subscription status */
export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';

/** Booking status */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

/** Admin request status */
export type AdminRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Refund status */
export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';

/** User badge types */
export type BadgeType = 'FREQUENT_FLYER' | 'EVENT_ENTHUSIAST' | 'VIP_MEMBER' | 'EARLY_ADOPTER' | 'TOP_REVIEWER';

/** Experience level for admin requests */
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

/** Notification types */
export type NotificationType =
	| 'BOOKING_CONFIRMATION'
	| 'BOOKING_CANCELLATION'
	| 'EVENT_REMINDER'
	| 'EVENT_UPDATE'
	| 'NEW_FOLLOWER'
	| 'ADMIN_REQUEST_STATUS'
	| 'ORGANIZATION_INVITATION'
	| 'GENERAL';

/** Follow target types */
export type FollowTargetType = 'USER' | 'EVENT' | 'CATEGORY';

/** Review report reasons */
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'FAKE' | 'OFFENSIVE' | 'OTHER';

/** Report status */
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED';

/** Organization invitation status */
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

/** Setting types */
export type SettingType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

// ============================================================
// CORE TABLES
// ============================================================

/** users table - id references auth.users(id) */
export interface User {
	id: string; // uuid, PK, NOT NULL
	email: string; // varchar, NOT NULL, UNIQUE
	username: string | null; // varchar
	first_name: string | null; // varchar
	last_name: string | null; // varchar
	contact_number: string | null; // varchar
	street_address: string | null; // text
	city: string | null; // varchar
	pincode: string | null; // varchar
	role: UserRole; // varchar, default 'USER'
	created_at: string; // timestamptz, default CURRENT_TIMESTAMP
	follower_count: number; // int, default 0
	organization_id: string | null; // uuid, FK -> organizations
	role_in_org: OrgRole | null; // varchar, default 'USER'
	is_org_admin: boolean; // boolean, default false
	joined_at: string | null; // timestamptz, default now()
}

/** organizations table */
export interface Organization {
	id: string; // uuid, PK, NOT NULL
	name: string; // varchar, NOT NULL
	slug: string; // varchar, NOT NULL, UNIQUE
	description: string | null; // text
	logo_url: string | null; // text
	website_url: string | null; // text
	contact_email: string | null; // varchar
	contact_phone: string | null; // varchar
	address: string | null; // text
	city: string | null; // varchar
	state: string | null; // varchar
	country: string | null; // varchar
	postal_code: string | null; // varchar
	subscription_plan: SubscriptionPlan; // varchar, default 'FREE'
	subscription_status: SubscriptionStatus; // varchar, default 'ACTIVE'
	subscription_start_date: string | null; // timestamptz
	subscription_end_date: string | null; // timestamptz
	max_events: number; // int, default 10
	max_users: number; // int, default 5
	max_storage_mb: number; // int, default 100
	current_events_count: number; // int, default 0
	current_users_count: number; // int, default 0
	current_storage_mb: number; // int, default 0
	is_public: boolean; // boolean, default true
	allow_public_events: boolean; // boolean, default true
	require_approval_for_events: boolean; // boolean, default false
	allow_user_registration: boolean; // boolean, default true
	created_by: string | null; // uuid, FK -> users
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** events table */
export interface Event {
	id: string; // uuid, PK, NOT NULL
	title: string; // varchar, NOT NULL
	description: string | null; // text
	date: string; // date, NOT NULL
	time: string; // time, NOT NULL
	location: string | null; // varchar
	price: number | null; // numeric
	image_url: string | null; // text
	category_id: string | null; // uuid, FK -> categories
	created_by: string | null; // uuid, FK -> users
	created_at: string; // timestamptz, default CURRENT_TIMESTAMP
	follower_count: number; // int, default 0
	organization_id: string | null; // uuid, FK -> organizations
	event_space_id: string | null; // uuid, FK -> event_spaces
	is_public: boolean; // boolean, default true
	requires_approval: boolean; // boolean, default false
	is_approved: boolean; // boolean, default true
	max_attendees: number | null; // int
	venue_id: string | null; // uuid, FK -> venues
	is_networking_enabled: boolean; // boolean, default false
}

/** Event with relations (for API responses) */
export interface EventWithRelations extends Event {
	categories: Category | null;
	created_by_user: Pick<User, 'id' | 'email' | 'first_name' | 'last_name' | 'role' | 'created_at' | 'follower_count'> | null;
}

/** categories table */
export interface Category {
	id: string; // uuid, PK, NOT NULL
	name: string; // varchar, NOT NULL
	description: string | null; // text
	created_at: string; // timestamptz, default CURRENT_TIMESTAMP
	follower_count: number; // int, default 0
}

/** bookings table */
export interface Booking {
	id: string; // uuid, PK, NOT NULL
	event_id: string | null; // uuid, FK -> events
	user_id: string | null; // uuid, FK -> users
	ticket_type_id: string | null; // uuid, FK -> ticket_types
	coupon_id: string | null; // uuid, FK -> coupons
	qr_code_token: string | null; // uuid, default gen_random_uuid()
	discount_amount: number; // numeric, default 0
	total_amount: number | null; // numeric
	booking_date: string; // timestamptz, default CURRENT_TIMESTAMP
	status: BookingStatus; // varchar, default 'PENDING'
	created_at: string; // timestamptz, default CURRENT_TIMESTAMP
	is_networking_enabled: boolean; // boolean, default false
}

/** coupons table */
export interface Coupon {
	id: string; // uuid, PK, NOT NULL
	code: string; // text, NOT NULL
	discount_type: 'PERCENTAGE' | 'FIXED'; // enum, NOT NULL
	discount_value: number; // numeric, NOT NULL
	organization_id: string | null; // uuid, FK -> organizations
	event_id: string | null; // uuid, FK -> events
	usage_limit: number | null; // int
	usage_count: number; // int, default 0
	valid_from: string | null; // timestamptz
	valid_until: string | null; // timestamptz
	is_active: boolean; // boolean, default true
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** Booking with relations */
export interface BookingWithRelations extends Booking {
	event: Event | null;
	user: Pick<User, 'id' | 'email' | 'first_name' | 'last_name' | 'role' | 'created_at' | 'follower_count'> | null;
}

/** refund_requests table */
export interface RefundRequest {
	id: string; // uuid, PK, NOT NULL
	booking_id: string; // uuid, NOT NULL, FK -> bookings
	reason: string; // text, NOT NULL
	status: RefundStatus; // varchar, default 'PENDING'
	admin_notes: string | null; // text
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** user_badges table */
export interface UserBadge {
	id: string; // uuid, PK, NOT NULL
	user_id: string; // uuid, NOT NULL, FK -> users
	badge_type: BadgeType; // enum, NOT NULL
	awarded_at: string; // timestamptz, default now()
	metadata: Record<string, unknown>; // jsonb, default '{}'
}

/** event_polls table */
export interface EventPoll {
	id: string; // uuid, PK, NOT NULL
	event_id: string; // uuid, NOT NULL, FK -> events
	question: string; // text, NOT NULL
	options: string[]; // jsonb, NOT NULL
	results: number[]; // jsonb, default '[]'
	is_active: boolean; // boolean, default true
	created_by: string | null; // uuid, FK -> users
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** event_poll_votes table */
export interface EventPollVote {
	id: string; // uuid, PK, NOT NULL
	poll_id: string; // uuid, NOT NULL, FK -> event_polls
	user_id: string; // uuid, NOT NULL, FK -> users
	option_index: number; // int, NOT NULL
	created_at: string; // timestamptz, default now()
}

/** networking_messages table */
export interface NetworkingMessage {
	id: string; // uuid, PK, NOT NULL
	event_id: string; // uuid, NOT NULL, FK -> events
	user_id: string; // uuid, NOT NULL, FK -> users
	content: string; // text, NOT NULL
	created_at: string; // timestamptz, default now()
	user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'username'>;
}

/** email_campaigns table */
export interface EmailCampaign {
	id: string; // uuid, PK, NOT NULL
	event_id: string; // uuid, NOT NULL, FK -> events
	organization_id: string; // uuid, NOT NULL, FK -> organizations
	subject: string; // text, NOT NULL
	content: string; // text, NOT NULL
	status: 'DRAFT' | 'SENT' | 'FAILED'; // text, default 'DRAFT'
	recipient_count: number; // int, default 0
	created_by: string | null; // uuid, FK -> users
	sent_at: string | null; // timestamptz
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** Attendee Export type */
export interface AttendeeExport {
	id: string;
	first_name: string | null;
	last_name: string | null;
	email: string;
	status: string;
	booking_date: string;
	ticket_type: string | null;
}

/** event_spaces table */
export interface EventSpace {
	id: string; // uuid, PK, NOT NULL
	name: string; // varchar, NOT NULL
	description: string | null; // text
	slug: string; // varchar, NOT NULL
	organization_id: string; // uuid, NOT NULL, FK -> organizations
	created_by: string; // uuid, NOT NULL, FK -> users
	is_public: boolean; // boolean, default true
	allow_public_events: boolean; // boolean, default true
	require_approval_for_events: boolean; // boolean, default false
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

// ============================================================
// SOCIAL FEATURES
// ============================================================

/** follows table */
export interface Follow {
	id: string; // uuid, PK, NOT NULL
	follower_id: string; // uuid, NOT NULL, FK -> users
	target_id: string; // uuid, NOT NULL
	target_type: FollowTargetType; // varchar, NOT NULL
	created_at: string; // timestamptz, default CURRENT_TIMESTAMP
}

// ============================================================
// EVENT DISCOVERY EXTENSIONS
// ============================================================

/** tags table */
export interface Tag {
	id: string; // uuid, PK, NOT NULL
	name: string; // text, NOT NULL
	slug: string; // text, NOT NULL, UNIQUE
	created_by: string | null; // uuid, FK -> users
	created_at: string; // timestamptz, default now()
}

/** event_tags table */
export interface EventTag {
	event_id: string; // uuid, PK (composite), FK -> events
	tag_id: string; // uuid, PK (composite), FK -> tags
	created_at: string; // timestamptz, default now()
}

/** venues table */
export interface Venue {
	id: string; // uuid, PK, NOT NULL
	organization_id: string | null; // uuid, FK -> organizations
	name: string; // text, NOT NULL
	slug: string; // text, NOT NULL
	address: string | null; // text
	city: string | null; // text
	state: string | null; // text
	country: string | null; // text
	postal_code: string | null; // text
	latitude: number | null; // float8
	longitude: number | null; // float8
	created_by: string | null; // uuid, FK -> users
	created_at: string; // timestamptz, default now()
}

/** ticket_types table */
export interface TicketType {
	id: string; // uuid, PK, NOT NULL
	event_id: string; // uuid, FK -> events
	name: string; // text
	description: string | null; // text
	price: number; // numeric
	currency: string; // text
	quantity_available: number | null; // int
	is_active: boolean; // boolean
	sale_starts_at: string | null; // timestamptz
	sale_ends_at: string | null; // timestamptz
	created_by: string | null; // uuid, FK -> users
	created_at: string; // timestamptz
}

/** waitlist_entries table */
export interface WaitlistEntry {
	id: string; // uuid, PK
	event_id: string; // uuid, FK -> events
	user_id: string; // uuid, FK -> users
	status: 'WAITING' | 'INVITED' | 'CONFIRMED' | 'CANCELLED';
	created_at: string; // timestamptz
	updated_at: string; // timestamptz
}

/** event_sessions table */
export interface EventSession {
	id: string; // uuid, PK
	event_id: string; // uuid, FK -> events
	title: string; // text
	description: string | null; // text
	start_at: string | null; // timestamptz
	end_at: string | null; // timestamptz
	location: string | null; // text
	created_by: string | null; // uuid
	created_at: string; // timestamptz
}

/** speakers table */
export interface Speaker {
	id: string; // uuid, PK
	organization_id: string | null; // uuid
	name: string; // text
	bio: string | null; // text
	avatar_url: string | null; // text
	website_url: string | null; // text
	created_by: string | null; // uuid
	created_at: string; // timestamptz
}

/** event_speakers table */
export interface EventSpeaker {
	event_id: string; // uuid
	speaker_id: string; // uuid
	role: string | null; // text
	sort_order: number; // int
	created_at: string; // timestamptz
}

/** event_checkins table */
export interface EventCheckin {
	id: string; // uuid, PK
	event_id: string; // uuid
	booking_id: string; // uuid
	checked_in_at: string; // timestamptz
	checked_in_by: string | null; // uuid
}

/** reviews table */
export interface Review {
	id: string; // uuid, PK, NOT NULL
	event_id: string; // uuid, NOT NULL, FK -> events
	user_id: string; // uuid, NOT NULL, FK -> users
	rating: number; // int, NOT NULL, CHECK 1-5
	title: string | null; // varchar
	comment: string | null; // text
	is_verified: boolean; // boolean, default false
	is_helpful: number; // int, default 0
	is_reported: boolean; // boolean, default false
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** review_helpful_votes table */
export interface ReviewHelpfulVote {
	id: string; // uuid, PK, NOT NULL
	review_id: string; // uuid, NOT NULL, FK -> reviews
	user_id: string; // uuid, NOT NULL, FK -> users
	is_helpful: boolean; // boolean, NOT NULL
	created_at: string; // timestamptz, default now()
}

/** review_reports table */
export interface ReviewReport {
	id: string; // uuid, PK, NOT NULL
	review_id: string; // uuid, NOT NULL, FK -> reviews
	reporter_id: string; // uuid, NOT NULL, FK -> users
	reason: ReportReason; // varchar, NOT NULL
	description: string | null; // text
	status: ReportStatus; // varchar, default 'PENDING'
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

// ============================================================
// NOTIFICATIONS
// ============================================================

/** notifications table */
export interface Notification {
	id: string; // uuid, PK, NOT NULL
	user_id: string; // uuid, NOT NULL, FK -> users
	title: string; // varchar, NOT NULL
	message: string; // text, NOT NULL
	type: NotificationType; // varchar, NOT NULL
	data: Record<string, unknown>; // jsonb, default '{}'
	is_read: boolean; // boolean, default false
	is_sent: boolean; // boolean, default false
	scheduled_at: string | null; // timestamptz
	sent_at: string | null; // timestamptz
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** notification_preferences table */
export interface NotificationPreferences {
	id: string; // uuid, PK, NOT NULL
	user_id: string; // uuid, NOT NULL, UNIQUE, FK -> users
	email_notifications: boolean; // boolean, default true
	push_notifications: boolean; // boolean, default true
	event_reminders: boolean; // boolean, default true
	booking_reminders: boolean; // boolean, default true
	follow_updates: boolean; // boolean, default true
	category_updates: boolean; // boolean, default true
	reminder_hours: number; // int, default 24
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** notification_templates table */
export interface NotificationTemplate {
	id: string; // uuid, PK, NOT NULL
	type: string; // varchar, NOT NULL, UNIQUE
	title_template: string; // text, NOT NULL
	message_template: string; // text, NOT NULL
	is_active: boolean; // boolean, default true
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

// ============================================================
// ADMIN & ORGANIZATION MANAGEMENT
// ============================================================

/** admin_requests table */
export interface AdminRequest {
	id: string; // uuid, PK, NOT NULL
	user_id: string; // uuid, NOT NULL, UNIQUE, FK -> users
	email: string; // varchar, NOT NULL
	first_name: string | null; // varchar
	last_name: string | null; // varchar
	contact_number: string | null; // varchar
	reason: string; // text, NOT NULL
	organization: string | null; // varchar
	experience_level: ExperienceLevel | null; // varchar
	intended_use: string | null; // text
	status: AdminRequestStatus; // varchar, default 'PENDING'
	reviewed_by: string | null; // uuid, FK -> users
	reviewed_at: string | null; // timestamptz
	review_notes: string | null; // text
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
	organization_id: string | null; // uuid, FK -> organizations
	requested_role: UserRole | OrgRole; // varchar, default 'ADMIN'
}

/** organization_invitations table */
export interface OrganizationInvitation {
	id: string; // uuid, PK, NOT NULL
	organization_id: string; // uuid, NOT NULL, FK -> organizations
	email: string; // varchar, NOT NULL
	invited_by: string; // uuid, NOT NULL, FK -> users
	role: OrgRole; // varchar, NOT NULL, default 'USER'
	status: InvitationStatus; // varchar, NOT NULL, default 'PENDING'
	invitation_token: string; // uuid, NOT NULL, default gen_random_uuid()
	expires_at: string; // timestamptz, NOT NULL, default now() + 7 days
	message: string | null; // text
	accepted_at: string | null; // timestamptz
	accepted_by: string | null; // uuid, FK -> users
	created_at: string; // timestamptz, NOT NULL, default now()
	updated_at: string; // timestamptz, NOT NULL, default now()
}

/** organization_settings table */
export interface OrganizationSetting {
	id: string; // uuid, PK, NOT NULL
	organization_id: string; // uuid, NOT NULL, FK -> organizations
	setting_key: string; // varchar, NOT NULL
	setting_value: string | null; // text
	setting_type: SettingType; // varchar, default 'STRING'
	description: string | null; // text
	created_at: string; // timestamptz, default now()
	updated_at: string; // timestamptz, default now()
}

/** admin_audit_log table */
export interface AdminAuditLog {
	id: string; // uuid, PK, NOT NULL
	admin_id: string | null; // uuid, FK -> users
	action: string; // text, NOT NULL
	target_user_id: string | null; // uuid, FK -> users
	details: Record<string, unknown> | null; // jsonb
	created_at: string; // timestamptz, default now()
}

// ============================================================
// SUBSCRIPTION
// ============================================================

/** subscription_plans table */
export interface SubscriptionPlanDetails {
	id: string; // uuid, PK, NOT NULL
	name: string; // varchar, NOT NULL, UNIQUE
	display_name: string; // varchar, NOT NULL
	description: string | null; // text
	price_monthly: number | null; // numeric
	price_yearly: number | null; // numeric
	max_events: number; // int, NOT NULL
	max_users: number; // int, NOT NULL
	max_storage_mb: number; // int, NOT NULL
	features: Record<string, unknown> | null; // jsonb
	is_active: boolean; // boolean, default true
	created_at: string; // timestamptz, default now()
}

// ============================================================
// USER PROFILES
// ============================================================

/** user_profiles table */
export interface UserProfile {
	id: string; // uuid, PK, NOT NULL
	user_id: string | null; // uuid, FK -> users
	profile_image_url: string | null; // text
	bio: string | null; // text
	preferences: Record<string, unknown> | null; // jsonb
	updated_at: string; // timestamptz, default CURRENT_TIMESTAMP
}

// ============================================================
// VIEWS (read-only aggregates)
// ============================================================

/** organization_dashboard_stats view */
export interface OrganizationDashboardStats {
	organization_id: string | null;
	organization_name: string | null;
	subscription_plan: string | null;
	subscription_status: string | null;
	max_events: number | null;
	max_users: number | null;
	current_events_count: number | null;
	current_users_count: number | null;
	total_event_spaces: number | null;
	total_events: number | null;
	total_bookings: number | null;
	total_users: number | null;
	events_last_30_days: number | null;
	bookings_last_30_days: number | null;
	total_revenue: number | null;
	revenue_last_30_days: number | null;
}

/** event_rating_summary view */
export interface EventRatingSummary {
	event_id: string | null;
	event_title: string | null;
	total_reviews: number | null;
	average_rating: number | null;
	five_star_count: number | null;
	four_star_count: number | null;
	three_star_count: number | null;
	two_star_count: number | null;
	one_star_count: number | null;
	organization_id: string | null;
}

/** event_booking_summary view */
export interface EventBookingSummary {
	event_id: string | null;
	confirmed_bookings: number | null;
	total_bookings: number | null;
}

/** event_discovery_stats view */
export interface EventDiscoveryStats {
	event_id: string | null;
	attendees_count: number | null;
	total_reviews: number | null;
	average_rating: number | null;
	trending_score: number | null;
	organization_id: string | null;
}

/** notification_summary view */
export interface NotificationSummary {
	user_id: string | null;
	total_notifications: number | null;
	unread_count: number | null;
	booking_notifications: number | null;
	event_notifications: number | null;
	follow_notifications: number | null;
	admin_notifications: number | null;
	latest_notification: string | null;
}

/** user_review_summary view */
export interface UserReviewSummary {
	user_id: string | null;
	username: string | null;
	total_reviews: number | null;
	average_rating_given: number | null;
	verified_reviews: number | null;
	latest_review: string | null;
}

// ============================================================
// INPUT TYPES (for creating/updating records)
// ============================================================

/** Input for creating an event */
export interface CreateEventInput {
	title: string;
	description?: string;
	date: string;
	time: string;
	location?: string;
	price?: number;
	image?: File;
	category_id?: string;
	event_space_id?: string;
	organization_id?: string;
	is_public?: boolean;
	requires_approval?: boolean;
	max_attendees?: number | null;
	venue_id?: string | null;
	tags?: string[] | null;
	is_networking_enabled?: boolean;
}

/** Input for updating an event */
export interface UpdateEventInput extends Partial<CreateEventInput> {
	image_url?: string;
}

/** Input for creating a booking */
export interface CreateBookingInput {
	event_id: string;
	ticket_type_id?: string | null;
}

/** Input for creating a review */
export interface CreateReviewInput {
	event_id: string;
	rating: number; // 1-5
	title?: string;
	comment?: string;
}

/** Input for updating a review */
export interface UpdateReviewInput {
	rating?: number;
	title?: string;
	comment?: string;
}

/** Input for creating an admin request */
export interface CreateAdminRequestInput {
	reason: string;
	first_name?: string;
	last_name?: string;
	contact_number?: string;
	organization?: string;
	experience_level?: ExperienceLevel;
	intended_use?: string;
	organization_id?: string;
	requested_role?: UserRole | OrgRole;
}

/** Input for user registration */
export interface RegisterUserInput {
	email: string;
	password: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	contactNumber?: string;
	city?: string;
	pincode?: string;
	streetAddress?: string;
	role?: UserRole;
	isAdminRequest?: boolean;
}

/** Input for creating an event space */
export interface CreateEventSpaceInput {
	name: string;
	description?: string;
	slug: string;
	organization_id: string;
	is_public?: boolean;
	allow_public_events?: boolean;
	require_approval_for_events?: boolean;
}

/** Input for organization update */
export interface UpdateOrganizationInput {
	name?: string;
	description?: string;
	logo_url?: string;
	website_url?: string;
	contact_email?: string;
	contact_phone?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	postal_code?: string;
	is_public?: boolean;
	allow_public_events?: boolean;
	require_approval_for_events?: boolean;
	allow_user_registration?: boolean;
}

// ============================================================
// DATABASE INTERFACE (for Supabase Client)
// ============================================================

export interface Database {
	public: {
		Tables: {
			users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
			organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
			events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> };
			categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
			bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
			coupons: { Row: Coupon; Insert: Partial<Coupon>; Update: Partial<Coupon> };
			refund_requests: { Row: RefundRequest; Insert: Partial<RefundRequest>; Update: Partial<RefundRequest> };
			user_badges: { Row: UserBadge; Insert: Partial<UserBadge>; Update: Partial<UserBadge> };
			event_spaces: { Row: EventSpace; Insert: Partial<EventSpace>; Update: Partial<EventSpace> };
			follows: { Row: Follow; Insert: Partial<Follow>; Update: Partial<Follow> };
			tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag> };
			event_tags: { Row: EventTag; Insert: Partial<EventTag>; Update: Partial<EventTag> };
			venues: { Row: Venue; Insert: Partial<Venue>; Update: Partial<Venue> };
			ticket_types: { Row: TicketType; Insert: Partial<TicketType>; Update: Partial<TicketType> };
			waitlist_entries: { Row: WaitlistEntry; Insert: Partial<WaitlistEntry>; Update: Partial<WaitlistEntry> };
			event_sessions: { Row: EventSession; Insert: Partial<EventSession>; Update: Partial<EventSession> };
			speakers: { Row: Speaker; Insert: Partial<Speaker>; Update: Partial<Speaker> };
			event_speakers: { Row: EventSpeaker; Insert: Partial<EventSpeaker>; Update: Partial<EventSpeaker> };
			event_checkins: { Row: EventCheckin; Insert: Partial<EventCheckin>; Update: Partial<EventCheckin> };
			reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
			review_helpful_votes: { Row: ReviewHelpfulVote; Insert: Partial<ReviewHelpfulVote>; Update: Partial<ReviewHelpfulVote> };
			review_reports: { Row: ReviewReport; Insert: Partial<ReviewReport>; Update: Partial<ReviewReport> };
			notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
			notification_preferences: { Row: NotificationPreferences; Insert: Partial<NotificationPreferences>; Update: Partial<NotificationPreferences> };
			notification_templates: { Row: NotificationTemplate; Insert: Partial<NotificationTemplate>; Update: Partial<NotificationTemplate> };
			admin_requests: { Row: AdminRequest; Insert: Partial<AdminRequest>; Update: Partial<AdminRequest> };
			organization_invitations: { Row: OrganizationInvitation; Insert: Partial<OrganizationInvitation>; Update: Partial<OrganizationInvitation> };
			organization_settings: { Row: OrganizationSetting; Insert: Partial<OrganizationSetting>; Update: Partial<OrganizationSetting> };
			admin_audit_log: { Row: AdminAuditLog; Insert: Partial<AdminAuditLog>; Update: Partial<AdminAuditLog> };
			subscription_plans: { Row: SubscriptionPlanDetails; Insert: Partial<SubscriptionPlanDetails>; Update: Partial<SubscriptionPlanDetails> };
			user_profiles: { Row: UserProfile; Insert: Partial<UserProfile>; Update: Partial<UserProfile> };
			event_polls: { Row: EventPoll; Insert: Partial<EventPoll>; Update: Partial<EventPoll> };
			event_poll_votes: { Row: EventPollVote; Insert: Partial<EventPollVote>; Update: Partial<EventPollVote> };
			networking_messages: { Row: NetworkingMessage; Insert: Partial<NetworkingMessage>; Update: Partial<NetworkingMessage> };
			email_campaigns: { Row: EmailCampaign; Insert: Partial<EmailCampaign>; Update: Partial<EmailCampaign> };
		};
		Views: {
			organization_dashboard_stats: { Row: OrganizationDashboardStats };
			event_rating_summary: { Row: EventRatingSummary };
			event_booking_summary: { Row: EventBookingSummary };
			event_discovery_stats: { Row: EventDiscoveryStats };
			notification_summary: { Row: NotificationSummary };
			user_review_summary: { Row: UserReviewSummary };
		};
		Functions: {
			create_organization_event: {
				Args: {
					p_title: string;
					p_description: string;
					p_category_id: string | null;
					p_location: string | null;
					p_price: number;
					p_date: string;
					p_time: string;
					p_image_url: string | null;
					p_organization_id: string;
					p_created_by: string;
				};
				Returns: string;
			};
			delete_event_space: {
				Args: {
					p_space_id: string;
					p_user_id: string;
				};
				Returns: boolean;
			};
			cancel_booking_admin: {
				Args: {
					booking_id: string;
				};
				Returns: Booking;
			};
			get_event_attendees: {
				Args: {
					p_event_id: string;
				};
				Returns: AttendeeExport[];
			};
		};
	};
}
