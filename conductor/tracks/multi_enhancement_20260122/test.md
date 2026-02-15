# Testing Guide: Multi-Feature Enhancement Track

This document provides step-by-step instructions to verify the 10 features implemented in the `multi_enhancement_20260122` track.

## Phase 1: Revenue & Transactions

### 1. Coupons (Discount Codes)
*   **Pre-requisite:** You need a valid coupon in the database.
    *   *SQL:* `INSERT INTO public.coupons (code, discount_type, discount_value, organization_id, is_active) VALUES ('TEST20', 'PERCENTAGE', 20, '<your_org_id>', true);`
*   **Test Steps (Attendee):**
    1.  Navigate to an Event Details page.
    2.  Click "Secure Ticket".
    3.  In the booking checkout flow, look for the "Promotional Code" input.
    4.  Enter the code (e.g., `TEST20`) and click "Apply".
    5.  **Verify:** The "Discount" row appears in the breakdown and the "Total Amount" decreases.
    6.  Complete the booking.
    7.  **Verify:** The final booking record in the database should have the `coupon_id` linked.

### 2. Refund Management System
*   **Test Steps (Attendee):**
    1.  Go to **My Bookings** (`/customer/bookings`).
    2.  Find a "Confirmed" booking.
    3.  Click the "Refund" button.
    4.  Enter a reason and submit.
    5.  **Verify:** A toast notification confirms submission. The booking status may remain "Confirmed" until approved, or switch to a pending state depending on logic.
*   **Test Steps (Organizer):**
    1.  Navigate to the **Organization Dashboard**.
    2.  Go to the **Refunds** section (`/organization/refunds`).
    3.  **Verify:** You see the new refund request.
    4.  Approve the request.
    5.  **Verify:** The status updates to 'APPROVED'. A "Mark Processed" button should appear.
    6.  Click "Mark Processed".
    7.  **Verify:** The status updates to 'PROCESSED'.
    8.  **Verify (Attendee):** Refresh your bookings page. The booking status should now be **"Cancelled"**.

## Phase 2: Core Event Experience

### 3. QR Code Ticket Generation
*   **Test Steps (Attendee):**
    1.  Go to **My Bookings** (`/customer/bookings`).
    2.  Locate a confirmed booking.
    3.  Click "View Ticket".
    4.  **Verify:** A QR code is rendered in the dialog.
    5.  **Verify:** The QR code corresponds to the `qr_code_token` in the `bookings` table.

### 4. "Add to Calendar" Utility
*   **Test Steps (Attendee):**
    1.  Go to **My Bookings** and click "View Ticket", OR go to the **Booking Confirmation** screen after payment.
    2.  Look for "Google Cal" or ".iCal File" buttons.
    3.  Click "Google Cal": **Verify** a new tab opens with pre-filled Google Calendar event details.
    4.  Click ".iCal File": **Verify** an `.ics` file is downloaded to your machine.

### 5. Interactive Polls
*   **Test Steps (Organizer):**
    1.  Navigate to your Event Details page (as the event creator).
    2.  Scroll down to the "Interactive Polls" section (above Reviews).
    3.  Click "Create Poll".
    4.  Enter a question and at least two options. Click "Launch Poll".
    5.  **Verify:** The poll appears as "Live".
*   **Test Steps (Attendee):**
    1.  Navigate to the same Event Details page as a confirmed attendee.
    2.  **Verify:** You can see the poll.
    3.  Select an option to vote.
    4.  **Verify:** The results bar updates immediately (simulating real-time).
    5.  **Verify:** You cannot vote again on the same poll.

## Phase 3: Community & Engagement

### 6. User Badges (Gamification)
*   **Test Steps (System):**
    1.  Book multiple events or leave multiple reviews (depending on the specific SQL triggers defined in the migration).
    2.  *Note:* Triggers usually run on `INSERT`.
    3.  **Verify:** Go to your **Profile** (`/customer/profile`) -> "Achievements" tab.
    4.  **Verify:** New badges (e.g., "Frequent Flyer", "Top Reviewer") appear if criteria are met.

### 7. Saved / Liked Events
*   **Test Steps (Attendee):**
    1.  Navigate to any Event Details page.
    2.  Click the "Heart" icon in the sticky sidebar.
    3.  **Verify:** The icon turns red/filled.
    4.  Navigate to **Profile** (`/customer/profile`) -> "Saved Events" tab.
    5.  **Verify:** The event is listed there.
    6.  Click the event card to ensure it links back correctly.

### 8. Attendee Networking & Chat
*   **Test Steps (Booking Flow):**
    1.  Start a new booking.
    2.  In the checkout summary, toggle "Attendee Networking" to **ON**.
    3.  Complete the booking.
*   **Test Steps (Event Page):**
    1.  Go to the Event Details page for that booking.
    2.  **Verify:** A floating chat button (Message icon) appears in the bottom right.
    3.  Click it to open the sidebar.
    4.  Send a message.
    5.  **Verify:** The message appears in the chat stream immediately.

## Phase 4: Organizer Productivity

### 9. Bulk Email Campaigns
*   **Test Steps (Organizer):**
    1.  Navigate to **Organization Dashboard** -> **Events**.
    2.  Click the "More" (three dots) menu on an event -> "Check-in / Attendees".
    3.  Look for the "Broadcast to Attendees" button (Campaign Composer).
    4.  Click it, enter a Subject and Content.
    5.  Click "Dispatch Now".
    6.  **Verify:** A success toast appears.
    7.  *Database Check:* Verify a row was created in `email_campaigns` with `status='SENT'`.

### 10. Export Attendee Lists
*   **Test Steps (Organizer):**
    1.  Navigate to **Organization Dashboard** -> **Events**.
    2.  Click the "More" menu on an event -> "Check-in / Attendees".
    3.  Click the "Export CSV" button in the header.
    4.  **Verify:** A CSV file named `attendees-<event_id>.csv` is downloaded.
    5.  Open the file and **Verify** columns: Booking ID, Email, Name, Status, Checked In.
