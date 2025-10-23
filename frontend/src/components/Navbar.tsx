// components/Navbar.tsx (Updated with professional avatar)
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, LogOut, User, Shield, Briefcase, Building } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/verinest.png';
import { NotificationCenter } from './NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Define the props interface for the mobile menu toggle
interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const displayName = user?.username || user?.name || 'User';

  const handleMobileMenuToggle = () => {
    setIsOpen(!isOpen);
    // Call the parent toggle function if provided (for dashboard sidebar)
    if (onMenuToggle) {
      onMenuToggle();
    }
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
      default:
        return 'User';
    }
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button - Only show when authenticated */}
            {isAuthenticated && (
              <button
                className="md:hidden"
                onClick={handleMobileMenuToggle}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6 text-foreground" />
              </button>
            )}
            
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="VeriNest" className="h-10 w-auto" />
              <span className="font-bold text-xl hidden sm:block">VeriNest</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
                  Home
                </Link>
                <Link to="/login" className="text-foreground hover:text-primary transition-colors font-medium">
                  Login
                </Link>
                <Link to="/register">
                  <Button className="font-medium">Register</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                
                {/* Professional User Avatar with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-sm shadow-md">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          @{user?.username}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getRoleIcon()}
                            <span className="capitalize">{getRoleDisplayName()}</span>
                          </div>
                          {user?.kyc_verified && (
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              user.kyc_verified === 'verified' 
                                ? 'bg-green-100 text-green-800' 
                                : user.kyc_verified === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.kyc_verified === 'verified' ? '✓ Verified' : 
                              user.kyc_verified === 'pending' ? '⏳ Pending' : '✗ Required'}
                            </span>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings" className="cursor-pointer">
                        <Menu className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile Menu Button for non-authenticated users */}
          {!isAuthenticated && (
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          )}

          {/* Mobile notification and logout for authenticated users */}
          {isAuthenticated && (
            <div className="md:hidden flex items-center space-x-2">
              <NotificationCenter />
              
              {/* Mobile User Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @{user?.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getRoleIcon()}
                          <span className="capitalize">{getRoleDisplayName()}</span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Menu className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Navigation for non-authenticated users */}
        {isOpen && !isAuthenticated && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <Link
              to="/"
              className="block text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/login"
              className="block text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full font-medium">Register</Button>
            </Link>
          </div>
        )}

        {/* Mobile user info for authenticated users */}
        {isOpen && isAuthenticated && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-foreground font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">@{user?.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {user?.role && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize flex items-center gap-1">
                    {getRoleIcon()}
                    {user.role}
                  </span>
                )}
                {user?.kyc_verified && (
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.kyc_verified === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : user.kyc_verified === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.kyc_verified === 'verified' ? 'Verified' : 
                    user.kyc_verified === 'pending' ? 'Verification Pending' : 'Verification Required'}
                  </span>
                )}
              </div>
              
              <div className="pt-2 space-y-2">
                <Link
                  to="/dashboard"
                  className="block text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="block text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-red-600 hover:text-red-700 transition-colors font-medium w-full text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};