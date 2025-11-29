import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Home, Search, Users, ArrowLeft, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="text-8xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                404
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Compass className="h-8 w-8 text-primary/30" />
              </motion.div>
            </div>
          </motion.div>

          {/* Friendly Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Oops! It seems you might have been lost
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto">
              While looking for a wonderful part of VeriNest, you have wandered off the beaten path. 
              Don't worry, even the best explorers need a little guidance sometimes!
            </p>
            
            <p className="text-lg text-primary font-medium">
              Let us help you find your way back to amazing opportunities and talented professionals.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Take Me Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard/jobs" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Browse Workers
              </Link>
            </Button>
            
            <Button asChild variant="ghost" size="lg">
              <Link to="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </Link>
            </Button>
          </motion.div>

          {/* Helpful Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">You might be looking for:</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-colors">
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Find Workers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Discover talented professionals for your projects
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-sm mt-2">
                  <Link to="/dashboard/jobs">Browse Workers →</Link>
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10 hover:border-blue-500/30 transition-colors">
                <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Post a Job
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get quotes from verified professionals
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-sm mt-2">
                  <Link to="/dashboard/post-job">Post Job →</Link>
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/10 hover:border-green-500/30 transition-colors">
                <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your projects and profile
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-sm mt-2">
                  <Link to="/dashboard">Go to Dashboard →</Link>
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                <h3 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  About VeriNest
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn more about our platform
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-sm mt-2">
                  <Link to="/about">About Us →</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed top-40 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="fixed bottom-20 left-1/4 w-24 h-24 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
  );
};
