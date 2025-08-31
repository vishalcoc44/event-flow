'use client'

import Link from 'next/link'
import { GradientButton } from './ui/gradient-button'

export default function Footer() {
    return (
        <footer className="bg-[#E8FBFD] py-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between mb-12">
                    <div className="mb-8 md:mb-0">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xl font-semibold text-foreground">EventFlow</span>
                        </div>
                        <p className="text-muted-foreground max-w-md mb-6">
                            EventFlow empowers you to create, promote, and manage stunning events with ease. From intimate workshops to grand conferences, we streamline everything.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted-foreground hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                </svg>
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            </a>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                                <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                                <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                                <li><Link href="/press" className="text-muted-foreground hover:text-primary">Press</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><Link href="/help" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
                                <li><Link href="/guides" className="text-muted-foreground hover:text-primary">Guides</Link></li>
                                <li><Link href="/partners" className="text-muted-foreground hover:text-primary">Partners</Link></li>
                                <li><Link href="/webinars" className="text-muted-foreground hover:text-primary">Webinars</Link></li>
                            </ul>
                        </div>
                        
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-lg font-semibold mb-4">Stay in the Loop with EventFlow</h3>
                            <p className="text-muted-foreground mb-4">Subscribe to our newsletter for updates</p>
                            <div className="flex">
                                <input 
                                    type="email" 
                                    placeholder="Your email address" 
                                    className="px-4 py-2 border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary w-full"
                                />
                                <GradientButton 
                                    variant="primary"
                                    size="sm"
                                    className="rounded-l-none"
                                >
                                    Subscribe
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-muted-foreground text-sm mb-4 md:mb-0">© 2025 EventFlow. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="/terms" className="text-muted-foreground text-sm hover:text-primary">Terms</Link>
                        <Link href="/privacy" className="text-muted-foreground text-sm hover:text-primary">Privacy</Link>
                        <Link href="/cookies" className="text-muted-foreground text-sm hover:text-primary">Cookies</Link>
                        <div className="flex items-center">
                            <span className="text-muted-foreground text-sm mr-2">English</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

