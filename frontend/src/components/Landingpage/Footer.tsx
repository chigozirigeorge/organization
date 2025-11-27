// Footer.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '@/assets/verinest.png';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsAndConditions } from './TermsAndConditions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterLinks {
  platform: FooterLink[];
  company?: FooterLink[];
  support: FooterLink[];
}

export const Footer = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const getFooterLinks = (): FooterLinks => {
    if (isAuthenticated) {
      return {
        platform: [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Browse Jobs', href: '/jobs' },
          { name: 'My Contracts', href: '/contracts' },
          { name: 'Wallet', href: '/wallet' },
        ],
        support: [
          { name: 'Help Center', href: '/help' },
          { name: 'Contact Support', href: '/support' },
          { name: 'Dispute Resolution', href: '/disputes' },
          { name: 'Safety Guidelines', href: '/safety' },
        ]
      };
    }

    return {
      platform: [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'For Workers', href: '/register?role=worker' },
        { name: 'For Employers', href: '/register?role=employer' },
        { name: 'Success Stories', href: '#success' },
      ],
      company: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press Kit', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ],
      support: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Privacy Policy', href: '#', external: false },
        { name: 'Terms of Service', href: '#', external: false },
      ]
    };
  };

  const footerLinks = getFooterLinks();

  const handleLegalLinkClick = (name: string) => {
    if (name === 'Privacy Policy') {
      setActiveModal('privacy');
    } else if (name === 'Terms of Service') {
      setActiveModal('terms');
    }
  };

  return (
    <>
      <footer className={`${isHomePage ? 'bg-gradient-to-b from-background to-muted/30' : 'bg-card'} border-t border-border`}>
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-4">
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src={logo} alt="VeriNest" className="h-8 w-auto" />
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  VeriNest
                </span>
              </motion.div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connecting skilled workers with trusted employers through secure, verified transactions and escrow-protected payments.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>support@verinest.com</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+234 800 000 0000</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 pt-2">
                {[
                  { href: "https://www.facebook.com/profile.php?id=61581053168889", icon: Facebook },
                  { href: "https://x.com/VeriNest_org", icon: Twitter },
                  { href: "#", icon: Instagram },
                  { href: "https://www.linkedin.com/company/verinest-org", icon: Linkedin }
                ].map((social, index) => (
                  <motion.a
                    key={social.href}
                    href={social.href}
                    target='_blank'
                    className="text-muted-foreground hover:text-primary transition-colors"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Platform</h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            {!isAuthenticated && footerLinks.company && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Company</h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link 
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    {link.name === 'Privacy Policy' || link.name === 'Terms of Service' ? (
                      <button
                        onClick={() => handleLegalLinkClick(link.name)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link 
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {/* Trust Badges */}
              {isHomePage && (
                <motion.div 
                  className="pt-4 border-t border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Secure Escrow Payments</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Verified Professionals</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Newsletter Section */}
          {isHomePage && !isAuthenticated && (
            <motion.div 
              className="mt-12 pt-8 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="max-w-md mx-auto text-center">
                <h3 className="font-semibold mb-2">Stay Updated</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest job opportunities and platform updates
                </p>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <motion.button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          {isHomePage && !isAuthenticated && (
            <motion.div 
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { number: "10K+", label: "Verified Workers" },
                { number: "5K+", label: "Jobs Completed" },
                { number: "₦500M+", label: "Total Payments" },
                { number: "98%", label: "Success Rate" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-primary">{stat.number}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 bg-muted/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-sm text-muted-foreground">
                © 2025 VeriNest. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>Powered by Code. Verified by Community.</span>
                
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user.email_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs">
                      {user.email_verified ? 'Account Verified' : 'Verify Email'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <AnimatePresence>
        {activeModal && (
          <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>
                  {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'}
                </DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="overflow-y-auto max-h-[70vh]"
              >
                {activeModal === 'privacy' ? <PrivacyPolicy /> : <TermsAndConditions />}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};