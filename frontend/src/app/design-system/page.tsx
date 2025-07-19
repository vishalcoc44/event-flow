'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export default function DesignSystem() {
    const { toast } = useToast()
    
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">EventFlow Design System</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        A comprehensive collection of reusable components, styles, and interaction patterns. Designed for consistency, clarity, and a delightful user experience.
                    </p>
                </div>
                
                {/* Color Palette */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <div className="h-24 bg-[#171717] rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Background</h3>
                                <p className="text-sm text-gray-500">var(--background)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-white rounded-t-lg border border-gray-200"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Foreground</h3>
                                <p className="text-sm text-gray-500">var(--foreground)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-primary rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Primary</h3>
                                <p className="text-sm text-gray-500">var(--primary)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-secondary rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Secondary</h3>
                                <p className="text-sm text-gray-500">var(--secondary)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-muted rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Muted</h3>
                                <p className="text-sm text-gray-500">var(--muted)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-accent rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Accent</h3>
                                <p className="text-sm text-gray-500">var(--accent)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-card rounded-t-lg border border-gray-200"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Card</h3>
                                <p className="text-sm text-gray-500">var(--card)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-border rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Border</h3>
                                <p className="text-sm text-gray-500">var(--border)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-input rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Input</h3>
                                <p className="text-sm text-gray-500">var(--input)</p>
                            </div>
                        </div>
                        
                        <div>
                            <div className="h-24 bg-destructive rounded-t-lg"></div>
                            <div className="bg-white p-3 border border-gray-200 rounded-b-lg">
                                <h3 className="font-medium">Destructive</h3>
                                <p className="text-sm text-gray-500">var(--destructive)</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Typography */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6">Typography</h2>
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-bold mb-2">Heading 1 - EventFlow</h1>
                            <p className="text-gray-500">text-5xl font-bold</p>
                        </div>
                        
                        <div>
                            <h2 className="text-4xl font-bold mb-2">Heading 2 - Streamlined Experience</h2>
                            <p className="text-gray-500">text-4xl font-bold</p>
                        </div>
                        
                        <div>
                            <h3 className="text-3xl font-bold mb-2">Heading 3 - Intuitive Management</h3>
                            <p className="text-gray-500">text-3xl font-bold</p>
                        </div>
                        
                        <div>
                            <h4 className="text-2xl font-bold mb-2">Heading 4 - Bookings & Events</h4>
                            <p className="text-gray-500">text-2xl font-bold</p>
                        </div>
                        
                        <div>
                            <p className="text-lg mb-2">This is a large paragraph text, showcasing readability at a prominent size.</p>
                            <p className="text-gray-500">text-lg</p>
                        </div>
                        
                        <div>
                            <p className="text-base mb-2">This is the standard body text used for most content descriptions and details.</p>
                            <p className="text-gray-500">text-base</p>
                        </div>
                        
                        <div>
                            <p className="text-sm mb-2">This smaller text is used for secondary information, captions, and metadata.</p>
                            <p className="text-gray-500">text-sm</p>
                        </div>
                        
                        <div>
                            <p className="text-xs mb-2">This extra small text is used for legal text and fine print.</p>
                            <p className="text-gray-500">text-xs</p>
                        </div>
                    </div>
                </section>
                
                {/* Buttons */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6">Buttons</h2>
                    
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Default Buttons</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button variant="default">Default Button</Button>
                                <Button variant="outline">Outline Button</Button>
                                <Button variant="secondary">Secondary Button</Button>
                                <Button variant="ghost">Ghost Button</Button>
                                <Button variant="link">Link Button</Button>
                                <Button variant="destructive">Destructive Button</Button>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Button Sizes</h3>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button size="lg">Large Button</Button>
                                <Button>Default Button</Button>
                                <Button size="sm">Small Button</Button>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Button States</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button>Default</Button>
                                <Button disabled>Disabled</Button>
                                <Button onClick={() => toast({
                                    title: "Button Clicked",
                                    description: "You clicked the loading button",
                                })}>
                                    With Action
                                </Button>
                                <Button className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    With Icon
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Cards */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6">Cards</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold mb-2">Simple Card</h3>
                            <p className="text-gray-600 mb-4">This is a basic card component with some content and minimal styling.</p>
                            <Button className="w-full">Card Action</Button>
                        </Card>
                        
                        <Card className="overflow-hidden">
                            <div className="h-48 bg-gray-200">
                                <img 
                                    src="https://via.placeholder.com/400x200?text=Card+Image" 
                                    alt="Card with image" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">Card with Image</h3>
                                <p className="text-gray-600 mb-4">This card includes an image at the top with content below.</p>
                                <Button variant="outline" className="w-full">View Details</Button>
                            </div>
                        </Card>
                        
                        <Card className="p-6 border-l-4 border-l-primary">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold">Featured Card</h3>
                            </div>
                            <p className="text-gray-600 mb-4">This card has a colored border and an icon to make it stand out.</p>
                            <div className="flex justify-between">
                                <Button variant="ghost" size="sm">Dismiss</Button>
                                <Button size="sm">Take Action</Button>
                            </div>
                        </Card>
                    </div>
                </section>
                
                {/* Form Elements */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <Input
                                        id="search"
                                        type="search"
                                        placeholder="Search..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="disabled" className="block text-sm font-medium text-gray-700 mb-1">
                                    Disabled Input
                                </label>
                                <Input
                                    id="disabled"
                                    placeholder="This input is disabled"
                                    disabled
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="error" className="block text-sm font-medium text-gray-700 mb-1">
                                    Input with Error
                                </label>
                                <Input
                                    id="error"
                                    placeholder="Invalid input"
                                    className="border-red-500 focus:ring-red-500"
                                />
                                <p className="mt-1 text-sm text-red-600">This field is required</p>
                            </div>
                            
                            <div>
                                <label htmlFor="textarea" className="block text-sm font-medium text-gray-700 mb-1">
                                    Textarea
                                </label>
                                <textarea
                                    id="textarea"
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter your message here..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Badges */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6">Badges</h2>
                    
                    <div className="flex flex-wrap gap-4">
                        <span className="badge badge-primary">Primary</span>
                        <span className="badge badge-secondary">Secondary</span>
                        <span className="badge badge-success">Success</span>
                        <span className="badge badge-warning">Warning</span>
                        <span className="badge badge-danger">Danger</span>
                        
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Confirmed
                        </span>
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Pending
                        </span>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Cancelled
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            New
                        </span>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                            Featured
                        </span>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    )
} 