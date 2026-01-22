

# Implementation Plan - Multi-Feature Enhancement Track

This plan implements 10 new features to enhance EventFlow's revenue, engagement, and organizer tools, with rigorous schema validation at every step.

## Phase 1: Revenue & Transaction Enhancements [checkpoint: 502a34e]
- [x] Task: Schema Validation - Verify Phase 1 dependencies against `@supabase/current_schema/**`
- [x] Task: Database - Implement Coupons and Discount Logic (cc67721)
    - [x] Create `coupons` table with scope (org/event) and validation logic.
    - [x] Add `coupon_id` to `bookings` table.
    - [x] Update `invoices` logic to handle discounts.
- [x] Task: Database - Implement Refund Management System (5cecd0e)
    - [x] Create `refund_requests` table linked to `bookings`.
    - [x] Add RLS and functions for status transitions.
- [x] Task: Frontend - Coupon Application UI (4b6f3e9)
    - [x] Add coupon code field to booking flow.
    - [x] Implement real-time validation and price update.
- [x] Task: Frontend - Organizer Refund Dashboard (5cecd0e)
    - [x] Create UI for organizers to view and process refund requests at `/organization/refunds`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Revenue' (Protocol in workflow.md) (57209b1)

## Phase 2: Core Event Experience
- [x] Task: Schema Validation - Verify Phase 2 dependencies against `@supabase/current_schema/**` (ff57ac2)
- [x] Task: Database - QR Code Support (268f98e)
    - [x] Add `qr_code_token` to `bookings` table with auto-generation trigger.
- [ ] Task: Frontend - QR Code Rendering & Ticket View
    - [ ] Integrate `qrcode.react` and update "My Tickets" page.
- [ ] Task: Frontend - "Add to Calendar" Utility
    - [ ] Implement .ics generation and Google Calendar links.
- [ ] Task: Database - Interactive Polls
    - [ ] Create `event_polls` and `event_poll_votes` tables.
    - [ ] Enable Realtime for these tables.
- [ ] Task: Frontend - Live Polls UI
    - [ ] Create Poll creator for organizers and Voting UI for attendees.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Experience' (Protocol in workflow.md)

## Phase 3: Community & Engagement
- [ ] Task: Schema Validation - Verify Phase 3 dependencies against `@supabase/current_schema/**`
- [x] Task: Database - Gamification (User Badges) (2a4b36c)
    - [x] Create `user_badges` table.
    - [x] Implement triggers to award badges based on bookings/reviews.
- [ ] Task: Frontend - Saved Events Logic
    - [ ] Enhance "Save" toggle using existing `follows` table.
    - [ ] Add "Saved Events" tab to User Profile.
- [ ] Task: Database & Realtime - Attendee Networking
    - [ ] Add `is_networking_enabled` to `bookings`.
    - [ ] Implement Realtime Chat table/logic for opted-in attendees.
- [ ] Task: Frontend - Event Networking UI
    - [ ] Implement Networking opt-in during booking.
    - [ ] Add real-time chat sidebar to Event Details (attendees only).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Community' (Protocol in workflow.md)

## Phase 4: Organizer Productivity
- [ ] Task: Schema Validation - Verify Phase 4 dependencies against `@supabase/current_schema/**`
- [ ] Task: Database - Bulk Email Campaigns
    - [ ] Create `email_campaigns` table.
- [ ] Task: Frontend - Campaign Management UI
    - [ ] Create email composer and campaign history for organizers.
- [ ] Task: Backend - Attendee Data Export
    - [ ] Create secure RPC to generate CSV of event attendees.
- [ ] Task: Frontend - Export Feature UI
    - [ ] Add "Export Attendees" button to Organizer Dashboard.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Productivity' (Protocol in workflow.md)
