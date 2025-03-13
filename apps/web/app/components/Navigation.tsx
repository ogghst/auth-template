'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { text: 'Home', href: '/', icon: <HomeIcon fontSize="small" /> },
    {
      text: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon fontSize="small" />,
    },
    { text: 'Users', href: '/users', icon: <PeopleIcon fontSize="small" /> },
    {
      text: 'Profile',
      href: '/profile',
      icon: <PersonIcon fontSize="small" />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            color={isActive ? 'secondary' : 'inherit'}
            variant={isActive ? 'contained' : 'text'}
            size="small"
            startIcon={item.icon}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {item.text}
          </Button>
        );
      })}
    </Box>
  );
}
