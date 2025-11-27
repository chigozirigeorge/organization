// components/AboutUs.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Shield, TrendingUp, Heart } from 'lucide-react';

export const AboutUs = () => {
  const teamMembers = [
    {
      name: "David George Chigoziri",
      role: "Founder & Backend Dev",
      description: "Former tech lead with passion for empowering local talent"
    },
    {
      name: "Jessica Mbah",
      role: "Co-Founder & Head of Operations",
      description: "Experienced in marketplace operations and user experience"
    },
    {
      name: "Lucky Abuvfe",
      role: "CTO",
      description: "Full-stack developer focused on secure, scalable systems"
    },
    {
      name: "Grace Chukwu",
      role: "Community Manager",
      description: "Building trust and relationships within our user community"
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Verified professionals and secure escrow payments for peace of mind"
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a platform that serves both workers and employers equally"
    },
    {
      icon: TrendingUp,
      title: "Growth & Opportunity",
      description: "Creating economic opportunities for skilled professionals"
    },
    {
      icon: Heart,
      title: "Customer Focus",
      description: "Listening to our users and continuously improving their experience"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About VeriNest</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building Nigeria's most trusted platform for connecting skilled workers with opportunities, 
            one secure transaction at a time.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">For Workers</h3>
                <p className="text-muted-foreground">
                  To provide skilled professionals with fair access to opportunities, 
                  timely payments, and the tools they need to grow their businesses 
                  and build sustainable careers.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">For Employers</h3>
                <p className="text-muted-foreground">
                  To connect individuals and businesses with verified, skilled workers 
                  they can trust, with the security of escrow protection and quality 
                  assurance for every project.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <value.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              VeriNest was founded in 2024 with a simple observation: Nigeria is filled with 
              incredibly talented skilled workers, but finding reliable opportunities and 
              getting paid fairly remained significant challenges.
            </p>
            <p>
              Our founder, Chinedu, witnessed firsthand how skilled professionals struggled 
              with inconsistent work, late payments, and lack of trust from potential clients. 
              At the same time, employers found it difficult to identify qualified, reliable 
              workers for their projects.
            </p>
            <p>
              We built VeriNest to bridge this gap - creating a platform that not only connects 
              talent with opportunity but also ensures security, trust, and fair treatment 
              for everyone involved.
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Our Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-sm text-muted-foreground">Verified Workers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-sm text-muted-foreground">Jobs Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">₦500M+</div>
                <div className="text-sm text-muted-foreground">Total Payments</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};