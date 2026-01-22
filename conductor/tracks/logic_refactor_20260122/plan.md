# Implementation Plan - Logic Consolidation & Refactor

## Phase 1: Preparation & Type Safety
- [ ] Task: Generate and Sync Database Types
    - [ ] Run supabase gen types typescript to ensure src/types/database.ts reflects the latest schema.
    - [ ] Audit src/types/database.ts to confirm RPC function signatures are present and correct.
- [ ] Task: Set up Zod Validation Schemas
    - [ ] Create src/lib/validations/rpc.ts to house Zod schemas for RPC inputs.
    - [ ] Define schemas for create_organization_event, delete_event_space, and cancel_booking_admin arguments matching the DB types.
- [ ] Task: Conductor - User Manual Verification 'Preparation & Type Safety' (Protocol in workflow.md)

## Phase 2: Client-Side API Refactor
- [ ] Task: Refactor Events API (src/lib/api/events.ts)
    - [ ] Write failing test: Verify createEvent calls supabase.rpc instead of functions.invoke.
    - [ ] Implement: Update createEvent to validate input with Zod and call supabase.rpc('create_organization_event', ...).
    - [ ] Remove any legacy raw insert calls if present.
- [ ] Task: Refactor Organization API (src/lib/api/org.ts)
    - [ ] Write failing test: Verify deleteEventSpace calls supabase.rpc.
    - [ ] Implement: Update deleteEventSpace to call supabase.rpc('delete_event_space', ...).
- [ ] Task: Refactor Bookings API (src/lib/api/bookings.ts)
    - [ ] Write failing test: Verify cancelBooking calls supabase.rpc.
    - [ ] Implement: Update cancelBooking to call supabase.rpc('cancel_booking_admin', ...) for admin actions.
- [ ] Task: Conductor - User Manual Verification 'Client-Side API Refactor' (Protocol in workflow.md)

## Phase 3: Cleanup & Integration Verification
- [ ] Task: Remove Redundant Edge Functions
    - [ ] Delete supabase/functions/create-organization-event/ directory.
    - [ ] Delete supabase/functions/delete-event-space/ directory.
    - [ ] Delete supabase/functions/cancel-booking-admin/ directory.
- [ ] Task: Verify Application Integration
    - [ ] Manual verification: Start app and test the 'Create Event' flow end-to-end.
    - [ ] Manual verification: Test the 'Delete Event Space' flow.
    - [ ] Manual verification: Test 'Cancel Booking' as an admin.
- [ ] Task: Conductor - User Manual Verification 'Cleanup & Integration Verification' (Protocol in workflow.md)