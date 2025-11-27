// components/HelpCenter.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Mail, MessageCircle, FileText } from 'lucide-react';

const FAQS = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create an account?",
        answer: "Click on the 'Sign Up' button in the top right corner, choose your role (Worker or Employer), fill in your details, and verify your email address."
      },
      {
        question: "What's the difference between a worker and employer account?",
        answer: "Workers can browse and apply for jobs, build their portfolio, and get paid for completed work. Employers can post jobs, hire workers, and manage projects."
      },
      {
        question: "Is there a fee to use VeriNest?",
        answer: "We charge a 3% platform fee on successful job completions. There are no upfront costs for posting jobs or creating a worker profile."
      }
    ]
  },
  {
    category: "Payments & Escrow",
    questions: [
      {
        question: "How does escrow work?",
        answer: "Funds are held securely in escrow until work is completed and approved. This protects both workers and employers."
      },
      {
        question: "When do workers get paid?",
        answer: "Payment is released after the employer approves the completed work. For partial payments, milestones must be met as agreed in the contract."
      },
      {
        question: "What payment methods are supported?",
        answer: "We support bank transfers and mobile money payments through our secure wallet system."
      }
    ]
  },
  {
    category: "Jobs & Contracts",
    questions: [
      {
        question: "How do I post a job?",
        answer: "Go to your dashboard, click 'Post a Job', fill in the details, set your budget, and publish. Workers in your area will be notified."
      },
      {
        question: "What makes a good job description?",
        answer: "Be clear about the work needed, timeline, budget, and any specific skills required. Include photos if possible."
      },
      {
        question: "How are workers selected?",
        answer: "You can review applications, check worker profiles and ratings, and conduct interviews before making a selection."
      }
    ]
  },
  {
    category: "Trust & Safety",
    questions: [
      {
        question: "How are workers verified?",
        answer: "We verify identity documents, work experience, and portfolio items. Workers also build trust through ratings and completed jobs."
      },
      {
        question: "What if there's a dispute?",
        answer: "We have a dispute resolution process where our team mediates between parties to find a fair solution."
      },
      {
        question: "Is my personal information safe?",
        answer: "We use industry-standard encryption and never share your personal information with third parties without your consent."
      }
    ]
  }
];

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQS.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions and get support
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Email Support</CardTitle>
              <CardDescription>Get help via email</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Send us a detailed message and we'll respond within 24 hours
              </p>
              <Button asChild>
                <a href="mailto:support@verinest.com">Email Us</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>Instant messaging support</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our support team in real-time during business hours
              </p>
              <Button variant="outline">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Guides and tutorials</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our comprehensive guides and video tutorials
              </p>
              <Button variant="outline">View Guides</Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFAQs.map((category) => (
            <div key={category.category}>
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try different keywords or contact our support team for help.
            </p>
          </div>
        )}

        {/* Emergency Support */}
        <Card className="mt-12 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Emergency Support</CardTitle>
            <CardDescription>
              Need immediate assistance with an urgent issue?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Phone:</strong> +234 800 000 0000 (24/7)
              </p>
              <p className="text-sm">
                <strong>Email:</strong> emergency@verinest.com
              </p>
              <p className="text-sm text-muted-foreground">
                For disputes, safety concerns, or payment emergencies
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};