# Specification: Multi-Feature Enhancement Track (10 Features)

## Overview
This track implements 10 complementary features across the EventFlow platform to enhance revenue management, attendee engagement, and organizer productivity. The goal is to deepen the product's value proposition without breaking existing core functionality.

## Functional Requirements

### 1. Revenue & Transactions
*   **Discount & Promo Codes:**
    *   New `coupons` table. Supports percentage or fixed-amount discounts.
    *   Scope: Can be restricted to a specific `organization_id` or a specific `event_id`.
    *   Integration: `bookings` table will include a `coupon_id` to track usage and calculate final pricing in `invoices`.
*   **Refund Management System:**
    *   New `refund_requests` table linked to `bookings`.
    *   States: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSED`.
    *   Organizers can review and update refund statuses from their dashboard.

### 2. Event Experience
*   **QR Code Ticket Generation:**
    *   Add `qr_code_token` (UUID/String) to the `bookings` table.
    *   Render a QR code on the "My Tickets" page using a client-side library (e.g., `qrcode.react`).
    *   Facilitates existing `event_checkins` logic.
*   **"Add to Calendar" Integration:**
    *   Frontend utility to generate `.ics` files and Google Calendar links.
    *   Accessible from the Event Details page and the Booking Confirmation page.
*   **Interactive Polls:**
    *   New `event_polls` and `event_poll_votes` tables.
    *   Scope: Linkable to an `event_id` (mandatory) and optionally a `session_id`.
    *   Real-time display of results using Supabase Realtime.

### 3. Community & Engagement
*   **User Badges & Achievements:**
    *   New `user_badges` table.
    *   Logic: Database triggers to award badges based on `bookings` count (e.g., "Frequent Flyer") or `reviews` helpfulness.
*   **Attendee Networking & Chat:**
    *   Opt-in: Users must check `is_networking_enabled` during the booking process.
    *   Interaction: Only opted-in users for a specific event can access the real-time chat sidebar on the event page.
*   **Saved / Liked Events:**
    *   Implementation: Reuse existing `follows` table with `target_type='EVENT'`.
    *   UI: A "Save for Later" bookmark toggle on event cards and a dedicated "Saved Events" tab in the user profile.

### 4. Organizer Tools
*   **Bulk Email Campaigns:**
    *   New `email_campaigns` table (subject, body, status).
    *   Target: All confirmed attendees for a specific `event_id`.
    *   *Note: Actual delivery will be mocked or integrated with an Edge Function.*
*   **Export Attendee Lists:**
    *   Admin-only dashboard feature to generate and download CSV data from the `bookings` table for a specific event.

## Tech Stack Integration
*   **Database:** Supabase (PostgreSQL) with strict Row Level Security (RLS).
*   **Real-time:** Supabase Realtime for Polls and Networking Chat.
*   **Frontend:** Next.js 15 (App Router), Tailwind CSS, Framer Motion.

## Acceptance Criteria
*   Users can apply valid coupon codes during booking.
*   Attendees see a QR code for their confirmed bookings.
*   Organizers can create polls and view real-time results.
*   Attendees can only see the event chat if they opted-in during booking.
*   Organizers can download a CSV of attendees.
*   Existing functionality (Event creation, basic booking) remains fully operational.

## Out of Scope
*   External Payment Gateway integration (Stripe/PayPal) - will use internal `invoices` table logic.
*   Physical ticket printing/shipping.
*   General site-wide user chat (event-specific only).
