'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { motion } from 'motion/react'

export default function PrivacyPage() {
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
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Last updated: January 2025
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <div className="bg-card border border-border rounded-lg p-8 shadow-sm space-y-8">

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    At EventFlow, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                                <h3 className="text-xl font-medium text-foreground mb-3">Personal Information</h3>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    We may collect personally identifiable information that you provide to us, including:
                                </p>
                                <ul className="text-muted-foreground list-disc pl-6 mb-4 space-y-1">
                                    <li>Name and contact information</li>
                                    <li>Email address and phone number</li>
                                    <li>Account credentials</li>
                                    <li>Payment information</li>
                                    <li>Profile information and preferences</li>
                                </ul>

                                <h3 className="text-xl font-medium text-foreground mb-3">Usage Information</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We automatically collect certain information about your use of our platform, including:
                                </p>
                                <ul className="text-muted-foreground list-disc pl-6 mt-2 space-y-1">
                                    <li>IP address and location data</li>
                                    <li>Browser type and version</li>
                                    <li>Pages visited and time spent</li>
                                    <li>Device information</li>
                                    <li>Event interactions and preferences</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    We use the collected information for various purposes, including:
                                </p>
                                <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                                    <li><strong>Service Provision:</strong> To provide and maintain our event management platform</li>
                                    <li><strong>Account Management:</strong> To create and manage your account</li>
                                    <li><strong>Communication:</strong> To send you important updates and notifications</li>
                                    <li><strong>Event Management:</strong> To facilitate event creation, registration, and management</li>
                                    <li><strong>Analytics:</strong> To improve our services and user experience</li>
                                    <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
                                    <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing and Disclosure</h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                                </p>
                                <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                                    <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                    <li><strong>Consent:</strong> With your explicit consent</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                                </p>
                                <ul className="text-muted-foreground list-disc pl-6 mt-4 space-y-1">
                                    <li>Encryption of data in transit and at rest</li>
                                    <li>Regular security audits and updates</li>
                                    <li>Access controls and authentication requirements</li>
                                    <li>Secure data storage and backup procedures</li>
                                    <li>Employee training on data protection</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies and Tracking</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Depending on your location, you may have the following rights regarding your personal information:
                                </p>
                                <ul className="text-muted-foreground list-disc pl-6 space-y-1">
                                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                                    <li><strong>Portability:</strong> Request transfer of your data</li>
                                    <li><strong>Objection:</strong> Object to processing of your personal information</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Data Transfers</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to This Policy</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Us</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <p className="text-foreground"><strong>Email:</strong> privacy@eventflow.com</p>
                                    <p className="text-foreground"><strong>Address:</strong> 123 Event Street, Conference City, CC 12345</p>
                                    <p className="text-foreground"><strong>Data Protection Officer:</strong> dpo@eventflow.com</p>
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
