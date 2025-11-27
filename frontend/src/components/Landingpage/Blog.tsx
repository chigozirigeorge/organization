// components/Blog.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Calendar, User, ArrowRight, Search, Clock } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: "How Escrow Payments Are Transforming the Gig Economy in Africa",
    excerpt: "Exploring how secure payment systems are building trust and enabling growth in informal labor markets across the continent.",
    author: "Amina Okafor",
    date: "2024-11-15",
    readTime: "5 min read",
    category: "Payments",
    image: "/blog/escrow-africa.jpg",
    tags: ["Payments", "Trust", "Gig Economy"]
  },
  {
    id: 2,
    title: "Building a Portfolio: A Guide for Skilled Workers",
    excerpt: "Practical tips for workers to showcase their skills, build credibility, and attract better job opportunities.",
    author: "Chinedu Okoro",
    date: "2024-11-08",
    readTime: "4 min read",
    category: "Workers",
    image: "/blog/portfolio-guide.jpg",
    tags: ["Workers", "Portfolio", "Career Growth"]
  },
  {
    id: 3,
    title: "The Rise of Digital Skills in Traditional Trades",
    excerpt: "How carpenters, electricians, and other tradespeople are leveraging technology to grow their businesses.",
    author: "Sarah Mensah",
    date: "2024-11-01",
    readTime: "6 min read",
    category: "Technology",
    image: "/blog/digital-trades.jpg",
    tags: ["Technology", "Skills", "Innovation"]
  },
  {
    id: 4,
    title: "5 Ways Employers Can Find and Retain Great Talent",
    excerpt: "Strategies for building long-term relationships with skilled workers in a competitive market.",
    author: "David Nwankwo",
    date: "2024-10-25",
    readTime: "4 min read",
    category: "Employers",
    image: "/blog/talent-retention.jpg",
    tags: ["Employers", "Hiring", "Retention"]
  },
  {
    id: 5,
    title: "Understanding Trust Scores: How We Build Community Safety",
    excerpt: "A deep dive into our trust and verification system that keeps the VeriNest community secure.",
    author: "VeriNest Team",
    date: "2024-10-18",
    readTime: "7 min read",
    category: "Safety",
    image: "/blog/trust-scores.jpg",
    tags: ["Safety", "Trust", "Community"]
  },
  {
    id: 6,
    title: "Success Story: From Apprentice to Business Owner",
    excerpt: "How one electrician used VeriNest to build his client base and start his own contracting business.",
    author: "Fatima Abdul",
    date: "2024-10-11",
    readTime: "5 min read",
    category: "Success Stories",
    image: "/blog/success-story.jpg",
    tags: ["Success", "Entrepreneurship", "Growth"]
  }
];

const CATEGORIES = [
  "All",
  "Workers",
  "Employers",
  "Payments",
  "Technology",
  "Safety",
  "Success Stories"
];

export const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">VeriNest Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Insights, stories, and tips for workers and employers in the new world of work
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <Card className="mb-12 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-8 flex items-center justify-center">
                <div className="w-64 h-64 bg-primary/30 rounded-full flex items-center justify-center">
                  <span className="text-6xl">📈</span>
                </div>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge variant="secondary" className="w-fit mb-4">
                  {filteredPosts[0].category}
                </Badge>
                <CardTitle className="text-2xl mb-4">
                  {filteredPosts[0].title}
                </CardTitle>
                <CardDescription className="text-lg mb-4">
                  {filteredPosts[0].excerpt}
                </CardDescription>
                <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {filteredPosts[0].author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(filteredPosts[0].date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {filteredPosts[0].readTime}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {filteredPosts[0].tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button>
                  Read Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.slice(1).map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <Badge variant="secondary" className="w-fit mb-2">
                  {post.category}
                </Badge>
                <CardTitle className="text-lg line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-4">
                  {post.excerpt}
                </CardDescription>
                <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-3">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              Try a different search term or category.
            </p>
          </div>
        )}

        {/* Newsletter Subscription */}
        <Card className="mt-12 text-center">
          <CardHeader>
            <CardTitle>Stay Updated</CardTitle>
            <CardDescription>
              Get the latest articles and insights delivered to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-md mx-auto space-x-2">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button>Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};