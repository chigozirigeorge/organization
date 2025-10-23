// FeatureGrid.tsx
import { Shield, Lock, Award, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, Variants, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    title: 'Verified Workers',
    description: 'Every worker is KYC-verified and rated by past employers with comprehensive background checks.',
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Escrow Protection',
    description: 'Secure milestone payments managed transparently via smart contracts with automated release conditions.',
    icon: Lock,
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Trust Points System',
    description: 'Earn and grow your reputation with every successful job completion and positive feedback.',
    icon: Award,
    color: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Dispute Resolution',
    description: 'Independent verifiers ensure fairness and accountability with rapid resolution processes.',
    icon: Scale,
    color: 'from-purple-500 to-pink-500',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const FeatureGrid = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">VeriNest</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on trust, transparency, and cutting-edge technology to revolutionize labor markets
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <motion.div 
                      className={`h-14 w-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};