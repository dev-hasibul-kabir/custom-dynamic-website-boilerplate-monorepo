'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { ChevronDown } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon?: string;
  to?: string;
  items?: MenuItem[];
}

interface AppMenuitemProps {
  item: MenuItem;
  index: number;
  root?: boolean;
  parentKey?: string;
}

const AppMenuitem = ({ item, index, root = false, parentKey }: AppMenuitemProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.items && item.items.length > 0;
  const isActive = item.to === pathname;
  const isParentActive = hasChildren && item.items?.some(child => child.to === pathname);
  const key = parentKey ? `${parentKey}-${index}` : String(index);
  const active = isActive || isParentActive || isOpen;

  // Auto-open parent if child is active
  useEffect(() => {
    if (isParentActive) {
      setIsOpen(true);
    }
  }, [isParentActive]);

  // Get icon component from lucide-react
  const IconComponent = item.icon
    ? (LucideIcons[item.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li className={cn({ 'active-menuitem': active })}>
      {(!item.to || item.items) ? (
        <a
          href="#"
          onClick={handleToggle}
          className={cn({ 'active-route': isParentActive })}
        >
          {IconComponent ? (
            <IconComponent className="layout-menuitem-icon h-4 w-4" />
          ) : (
            item.icon && <i className={cn('layout-menuitem-icon', item.icon)}></i>
          )}
          <span className="layout-menuitem-text">{item.label}</span>
          {hasChildren && <ChevronDown className="layout-submenu-toggler h-4 w-4" />}
        </a>
      ) : null}

      {item.to && !item.items ? (
        <Link
          href={item.to}
          className={cn({ 'active-route': isActive })}
        >
          {IconComponent ? (
            <IconComponent className="layout-menuitem-icon h-4 w-4" />
          ) : (
            item.icon && <i className={cn('layout-menuitem-icon', item.icon)}></i>
          )}
          <span className="layout-menuitem-text">{item.label}</span>
        </Link>
      ) : null}

      {hasChildren && isOpen && (
        <ul>
          {item.items?.map((child, i) => (
            <AppMenuitem key={`${child.label}-${i}`} item={child} index={i} parentKey={key} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default AppMenuitem;

