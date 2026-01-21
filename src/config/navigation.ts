import {
	LayoutDashboard,
	FileText,
	Calendar,
	Layers,
	Users,
	BookOpen,
	UserPlus,
	Home,
	MessageSquare,
	User,
	Mail
} from 'lucide-react'

export const adminLinks = [
	{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/admin/admin-requests', label: 'Requests', icon: FileText },
	{ href: '/admin/event', label: 'Events', icon: Calendar },
	{ href: '/admin/categories', label: 'Categories', icon: Layers },
	{ href: '/admin/customers', label: 'Customers', icon: Users },
	{ href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
	{ href: '/admin/register', label: 'Add Admin', icon: UserPlus, isSpecial: true }
]

export const customerLinks = [
	{ href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/events', label: 'Events', icon: Calendar },
	{ href: '/social', label: 'Social', icon: MessageSquare },
	{ href: '/customer/bookings', label: 'Bookings', icon: BookOpen },
	{ href: '/customer/profile', label: 'Profile', icon: User },
	{ href: '/invitations', label: 'Invitations', icon: Mail },
	{ href: '/customer/admin-request-status', label: 'Admin Request', icon: FileText }
]

export const guestLinks = [
	{ href: '/', label: 'Home', icon: Home },
	{ href: '/events', label: 'Events', icon: Calendar },
	{ href: '/about', label: 'About Us', icon: Users },
	{ href: '/contact', label: 'Contact', icon: Mail }
]
