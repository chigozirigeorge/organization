// components/ProtectedLayout.tsx
import { useAuth } from '../../contexts/AuthContext';
import { RoleSelection } from './RoleSelection';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const { isAuthenticated, user, refreshUser } = useAuth();

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  // If user doesn't have a role, show role selection
  if (user && !user.role) {
    return <RoleSelection />;
  }

  // User has a role, show the protected content
  return <>{children}</>;
};