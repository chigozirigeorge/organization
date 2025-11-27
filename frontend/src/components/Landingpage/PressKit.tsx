// components/PressKit.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Mail, FileText, Image, Users } from 'lucide-react';

const ASSETS = [
  {
    title: "Company Logo",
    description: "High-resolution VeriNest logos in PNG and SVG formats",
    icon: Image,
    files: ["Logo (Primary).png", "Logo (White).png", "Logo (SVG).svg"]
  },
  {
    title: "Brand Guidelines",
    description: "Complete brand book with colors, typography, and usage guidelines",
    icon: FileText,
    files: ["Brand Guidelines.pdf", "Color Palette.pdf", "Typography Guide.pdf"]
  },
  {
    title: "Press Releases",
    description: "Latest company announcements and news",
    icon: FileText,
    files: ["Launch Announcement.pdf", "Funding Round.pdf", "Partnership News.pdf"]
  },
  {
    title: "Team Photos",
    description: "High-quality photos of our team and leadership",
    icon: Users,
    files: ["Team Photo.jpg", "Leadership Portraits.zip", "Office Photos.zip"]
  }
];

const PRESS_CONTACTS = [
  {
    name: "Sarah Johnson",
    role: "Head of Communications",
    email: "press@verinest.com",
    phone: "+234 800 000 0001"
  },
  {
    name: "David Chen",
    role: "Media Relations",
    email: "media@verinest.com",
    phone: "+234 800 000 0002"
  }
];

export const PressKit = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Press Kit</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Resources for journalists, bloggers, and media professionals
          </p>
        </div>

        {/* Company Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Founded</h4>
                <p className="text-muted-foreground">2024</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Headquarters</h4>
                <p className="text-muted-foreground">Lagos, Nigeria</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Mission</h4>
                <p className="text-muted-foreground">Empowering African skilled workers through technology</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">About VeriNest</h4>
              <p className="text-muted-foreground">
                VeriNest is a platform connecting skilled workers with trusted employers across Africa. 
                We provide secure payments through escrow, verified profiles, and a transparent review system 
                to build trust in the informal labor market.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Press Assets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Press Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ASSETS.map((asset, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start space-x-4">
                  <asset.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{asset.title}</CardTitle>
                    <CardDescription>{asset.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {asset.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{file}</span>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Press Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Press Contacts</CardTitle>
              <CardDescription>
                Get in touch with our media relations team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PRESS_CONTACTS.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{contact.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{contact.role}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Inquiries</CardTitle>
              <CardDescription>
                Request interviews, statements, or additional information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For interview requests, press inquiries, or additional information about VeriNest, 
                please contact our communications team.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded">
                  <h5 className="font-semibold text-sm mb-1">Response Time</h5>
                  <p className="text-xs text-muted-foreground">Within 24 hours for urgent inquiries</p>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <h5 className="font-semibold text-sm mb-1">Available For</h5>
                  <p className="text-xs text-muted-foreground">
                    Interviews, comments, expert opinions on labor markets and tech in Africa
                  </p>
                </div>
              </div>
              
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Media Inquiry
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent News */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold">VeriNest Launches to Transform African Labor Markets</h4>
                <p className="text-sm text-muted-foreground mb-2">October 15, 2024</p>
                <p className="text-sm">
                  New platform connects skilled workers with employers through secure escrow payments and verified profiles...
                </p>
                <Button variant="link" className="p-0 h-auto">Read more</Button>
              </div>
              
              <div className="border-b pb-4">
                <h4 className="font-semibold">VeriNest Secures $2M Seed Funding</h4>
                <p className="text-sm text-muted-foreground mb-2">September 1, 2024</p>
                <p className="text-sm">
                  Funding round led by African Ventures to expand operations across West Africa...
                </p>
                <Button variant="link" className="p-0 h-auto">Read more</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};