import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  Settings, 
  User, 
  Shield, 
  Key, 
  Briefcase, 
  CreditCard,
  LogOut,
  ChevronRight,
  UserCircle,
  Lock
} from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { AccountSettings } from './AccountSettings'; 

const SettingsDropdown = () => {
  const { user, logout } = useAuth();
  const [activeModal, setActiveModal] = useState<'profile' | 'account' | null>(null);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="start" side="right">
          <DropdownMenuItem onClick={() => setActiveModal('profile')} className="cursor-pointer">
            <UserCircle className="h-4 w-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setActiveModal('account')} className="cursor-pointer">
            <Shield className="h-4 w-4 mr-2" />
            Account Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
      />

      {/* Account Settings Modal */}
      <AccountSettings
        isOpen={activeModal === 'account'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};

export default SettingsDropdown;
