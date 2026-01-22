# Specification: Logic Consolidation & Refactor

## Overview
This track aims to resolve the 'Split Brain' architecture where business logic is duplicated between Supabase Edge Functions and PostgreSQL Database Functions. We will transition to a 'Thick Database, Thin Client' architecture. This involves bypassing redundant Edge Functions for internal logic, standardizing on direct RPC calls from the client, and consolidating the src/lib/api layer into a strongly-typed SDK.

## Core Objectives
1. **Eliminate Redundancy:** Remove Edge Functions that merely wrap Database Functions (create-organization-event, delete-event-space).
2. **Centralize Logic:** Ensure all business rules (validation, permissions, data integrity) reside primarily in PostgreSQL Functions (RPCs).
3. **Enhance Type Safety:** Refactor the frontend API layer (src/lib/api) to use generated Supabase types and strict Zod validation.
4. **Optimize Performance:** Reduce latency by calling the database directly from the client for standard operations.

## Functional Requirements

### 1. Database & Edge Function Cleanup
* **Identify Redundancy:** Confirm create-organization-event and delete-event-space Edge Functions are redundant wrappers.
* **Edge Function Deletion:** Delete the code and configuration for create-organization-event, delete-event-space, and cancel-booking-admin (if confirmed to be a wrapper).
* **Preserve Notifications:** Retain process-notifications as an Edge Function for handling external communications (email/push).

### 2. Client-Side API Refactor (src/lib/api)
* **Direct RPC Calls:** Refactor events.ts, org.ts, and bookings.ts to call supabase.rpc() directly instead of supabase.functions.invoke().
* **Type Generation:** Ensure src/types/database.ts is up-to-date with the latest schema (using supabase gen types workflow).
* **Validation:** Implement Zod schemas for all RPC inputs in the API layer. Validate data *before* making the Supabase call.
* **Error Handling:** Standardize error handling to catch Supabase PostgREST errors and convert them into user-friendly application errors.

### 3. Testing & Verification
* **Unit Tests:** Update or create unit tests for the refactored API functions to ensure they correctly invoke the RPCs and handle errors.
* **Integration Verification:** Manually verify that creating an event, deleting a space, and canceling a booking still work as expected in the UI.

## Technical Approach
* **Architecture:** Thick Database, Thin Client.
* **Validation:** Zod (Runtime), TypeScript (Compile-time).
* **Migration Strategy:** Immediate Cutover (replace and delete in one go).

## Out of Scope
* Refactoring the process-notifications logic itself (unless broken by other changes).
* Adding new features to the events or booking system.
* Changing the UI components (except for necessary prop updates if types change significantly).