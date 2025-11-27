// components/Careers.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Clock, DollarSign, Users, Heart, Zap } from 'lucide-react';

const OPEN_POSITIONS = [
  {
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "Lagos, Nigeria (Remote)",
    type: "Full-time",
    salary: "₦4,000,000 - ₦6,000,000",
    description: "Help build and scale our platform to serve thousands of workers and employers across Africa.",
    requirements: ["5+ years experience", "React & Node.js", "PostgreSQL", "AWS/Azure"]
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    salary: "₦3,500,000 - ₦5,000,000",
    description: "Design intuitive experiences that make it easy for workers and employers to connect and transact safely.",
    requirements: ["3+ years UX/UI design", "Figma", "User research", "Prototyping"]
  },
  {
    title: "Community Manager",
    department: "Operations",
    location: "Lagos, Nigeria",
    type: "Full-time",
    salary: "₦2,500,000 - ₦3,500,000",
    description: "Build and nurture our community of skilled workers and trusted employers.",
    requirements: ["2+ years community management", "Social media", "Event planning", "Customer support"]
  },
  {
    title: "Business Development Lead",
    department: "Growth",
    location: "Lagos, Nigeria",
    type: "Full-time",
    salary: "₦3,000,000 + Commission",
    description: "Expand our network of employers and partners across key industries.",
    requirements: ["3+ years B2B sales", "Partnership building", "Market research", "Negotiation"]
  }
];

const BENEFITS = [
  {
    icon: DollarSign,
    title: "Competitive Salary",
    description: "We pay competitively and offer performance bonuses"
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Collaborative environment with talented, mission-driven people"
  },
  {
    icon: Heart,
    title: "Health Insurance",
    description: "Comprehensive health coverage for you and your family"
  },
  {
    icon: Zap,
    title: "Flexible Work",
    description: "Remote-friendly with flexible hours and work arrangements"
  }
];

export const Careers = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Join Our Mission</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Help us build the future of work in Africa. Create opportunities for millions of skilled workers.
          </p>
          <Button size="lg">View Open Positions</Button>
        </div>

        {/* Mission */}
        <Card className="mb-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We're building a platform that empowers skilled workers across Africa to find meaningful work, 
                get paid fairly, and build sustainable careers—while helping employers find trusted talent quickly and safely.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Work With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <benefit.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
          <div className="space-y-6">
            {OPEN_POSITIONS.map((position, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{position.title}</CardTitle>
                      <CardDescription>{position.department}</CardDescription>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {position.location}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {position.type}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {position.salary}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{position.description}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {position.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No Matching Position */}
        <Card className="mt-12 text-center">
          <CardHeader>
            <CardTitle>Don't See Your Role?</CardTitle>
            <CardDescription>
              We're always looking for talented people who share our mission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Send us your resume and tell us how you can contribute to our mission.
            </p>
            <Button variant="outline">Send Open Application</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};