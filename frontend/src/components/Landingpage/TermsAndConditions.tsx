// components/TermsAndConditions.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
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
              <CardTitle>VeriNest Platform Agreement</CardTitle>
              <CardDescription>
                Please read these terms carefully before using our platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Welcome to VeriNest ("Platform," "we," "our," "us"). These Terms and Conditions 
                    govern your use of our platform that connects skilled workers ("Workers") with 
                    individuals and businesses seeking services ("Employers").
                  </p>
                  <p>
                    By accessing or using VeriNest, you agree to be bound by these Terms. If you 
                    disagree with any part of these Terms, you may not access our platform.
                  </p>
                </div>
              </section>

              {/* Definitions */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>"Platform"</strong> refers to the VeriNest website, mobile application, and related services.</p>
                  <p><strong>"Worker"</strong> refers to skilled professionals registered on the platform to provide services.</p>
                  <p><strong>"Employer"</strong> refers to individuals or businesses seeking to hire Workers.</p>
                  <p><strong>"Job"</strong> refers to a service request posted by an Employer.</p>
                  <p><strong>"Contract"</strong> refers to the agreement between Worker and Employer for a specific Job.</p>
                  <p><strong>"Escrow"</strong> refers to the secure payment holding system used on the platform.</p>
                </div>
              </section>

              {/* Account Registration */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>3.1 Eligibility:</strong> You must be at least 18 years old and have the legal capacity to enter into binding contracts.</p>
                  <p><strong>3.2 Account Information:</strong> You agree to provide accurate, current, and complete information during registration.</p>
                  <p><strong>3.3 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
                  <p><strong>3.4 Verification:</strong> We may require identity verification for certain transactions or account features.</p>
                </div>
              </section>

              {/* Platform Services */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Platform Services</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>4.1 Service Marketplace:</strong> VeriNest provides a platform for connecting Workers and Employers.</p>
                  <p><strong>4.2 Escrow Services:</strong> We provide secure payment escrow services for completed Jobs.</p>
                  <p><strong>4.3 Dispute Resolution:</strong> We offer mediation services for disputes between Users.</p>
                  <p><strong>4.4 Limitations:</strong> We are not a party to contracts between Workers and Employers.</p>
                </div>
              </section>

              {/* Payments and Fees */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Payments and Fees</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>5.1 Service Fee:</strong> We charge a 3% platform fee on all successful transactions.</p>
                  <p><strong>5.2 Escrow Payments:</strong> All payments are held in escrow until Job completion and approval.</p>
                  <p><strong>5.3 Payment Release:</strong> Payments are released to Workers upon Employer approval or dispute resolution.</p>
                  <p><strong>5.4 Refunds:</strong> Refund policies are determined on a per-Job basis as outlined in the Contract.</p>
                </div>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. User Responsibilities</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>6.1 Worker Responsibilities:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Provide services with professional skill and care</li>
                    <li>Complete Jobs within agreed timelines</li>
                    <li>Maintain adequate insurance where required</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                  
                  <p><strong>6.2 Employer Responsibilities:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Provide clear and accurate Job descriptions</li>
                    <li>Fund escrow before work commencement</li>
                    <li>Provide necessary access and materials</li>
                    <li>Review and approve completed work promptly</li>
                  </ul>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>7.1 Platform Content:</strong> All platform content, features, and functionality are owned by VeriNest.</p>
                  <p><strong>7.2 User Content:</strong> Users retain ownership of content they create and share on the platform.</p>
                  <p><strong>7.3 License:</strong> By posting content, you grant VeriNest a license to display and distribute that content.</p>
                </div>
              </section>

              {/* Dispute Resolution */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>8.1 Mediation:</strong> Users agree to attempt mediation through VeriNest before pursuing legal action.</p>
                  <p><strong>8.2 Escrow Disputes:</strong> Disputed escrow payments will be held until resolution.</p>
                  <p><strong>8.3 Platform Decision:</strong> VeriNest's decision in disputes is final and binding.</p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>VeriNest shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.</p>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We may suspend or terminate your account for violations of these Terms or for any other reason at our discretion.</p>
                </div>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>If you have any questions about these Terms, please contact us at:</p>
                  <p>Email: legal@verinest.com<br />
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