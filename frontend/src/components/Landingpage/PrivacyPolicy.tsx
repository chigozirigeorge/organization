// components/PrivacyPolicy.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString('en-NG', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <ScrollArea className="h-[600px]">
          <Card>
            <CardHeader>
              <CardTitle>VeriNest Privacy Policy</CardTitle>
              <CardDescription>
                How we collect, use, and protect your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    VeriNest ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy 
                    explains how we collect, use, disclose, and safeguard your information when you use our platform.
                  </p>
                  <p>
                    By using VeriNest, you agree to the collection and use of information in accordance with 
                    this policy.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong>2.1 Personal Information:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Name, email address, phone number</li>
                    <li>Profile information and professional credentials</li>
                    <li>Government-issued identification for verification</li>
                    <li>Bank account details for payments</li>
                  </ul>

                  <p><strong>2.2 Transaction Information:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Job details and contract terms</li>
                    <li>Payment and escrow transaction records</li>
                    <li>Communication between Users</li>
                  </ul>

                  <p><strong>2.3 Technical Information:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>IP address, browser type, device information</li>
                    <li>Usage data and platform interaction metrics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>3.1 Platform Operations:</strong> To provide and maintain our services, process transactions, and facilitate User connections.</p>
                  <p><strong>3.2 Verification:</strong> To verify User identities and professional credentials.</p>
                  <p><strong>3.3 Communication:</strong> To send service-related notices, updates, and promotional materials.</p>
                  <p><strong>3.4 Security:</strong> To monitor and enhance platform security and prevent fraud.</p>
                  <p><strong>3.5 Improvements:</strong> To analyze usage patterns and improve our services.</p>
                </div>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>4.1 With Other Users:</strong> Basic profile information is shared to facilitate connections between Workers and Employers.</p>
                  <p><strong>4.2 Service Providers:</strong> We may share information with trusted third-party service providers.</p>
                  <p><strong>4.3 Legal Requirements:</strong> We may disclose information when required by law or to protect our rights.</p>
                  <p><strong>4.4 Business Transfers:</strong> In connection with any merger or sale of company assets.</p>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We implement appropriate technical and organizational security measures to protect your personal information, including:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Encryption of sensitive data in transit and at rest</li>
                    <li>Regular security assessments and monitoring</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Secure payment processing systems</li>
                  </ul>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.</p>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>7.1 Access and Correction:</strong> You can access and update your personal information through your account settings.</p>
                  <p><strong>7.2 Data Portability:</strong> You can request a copy of your data in a machine-readable format.</p>
                  <p><strong>7.3 Deletion:</strong> You can request deletion of your personal information, subject to legal obligations.</p>
                  <p><strong>7.4 Marketing Communications:</strong> You can opt-out of promotional communications at any time.</p>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
                </div>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. International Transfers</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.</p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.</p>
                </div>
              </section>

              {/* Changes to This Policy */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.</p>
                </div>
              </section>

              {/* Contact Us */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                  <p>Email: privacy@verinest.com<br />
                  Address: Lagos, Nigeria</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};