// components/Navbar.tsx (Professional Revamp)
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Menu, LogOut, User, Shield, Briefcase, Building, X, ChevronDown, Star, CheckCircle, ArrowRight, Users, Wrench, Home, FileText, CreditCard, HelpCircle, Settings, Hammer, PaintBucket, Zap, Camera, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/verinest.png';
import { NotificationCenter } from '../shared/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api';
import { uploadToCloudinary, uploadToBackend } from '../../utils/cloudinary';

interface NavbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export const Navbar = ({ onMenuToggle, sidebarOpen }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, user, logout, refreshUser } = useAuth();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Service categories for dropdown
  const serviceCategories = [
    {
      title: "For Workers",
      description: "Find opportunities and grow your career",
      icon: <Briefcase className="h-5 w-5" />,
      items: [
        { title: "Browse Jobs", href: "/jobs", icon: <Hammer className="h-4 w-4" /> },
        { title: "Create Profile", href: "/register?role=worker", icon: <Users className="h-4 w-4" /> },
        { title: "Portfolio Management", href: "/dashboard/portfolio", icon: <FileText className="h-4 w-4" /> },
        { title: "Skills Verification", href: "/dashboard/verification", icon: <CheckCircle className="h-4 w-4" /> },
      ]
    },
    {
      title: "For Employers", 
      description: "Hire verified professionals",
      icon: <Building className="h-5 w-5" />,
      items: [
        { title: "Post a Job", href: "/dashboard/post-job", icon: <Wrench className="h-4 w-4" /> },
        { title: "Find Workers", href: "/workers", icon: <Users className="h-4 w-4" /> },
        { title: "Manage Contracts", href: "/contracts", icon: <FileText className="h-4 w-4" /> },
        { title: "Escrow Services", href: "/dashboard/escrow", icon: <CreditCard className="h-4 w-4" /> },
      ]
    },
    {
      title: "For Vendors",
      description: "Offer services and products",
      icon: <Settings className="h-5 w-5" />,
      items: [
        { title: "Create Vendor Profile", href: "/register?role=vendor", icon: <Users className="h-4 w-4" /> },
        { title: "List Services", href: "/dashboard/vendor/services", icon: <FileText className="h-4 w-4" /> },
        { title: "Manage Subscriptions", href: "/dashboard/vendor/subscription", icon: <CreditCard className="h-4 w-4" /> },
        { title: "View Analytics", href: "/dashboard/vendor/analytics", icon: <Settings className="h-4 w-4" /> },
      ]
    },
    {
      title: "Services",
      description: "Platform features and tools",
      icon: <Zap className="h-5 w-5" />,
      items: [
        { title: "Construction", href: "/services/construction", icon: <Home className="h-4 w-4" /> },
        { title: "Painting & Decor", href: "/services/painting", icon: <PaintBucket className="h-4 w-4" /> },
        { title: "Plumbing", href: "/services/plumbing", icon: <Wrench className="h-4 w-4" /> },
        { title: "Electrical", href: "/services/electrical", icon: <Zap className="h-4 w-4" /> },
        { title: "All Services", href: "/services", icon: <ArrowRight className="h-4 w-4" /> },
      ]
    },
    {
      title: "Resources",
      description: "Help and support center",
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        { title: "How It Works", href: "#how-it-works", icon: <HelpCircle className="h-4 w-4" /> },
        { title: "Safety Guidelines", href: "/safety", icon: <Shield className="h-4 w-4" /> },
        { title: "Help Center", href: "/help", icon: <HelpCircle className="h-4 w-4" /> },
        { title: "Contact Support", href: "/contact", icon: <Settings className="h-4 w-4" /> },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Call the parent toggle function if provided (for dashboard sidebar)
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Step 1: Upload to Cloudinary
      const cloudinaryResponse = await uploadToCloudinary(file);
      
      // Step 2: Send the Cloudinary URL to backend using correct endpoint
      const response = await apiClient.put('/users/avatar', {
        avatar_url: cloudinaryResponse.secure_url
      });

      toast.success('Profile photo updated successfully!');
      await refreshUser(); // Refresh user data to get new avatar URL
    } catch (error: any) {
      console.error('Error uploading profile photo:', error);
      toast.error(error.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Get role icon
  const getRoleIcon = () => {
    switch (user?.role) {
      case 'worker':
        return <Briefcase className="h-3 w-3" />;
      case 'employer':
        return <Building className="h-3 w-3" />;
      case 'verifier':
        return <Shield className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'customer_care':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'worker':
        return 'Worker';
      case 'employer':
        return 'Employer';
      case 'verifier':
        return 'Verifier';
      case 'admin':
        return 'Admin';
      case 'customer_care':
        return 'Customer Care';
      default:
        return 'User';
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50' 
          : 'bg-white/90 backdrop-blur-sm border-b border-border/30'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18">
            {/* Left side - Logo and mobile menu button */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button - Only shows for non-authenticated users on mobile */}
              {!isAuthenticated && (
                <motion.button
                  onClick={handleMobileMenuToggle}
                  aria-label="Toggle menu"
                  className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 text-slate-700" />
                  ) : (
                    <Menu className="h-5 w-5 text-slate-700" />
                  )}
                </motion.button>
              )}
              
              {/* Dashboard Sidebar Toggle - Shows for authenticated users */}
              {isAuthenticated && onMenuToggle && (
                <motion.button
                  onClick={onMenuToggle}
                  aria-label="Toggle sidebar"
                  className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5 text-slate-700" />
                  ) : (
                    <Menu className="h-5 w-5 text-slate-700" />
                  )}
                </motion.button>
              )}
              
              {/* Single Mobile Menu Button - Shows for authenticated users on desktop */}
              {isAuthenticated && (
                <motion.button
                  onClick={onMenuToggle}
                  aria-label="Toggle menu"
                  className="hidden lg:block p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5 text-slate-700" />
                  ) : (
                    <Menu className="h-5 w-5 text-slate-700" />
                  )}
                </motion.button>
              )}
              
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="relative">
                  <img src={logo} alt="VeriNest" className="h-11 w-auto rounded-lg drop-shadow-sm" />
                  {/* Subtle glow effect - adjusted for better merge */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/10 rounded-lg blur-xl -z-10"></div>
                </div>
                {!isAuthenticated && (
                  <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:block">
                  VeriNest
                </span>
                )}
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {!isAuthenticated ? (
                <motion.div 
                  className="flex items-center space-x-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link 
                    to="/" 
                    className="relative text-slate-700 hover:text-primary transition-all duration-200 font-medium group"
                  >
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                  </Link>
                  
                  {/* Workers Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="ghost" 
                          className="relative text-slate-700 hover:text-primary transition-all duration-200 font-medium group px-3 py-2 h-auto flex items-center space-x-1"
                        >
                          <span>Workers</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 shadow-2xl border-0 p-0" align="center">
                      <div className="bg-white rounded-xl overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                              <Briefcase className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">For Workers</h4>
                              <p className="text-sm text-slate-500">Find opportunities and grow your career</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {serviceCategories[0].items.map((item) => (
                              <DropdownMenuItem asChild key={item.title} className="hover:bg-slate-100 transition-colors rounded-md p-3">
                                <Link to={item.href} className="flex items-center space-x-3 text-sm text-slate-600 hover:text-primary">
                                  <span className="text-primary p-1.5 rounded bg-primary/5">{item.icon}</span>
                                  <span>{item.title}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Employers Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="ghost" 
                          className="relative text-slate-700 hover:text-primary transition-all duration-200 font-medium group px-3 py-2 h-auto flex items-center space-x-1"
                        >
                          <span>Employers</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 shadow-2xl border-0 p-0" align="center">
                      <div className="bg-white rounded-xl overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                              <Building className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">For Employers</h4>
                              <p className="text-sm text-slate-500">Hire verified professionals</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {serviceCategories[1].items.map((item) => (
                              <DropdownMenuItem asChild key={item.title} className="hover:bg-slate-100 transition-colors rounded-md p-3">
                                <Link to={item.href} className="flex items-center space-x-3 text-sm text-slate-600 hover:text-primary">
                                  <span className="text-primary p-1.5 rounded bg-primary/5">{item.icon}</span>
                                  <span>{item.title}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Vendors Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="ghost" 
                          className="relative text-slate-700 hover:text-primary transition-all duration-200 font-medium group px-3 py-2 h-auto flex items-center space-x-1"
                        >
                          <span>Vendors</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 shadow-2xl border-0 p-0" align="center">
                      <div className="bg-white rounded-xl overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                              <Settings className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">For Vendors</h4>
                              <p className="text-sm text-slate-500">Offer services and products</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {serviceCategories[2].items.map((item) => (
                              <DropdownMenuItem asChild key={item.title} className="hover:bg-slate-100 transition-colors rounded-md p-3">
                                <Link to={item.href} className="flex items-center space-x-3 text-sm text-slate-600 hover:text-primary">
                                  <span className="text-primary p-1.5 rounded bg-primary/5">{item.icon}</span>
                                  <span>{item.title}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register">
                      <Button className="font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 px-6">
                        Get Started
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NotificationCenter />
                  </motion.div>
                  
                  {/* Professional User Avatar with Upload - Separate from Dropdown */}
                  <div className="relative group">
                    <div className="relative">
                      <Avatar className="h-11 w-11 cursor-pointer" onClick={triggerFileInput}>
                        <AvatarImage 
                          src={user?.avatar_url} 
                          alt={user?.name || 'Profile'}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=44`;
                          }}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Upload button overlay */}
                      <div 
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={triggerFileInput}
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4 text-white" />
                        )}
                      </div>
                      
                      {/* Online status indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Dropdown Menu - Separate from Avatar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 shadow-xl border-0" align="end">
                      <DropdownMenuLabel className="pb-3">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={user?.avatar_url} 
                                alt={user?.name || 'Profile'}
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=40`;
                                }}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                              <p className="text-xs text-slate-500">@{user?.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              {getRoleIcon()}
                              <span className="capitalize">{getRoleDisplayName()}</span>
                            </div>
                            {user?.kyc_verified && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                user.kyc_verified === 'verified' 
                                  ? 'bg-green-100 text-green-700' 
                                  : user.kyc_verified === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {user.kyc_verified === 'verified' ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </>
                                ) : user.kyc_verified === 'pending' ? (
                                  <>
                                    <Star className="h-3 w-3" />
                                    Pending
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3" />
                                    Required
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="hover:bg-slate-50 transition-colors">
                        <Link to="/dashboard" className="cursor-pointer flex items-center">
                          <User className="h-4 w-4 mr-3 text-slate-600" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-slate-50 transition-colors">
                        <Link to="/dashboard/settings" className="cursor-pointer flex items-center">
                          <Shield className="h-4 w-4 mr-3 text-slate-600" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Mobile Navigation for non-authenticated users */}
            {!isAuthenticated && (
              <div className="lg:hidden flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register">
                    <Button className="font-medium text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 px-4">
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile User Avatar for authenticated users */}
            {isAuthenticated && (
              <div className="lg:hidden flex items-center space-x-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <NotificationCenter />
                </motion.div>
                
                {/* Mobile User Avatar with Upload - Separate from Dropdown */}
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <Avatar className="h-10 w-10 cursor-pointer" onClick={triggerFileInput}>
                      <AvatarImage 
                        src={user?.avatar_url} 
                        alt={user?.name || 'Profile'}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=40`;
                        }}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-xs">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload button overlay */}
                    <div 
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="h-3 w-3 text-white animate-spin" />
                      ) : (
                        <Camera className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  {/* Mobile Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 shadow-lg border-0" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500">@{user?.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            {getRoleIcon()}
                            <span className="capitalize">{getRoleDisplayName()}</span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="hover:bg-slate-50 transition-colors">
                      <Link to="/dashboard" className="cursor-pointer flex items-center">
                        <User className="h-4 w-4 mr-3 text-slate-600" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-slate-50 transition-colors">
                      <Link to="/dashboard/settings" className="cursor-pointer flex items-center">
                        <Shield className="h-4 w-4 mr-3 text-slate-600" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Only shows for non-authenticated users */}
      <AnimatePresence>
        {isMobileMenuOpen && !isAuthenticated && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={closeMobileMenu}
            />
            
            {/* Mobile Menu Content */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img src={logo} alt="VeriNest" className="h-8 w-auto" />
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      VeriNest
                    </span>
                  </div>
                  <motion.button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5 text-slate-700" />
                  </motion.button>
                </div>
                
                <div className="space-y-6">
                  <Link 
                    to="/" 
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                  >
                    <Home className="h-5 w-5 text-primary" />
                    <span>Home</span>
                  </Link>
                  
                  {/* Mobile Services Section */}
                  <div className="space-y-4">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Services
                    </div>
                    
                    {/* Workers Section */}
                    <div className="px-4 space-y-3">
                      <div className="flex items-center space-x-3 py-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">Workers</div>
                          <div className="text-sm text-slate-500">Find opportunities</div>
                        </div>
                      </div>
                      <div className="pl-4 space-y-1">
                        {serviceCategories[0].items.map((item) => (
                          <Link 
                            key={item.title}
                            to={item.href} 
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm"
                          >
                            <span className="text-primary text-sm">{item.icon}</span>
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Employers Section */}
                    <div className="px-4 space-y-3">
                      <div className="flex items-center space-x-3 py-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">Employers</div>
                          <div className="text-sm text-slate-500">Hire professionals</div>
                        </div>
                      </div>
                      <div className="pl-4 space-y-1">
                        {serviceCategories[1].items.map((item) => (
                          <Link 
                            key={item.title}
                            to={item.href} 
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm"
                          >
                            <span className="text-primary text-sm">{item.icon}</span>
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Vendors Section */}
                    <div className="px-4 space-y-3">
                      <div className="flex items-center space-x-3 py-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Settings className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">Vendors</div>
                          <div className="text-sm text-slate-500">Offer services</div>
                        </div>
                      </div>
                      <div className="pl-4 space-y-1">
                        {serviceCategories[2].items.map((item) => (
                          <Link 
                            key={item.title}
                            to={item.href} 
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm"
                          >
                            <span className="text-primary text-sm">{item.icon}</span>
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Services & Resources */}
                    <div className="px-4 space-y-3">
                      <div className="flex items-center space-x-3 py-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">Services</div>
                          <div className="text-sm text-slate-500">Platform features</div>
                        </div>
                      </div>
                      <div className="pl-4 space-y-1">
                        {serviceCategories[3].items.map((item) => (
                          <Link 
                            key={item.title}
                            to={item.href} 
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm"
                          >
                            <span className="text-primary text-sm">{item.icon}</span>
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div className="px-4 space-y-3">
                      <div className="flex items-center space-x-3 py-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">Resources</div>
                          <div className="text-sm text-slate-500">Help & support</div>
                        </div>
                      </div>
                      <div className="pl-4 space-y-1">
                        {serviceCategories[4].items.map((item) => (
                          <Link 
                            key={item.title}
                            to={item.href} 
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm"
                          >
                            <span className="text-primary text-sm">{item.icon}</span>
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {isAuthenticated && (
                    <>
                      <div className="border-t border-border/50 pt-4">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Account
                        </div>
                        <Link 
                          to="/dashboard" 
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                        >
                          <User className="h-5 w-5 text-primary" />
                          <span>Dashboard</span>
                        </Link>
                        <Link 
                          to="/jobs" 
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                        >
                          <Briefcase className="h-5 w-5 text-primary" />
                          <span>Browse Jobs</span>
                        </Link>
                        <Link 
                          to="/contracts" 
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          <span>My Contracts</span>
                        </Link>
                        <Link 
                          to="/wallet" 
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                        >
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span>Wallet</span>
                        </Link>
                      </div>
                      <div className="border-t border-border/50 pt-4">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                  
                  {!isAuthenticated && (
                    <div className="border-t border-border/50 pt-4">
                      <Link 
                        to="/register" 
                        onClick={closeMobileMenu}
                        className="block mx-4 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium text-center transition-all duration-200"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};