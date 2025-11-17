'use client';

import React from 'react';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="layout-footer">
      <span className="font-medium">© {currentYear} All rights reserved. Created by</span>
      <span className="font-medium ml-1">
        <strong>example.com</strong>
      </span>
    </div>
  );
};

export default AppFooter;

