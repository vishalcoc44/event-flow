# 🎉 EventFlow - Modern Event Management System

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.39.7-3ECF8E?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15.0-0055FF?style=flat&logo=framer)

A comprehensive, modern event management platform built with cutting-edge technologies. EventFlow provides a seamless experience for event organizers and attendees with real-time features, beautiful UI, and powerful management tools.

## ✨ Key Features

### 🎨 **Modern UI/UX**
- **Beautiful Design**: Clean, modern interface with smooth animations
- **Dark Mode**: Complete dark theme with automatic system detection
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: WCAG compliant with proper ARIA labels

### 👥 **User Management**
- **Multi-Role System**: Admin, Organization Owner, User roles
- **Secure Authentication**: Supabase Auth with email/password
- **Profile Management**: Complete user profile customization
- **Organization Management**: Team collaboration features

### 📅 **Event Management**
- **Create & Manage Events**: Full CRUD operations
- **Categorization**: Organize events by categories
- **Image Upload**: Cloud storage for event images
- **Advanced Search**: Filter events by date, category, location
- **Real-time Updates**: Live event status changes

### 🎫 **Booking System**
- **Easy Booking**: One-click event registration
- **Booking Management**: View and manage all bookings
- **Cancellation**: Flexible cancellation policies
- **Payment Integration**: Ready for payment processing

### 👥 **Social Features**
- **Follow System**: Follow users and events
- **Social Profiles**: Comprehensive user profiles
- **Real-time Notifications**: Live updates and alerts
- **Community Building**: Social interactions and networking

### 🛠️ **Admin Panel**
- **Dashboard Analytics**: Comprehensive statistics
- **User Management**: Admin controls for all users
- **Content Moderation**: Event and user management
- **System Monitoring**: Performance and usage tracking

### 🌙 **Dark Mode**
- **Complete Theme System**: Full black backgrounds with grey accents
- **Theme Persistence**: Remembers user preference
- **System Integration**: Respects system theme settings
- **Smooth Transitions**: Animated theme switching

## 🏗️ **Technology Stack**

### **Frontend Framework**
- **Next.js 15.1.0** - React framework with App Router
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5.0** - Type-safe JavaScript

### **Styling & UI**
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.15.0** - Animation library for React
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Custom Design System** - Consistent theming with CSS variables

### **Backend & Database**
- **Supabase 2.39.7** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication system
  - File storage
  - Edge functions

### **Additional Libraries**
- **Axios** - HTTP client for API calls
- **Date-fns** - Modern date utility library
- **React Hook Form** - Form management
- **React Hot Toast** - Notification system
- **JWT** - JSON Web Token handling
- **UUID** - Unique identifier generation

## 📁 **Project Structure**

```
event-management-system/
├── frontend/                          # Next.js frontend application
│   ├── public/                        # Static assets (images, icons)
│   │   ├── hero-image.jpg            # Landing page hero image
│   │   └── *.svg                     # Icon and logo files
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── admin/                # Admin dashboard pages
│   │   │   ├── customer/             # Customer-facing pages
│   │   │   ├── organization/         # Organization management
│   │   │   ├── auth/                 # Authentication pages
│   │   │   ├── events/               # Event browsing and details
│   │   │   ├── globals.css           # Global styles and theme variables
│   │   │   └── layout.tsx            # Root layout with providers
│   │   ├── components/               # Reusable React components
│   │   │   ├── ui/                   # Base UI components (shadcn/ui)
│   │   │   ├── Header.tsx            # Navigation header
│   │   │   ├── Footer.tsx            # Site footer
│   │   │   └── *.tsx                 # Feature-specific components
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── AuthContext.tsx       # Authentication state
│   │   │   ├── ThemeContext.tsx      # Dark/light theme management
│   │   │   └── *.tsx                 # Other context providers
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.tsx           # Authentication hooks
│   │   │   └── *.ts                  # Utility hooks
│   │   └── lib/                      # Utility libraries
│   │       ├── supabase.ts           # Supabase client configuration
│   │       ├── api.ts                # API utility functions
│   │       └── utils.ts              # General utilities
│   ├── supabase/                     # Supabase Edge Functions
│   │   └── functions/                # Serverless functions
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── next.config.ts                # Next.js configuration
│   └── package.json                  # Frontend dependencies
├── database schema/                  # Database schema files
├── netlify.toml                      # Deployment configuration
└── README.md                         # Project documentation
```

