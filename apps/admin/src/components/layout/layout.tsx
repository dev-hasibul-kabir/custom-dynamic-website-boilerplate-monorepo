'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import AppFooter from './app-footer';
import AppSidebar from './app-sidebar';
import AppTopbar from './app-topbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on outside click (mobile) and mask click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isSidebarOpen &&
        !target.closest('.layout-sidebar') &&
        !target.closest('.layout-menu-button')
      ) {
        setIsSidebarOpen(false);
      }
    };

    const handleMaskClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('layout-mask')) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('click', handleMaskClick);
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.classList.remove('blocked-scroll');
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('click', handleMaskClick);
      document.body.classList.remove('blocked-scroll');
    };
  }, [isSidebarOpen]);

  return (
    <div
      className={cn('layout-wrapper', 'layout-static', { 'layout-mobile-active': isSidebarOpen })}
    >
      <AppTopbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />

      <div className="layout-sidebar">
        <AppSidebar />
      </div>

      <div className="layout-main-container">
        <div className="layout-main">{children}</div>
        <AppFooter />
      </div>

      <div className="layout-mask"></div>
    </div>
  );
};

export default Layout;
