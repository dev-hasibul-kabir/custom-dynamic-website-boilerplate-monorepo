'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { destroyLogin } from '@/libs/auth';
import { LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AppTopbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const AppTopbar = ({ onMenuToggle, isMenuOpen }: AppTopbarProps) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    const success = destroyLogin();
    if (success) {
      router.push('/auth/login');
    }
  };

  return (
    <div className="layout-topbar">
      <button
        type="button"
        onClick={onMenuToggle}
        className="p-link layout-menu-button layout-topbar-button"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/" className="layout-topbar-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/example-logo.svg" width="auto" height="100%" alt="Example" />
      </Link>

      <div className="layout-topbar-menu">
        <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="layout-topbar-button">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/auth/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppTopbar;
