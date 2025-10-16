// components/Navbar.tsx (Updated for authenticated users)
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/verinest.png';
import { NotificationCenter } from './NotificationCenter';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="VeriNest" className="h-10 w-auto" />
            <span className="font-bold text-xl">VeriNest</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/login" className="text-foreground hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Hi, {user?.name}</span>
                  {user?.role && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize">
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
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="block text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="pt-4 border-t border-border">
                  <p className="text-foreground">Hi, {user?.name}</p>
                  {user?.role && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs capitalize mt-2 inline-block">
                      {user.role}
                    </span>
                  )}
                  <Button variant="outline" onClick={handleLogout} className="w-full mt-4">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};