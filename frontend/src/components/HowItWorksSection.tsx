// HowItWorksSection.tsx
import { UserPlus, Search, FileCheck, CheckCircle } from 'lucide-react';
import { motion, Variants, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    title: 'Sign Up',
    description: 'Create your verified account as an employer or skilled worker',
    icon: UserPlus,
    step: 1,
  },
  {
    title: 'Find Match',
    description: 'Browse verified workers or available job listings with smart matching',
    icon: Search,
    step: 2,
  },
  {
    title: 'Secure Agreement',
    description: 'Set milestones and deposit funds into our secure escrow system',
    icon: FileCheck,
    step: 3,
  },
  {
    title: 'Complete & Rate',
    description: 'Finish the job and build your professional reputation',
    icon: CheckCircle,
    step: 4,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const stepVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in four simple, secure steps
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
        >
          {/* Animated connecting line */}
          <motion.div
            className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary to-accent"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{ originX: 0 }}
          />
          
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                variants={stepVariants}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <Icon className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <motion.div 
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-accent text-accent-foreground flex items-center justify-center font-bold shadow-md"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.step}
                    </motion.div>
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};