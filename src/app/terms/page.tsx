'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { motion } from 'motion/react'

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="mb-8">
                        <Link href="/" className="text-primary hover:text-primary/80 mb-4 inline-block">
                            ← Back to Home
                        </Link>
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Last updated: January 2025
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <div className="bg-card border border-border rounded-lg p-8 shadow-sm space-y-8">

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    By accessing and using EventFlow, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Permission is granted to temporarily download one copy of the materials on EventFlow's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                </p>
                                <ul className="text-muted-foreground list-disc pl-6 mt-4 space-y-2">
                                    <li>Modify or copy the materials</li>
                                    <li>Use the materials for any commercial purpose or for any public display</li>
                                    <li>Attempt to reverse engineer any software contained on the EventFlow website</li>
                                    <li>Remove any copyright or other proprietary notations from the materials</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                                </p>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Event Management Services</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    EventFlow provides tools and services to help you create, manage, and promote events. You are responsible for all content you post and activities that occur under your account.
                                </p>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    We reserve the right to remove content and suspend accounts that violate our policies or applicable laws.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payment Terms</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Some features of our service may require payment. By subscribing to paid features, you agree to pay all applicable fees. Refunds are processed according to our refund policy.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Privacy Policy</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of EventFlow, to understand our practices.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Termination</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Disclaimer</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    The materials on EventFlow's website are provided on an 'as is' basis. EventFlow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitations</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    In no event shall EventFlow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EventFlow's website, even if EventFlow or a EventFlow authorized representative has been notified orally or in writing of the possibility of such damage.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Accuracy of Materials</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    The materials appearing on EventFlow's website could include technical, typographical, or photographic errors. EventFlow does not warrant that any of the materials on its website are accurate, complete, or current.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Information</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    If you have any questions about these Terms of Service, please contact us at:
                                </p>
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <p className="text-foreground"><strong>Email:</strong> legal@eventflow.com</p>
                                    <p className="text-foreground"><strong>Address:</strong> 123 Event Street, Conference City, CC 12345</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    )
}
