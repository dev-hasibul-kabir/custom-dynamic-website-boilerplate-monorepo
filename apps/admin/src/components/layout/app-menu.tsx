'use client';

import React from 'react';
import AppMenuitem from './app-menuitem';
import menuData from '@/config/menu.json';

const AppMenu = () => {
  return (
    <ul className="layout-menu">
      {menuData.map((item, index) => {
        // If item has items array, it's a root section header with children
        if (item.items && item.items.length > 0) {
          return (
            <li key={`${item.label}-${index}`} className="layout-root-menuitem">
              <div className="layout-menuitem-root-text">{item.label}</div>
              <ul>
                {item.items.map((child, i) => (
                  <AppMenuitem key={`${child.label}-${i}`} item={child} index={i} />
                ))}
              </ul>
            </li>
          );
        }
        // If item has no children, it's a root-level link (not a section header)
        return <AppMenuitem key={`${item.label}-${index}`} item={item} index={index} />;
      })}
    </ul>
  );
};

export default AppMenu;
