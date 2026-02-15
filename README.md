# 🎉 EventFlow

**A full-stack event management platform that actually does everything** — from creating and selling tickets to real-time networking, QR check-ins, and organization-level analytics.

Built with Next.js 15, React 19, Supabase, and a whole lot of Framer Motion ✨

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.39.7-3ECF8E?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15.0-0055FF?style=flat&logo=framer)

---

## What is EventFlow?

EventFlow is a multi-tenant event management platform where **organizations** can create, manage, and sell tickets for events — and **attendees** can discover, book, and engage with them in real time.

Think of it as your own Eventbrite, but with a modern stack, gorgeous UI, and features you'd actually want to use: live polls, networking chat, QR code check-ins, coupon engines, waitlists, and more.

---

## ✨ Features at a Glance

### 🏢 Multi-Tenant Organizations
- Every event belongs to an **organization** — teams can collaborate on event creation and logistics
- Dedicated **Event Spaces** (slug-based custom hubs) for each org
- Step-by-step **onboarding wizard** for new organizations
- Role-based access: **Global Admin → Org Admin → Team Member → Attendee**

### 📅 Event Lifecycle
- Full event builder with sessions, agendas, speakers, and venue management
- Smart tagging and categorization for discoverability
- Cover image uploads with drag-and-drop
- Venue management with lat/long support

### 🎟️ Ticketing & Logistics
- **Multiple ticket tiers** — Early Bird, VIP, General Admission
- Real-time inventory tracking with automatic "Sold Out" states
- **Coupon & discount engine** with usage limits and expiration
- **Waitlist system** — captures interest when events sell out
- **QR code tickets** — every booking gets a scannable token
- **Mobile check-in** — staff can scan and verify attendees on-site

### 💬 Engagement & Social
- **Live polls** during events for real-time attendee feedback
- **Networking hub** with direct messaging between attendees
- **Review system** — star ratings, written reviews, "Helpful" votes, and moderation
- **Follow** organizations, events, or categories
- **Social profiles** with badges, bio, and activity history

### 🔔 Notifications
- Real-time **toast notifications** + persistent notification center
- **Scheduled reminders** (24h before events, customizable)
- Granular **notification preferences** per user
- Built-in **email campaign composer** for org admins

### 📈 Analytics & Admin
- **Admin command center** — global stats, user growth, revenue
- **Org-level dashboard** — event stats, ratings, revenue breakdown
- **Trending scores** based on views, bookings, and ratings
- **Audit logging** for admin actions and org activities

### 💸 Payments & Subscriptions
- Automatic **invoice generation** for subscriptions and purchases
- **Subscription plans** — Free, Pro, Enterprise
- **Refund management** workflow for users and admins

### 🎨 The UI (yes, it matters)
- Built with **Radix UI** + **Tailwind CSS** + **Framer Motion**
- Glassmorphism, grainy textures, spotlight effects, 3D hover cards
- Bento grids, infinite moving carousels, animated border gradients
- Simplex noise-driven dynamic backgrounds
- Full **dark mode** with system detection and smooth transitions

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 15.1 (App Router, Turbopack) |
| **UI** | React 19, Tailwind CSS, Radix UI, Framer Motion |
| **Backend** | Supabase (Postgres, Auth, Realtime, Storage, Edge Functions) |
| **Language** | TypeScript (strict mode) |
| **Forms** | React Hook Form |
| **Icons** | Lucide React |
| **Dates** | date-fns |
| **Deployment** | Netlify / Vercel (static export) |

---

## 📁 Project Structure

```
event-flow/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard & management
│   │   ├── auth/              # Login, register, password reset
│   │   ├── customer/          # Attendee-facing pages
│   │   ├── events/            # Event browsing & details
│   │   ├── organization/      # Org dashboard, settings, billing
│   │   ├── notifications/     # Notification center
│   │   ├── social/            # Social profiles & follows
│   │   └── globals.css        # Global styles & theme tokens
│   ├── components/            # Reusable React components
│   │   └── ui/                # Base UI primitives (shadcn/ui)
│   ├── contexts/              # Auth, Theme, and other providers
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Supabase client, API utils, helpers
├── supabase/                  # Migrations, functions, schema
├── conductor/                 # Orchestration scripts
├── scripts/                   # Build & utility scripts
├── netlify.toml               # Deployment config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
git clone <repository-url>
cd event-flow
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migrations from `supabase/migrations/` in the SQL Editor
3. Enable Row Level Security (RLS) policies
4. Create storage buckets for event images
5. Configure auth providers and redirect URLs

### 4. Run It

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're live 🚀

---

## 📜 Available Scripts

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run build:static  # Static export build
npm run start         # Start production server
npm run lint          # Run ESLint
```

---

## 🚢 Deployment

The project supports **static export**, so you can deploy the `out/` folder to pretty much anywhere:

- **Netlify** (configured via `netlify.toml`)
- **Vercel**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- Any static hosting

```bash
npm run build:static
# Deploy the `out/` directory
```

---

## 🔒 Security

- **Row Level Security (RLS)** — database-level policies ensuring data isolation between orgs
- **Supabase Auth** — JWT-based authentication with social login support
- **Role-based access control** — enforced at both UI and database layers
- **Automated triggers** — backend automation for profile creation, follower syncing, and stat updates

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Make your changes
4. Open a PR with screenshots if it's a UI change

We use **TypeScript strict mode**, **ESLint**, and **conventional commits**.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the framework
- [Supabase](https://supabase.com) for the backend
- [shadcn/ui](https://ui.shadcn.com) for the component primitives
- [Framer Motion](https://www.framer.com/motion/) for making everything feel alive

---
