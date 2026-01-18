import Link from 'next/link'
import { Button } from './ui/button'
import { Github, Mail, Briefcase } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-white text-neutral-600 py-16 border-t border-neutral-100 relative z-50">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                E
                            </div>
                            <span className="text-lg font-bold text-neutral-900">EventFlow</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-neutral-500 mb-6">
                            The personal event management platform for organizers who value clarity and simplicity.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <SocialLink href="https://github.com/vishalcoc44" label="GitHub" icon={<Github className="w-4 h-4" />} />
                                <Link href="https://github.com/vishalcoc44" className="text-sm font-medium text-neutral-900 hover:text-blue-600 transition-colors">
                                    github.com/vishalcoc44
                                </Link>
                            </div>

                            <div className="flex items-center gap-2">

                                <SocialLink href="https://vishalsatish.tech" label="Portfolio" icon={<Briefcase className="w-4 h-4" />} />
                                <Link href="https://vishalsatish.tech" className="text-sm font-medium text-neutral-900 hover:text-blue-600 transition-colors">vishalsatish.tech</Link>
                            </div>

                            <div className="flex items-center gap-2">
                                <SocialLink href="mailto:vishalsatish44@gmail.com" label="Mail" icon={<Mail className="w-4 h-4" />} />
                                <Link href="mailto:vishalsatish44@gmail.com" className="text-sm font-medium text-neutral-900 hover:text-blue-600 transition-colors">
                                    vishalsatish44@gmail.com
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-semibold text-neutral-900 mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            <li><FooterLink href="/features">Features</FooterLink></li>
                            <li><FooterLink href="/about">About</FooterLink></li>
                        </ul>
                    </div>

                    {/* Subscribe */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="font-semibold text-neutral-900 mb-6">Stay Updated</h4>
                        <p className="text-sm text-neutral-500 mb-4">
                            Get the latest updates on new features and product releases.
                        </p>
                        <div className="flex gap-2 max-w-md">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <Button size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg">
                                Join
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
                    <p>© 2026 EventFlow. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span>Designed by Vishal S</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                        <span>v1.0.3</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="hover:text-blue-600 transition-colors block">
            {children}
        </Link>
    )
}

function SocialLink({ href, label, icon }: { href: string, label: string, icon: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
            <span className="sr-only">{label}</span>
            {icon}
        </a>
    )
}
