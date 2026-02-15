import Link from 'next/link'
import { Button } from './ui/button'
import { Github, Mail, Briefcase, ExternalLink, ArrowRight } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-24 pb-12 relative overflow-hidden z-10">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="absolute -top-24 left-[10%] w-[30%] h-48 bg-primary/5 blur-[100px] rounded-full" />

            <div className="container mx-auto px-6 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="space-y-4">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <img src="/logo.svg" alt="EventFlow" className="h-6 w-6 invert" />
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tighter">EventFlow</span>
                            </Link>
                            <p className="text-slate-500 text-lg leading-relaxed max-w-sm">
                                The sophisticated event management platform for visionary organizers who demand excellence.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Connectivity</h4>
                            <div className="flex flex-col gap-4">
                                <ContactLink href="https://github.com/vishalcoc44" icon={<Github className="w-4 h-4" />} label="GitHub" value="github.com/vishalcoc44" />
                                <ContactLink href="https://vishalsatish.tech" icon={<Briefcase className="w-4 h-4" />} label="Portfolio" value="vishalsatish.tech" />
                                <ContactLink href="mailto:vishalsatish44@gmail.com" icon={<Mail className="w-4 h-4" />} label="Mail" value="vishalsatish44@gmail.com" />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="lg:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Environment</h4>
                        <ul className="space-y-5">
                            <li><NavLink href="/features">Advanced Features</NavLink></li>
                            <li><NavLink href="/about">Our Philosophy</NavLink></li>
                            <li><NavLink href="/admin/dashboard">Operational Hub</NavLink></li>
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="lg:col-span-4 space-y-8 p-8 rounded-[32px] bg-slate-50/50 border border-slate-100/50 backdrop-blur-sm">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Intelligence</h4>
                            <h3 className="text-xl font-bold text-slate-900">Stay Synchronized</h3>
                            <p className="text-sm text-slate-500 font-medium">Receive low-latency updates on protocols and new capabilities.</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                                <Button className="absolute right-2 top-2 h-10 w-10 bg-slate-900 text-white hover:bg-slate-800 rounded-xl p-0 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                    <ArrowRight size={18} />
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Zero-SPAM GUARANTEE</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            © 2026 EventFlow Core. All systems operational.
                        </p>
                        <div className="hidden md:block w-[1px] h-4 bg-slate-200" />
                        <div className="flex items-center gap-6">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Designed by Vishal S
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                            Build v1.0.3 Stable
                        </span>
                        <div className="flex items-center gap-2 text-slate-300 hover:text-slate-900 transition-colors cursor-pointer">
                            <ExternalLink size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Network Status</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-slate-600 hover:text-primary font-bold text-sm tracking-tight transition-all flex items-center gap-2 group"
        >
            <div className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-300" />
            {children}
        </Link>
    )
}

function ContactLink({ href, label, icon, value }: { href: string, label: string, icon: React.ReactNode, value: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 group/link"
        >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/link:bg-primary/10 group-hover/link:text-primary transition-all duration-300">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</span>
                <span className="text-sm font-bold text-slate-900 group-hover/link:text-primary transition-colors">{value}</span>
            </div>
        </a>
    )
}