## 🚀 **Quick Start**


### **1. Clone and Install**

```bash
# Clone the repository
git clone <repository-url>
cd event-management-system

# Install dependencies
cd frontend
npm install
```

### **2. Set Up Supabase**

1. **Create a Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys (Settings > API)

2. **Configure Environment Variables**
   - Create a `.env.local` file in the frontend directory
   - Add your Supabase URL and API keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Set Up Database Schema**
   - Run the database migrations in Supabase SQL Editor
   - Apply the schema files from the `database schema/` directory
   - Enable Row Level Security (RLS) policies

4. **Configure Authentication**
   - Set up authentication providers in Supabase Dashboard
   - Configure redirect URLs for your application
   - Set up email templates and SMTP settings

5. **Set Up Storage**
   - Create storage buckets for event images
   - Configure storage policies for file uploads
   - Set up CDN for optimized image delivery

### **3. Run the Development Server**

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

## 🛠️ **Development Workflow**

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Advanced builds
npm run build:debug  # Build with debug information
npm run build:static # Build for static export
```

### **Project Architecture**

- **App Router**: Uses Next.js 13+ App Router for file-based routing
- **Server Components**: Default to server components for better performance
- **Client Components**: Marked with `'use client'` when needed
- **Type Safety**: Full TypeScript coverage with strict mode
- **Performance**: Optimized with bundle splitting and lazy loading

### **Key Components**

- **Theme System**: Complete dark/light mode with system detection
- **Authentication**: Supabase Auth integration with role-based access
- **Real-time**: Live updates using Supabase subscriptions
- **Forms**: React Hook Form with validation
- **Notifications**: Toast notifications for user feedback
- **Loading States**: Skeleton components and loading indicators

## 🚀 **Deployment**

### **Static Export (Recommended)**

The project is configured for static export, making it easy to deploy to any static hosting service:

```bash
# Build for static export
npm run build:static

# The built files will be in the 'out' directory
# Deploy the 'out' folder to your hosting service
```

### **Supported Platforms**
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Any static hosting service**


## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

### **Development Setup**

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/event-management-system.git`
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Install dependencies**: `cd frontend && npm install`
5. **Start development**: `npm run dev`

### **Code Style**

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Prettier**: Code formatting (if configured)
- **Conventional Commits**: Use conventional commit format

### **Pull Request Process**

1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Ensure all tests pass**
4. **Create a descriptive PR** with screenshots if UI changes

### **Areas for Contribution**

- **UI/UX Improvements**: Enhance the user interface
- **Performance Optimization**: Improve loading times and bundle size
- **Accessibility**: Improve WCAG compliance
- **Internationalization**: Add multi-language support
- **Testing**: Add comprehensive test coverage
- **Documentation**: Improve documentation and guides

## 📊 **Performance Features**

### **Optimization Techniques**
- **Static Generation**: Pages are statically generated for fast loading
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Splitting**: Code splitting for smaller initial bundles
- **Lazy Loading**: Components loaded on demand
- **Caching**: Intelligent caching strategies

### **SEO Features**
- **Meta Tags**: Dynamic meta tags for each page
- **Open Graph**: Social media sharing optimization
- **Structured Data**: Event schema markup
- **Sitemap**: Automatic sitemap generation

## 🔒 **Security**

- **Row Level Security**: Database-level security with RLS
- **Authentication**: Secure authentication with Supabase Auth
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **HTTPS**: SSL encryption in production


## 🙋‍♂️ **Support**

If you need help or have questions:

- **Documentation**: Check the [docs](./docs) folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Join our GitHub Discussions
- **Email**: Contact the maintainers

## 🎉 **Acknowledgments**

- **Next.js Team** for the amazing framework
- **Supabase Team** for the incredible backend platform
- **shadcn/ui** for the beautiful component library
- **All Contributors** who help make this project better

