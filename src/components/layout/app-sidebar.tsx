
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Map,
  GanttChartSquare,
  ShoppingBag,
  Wrench,
  Bus,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Home,
  Lightbulb,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '../logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map View' },
  { href: '/services', icon: GanttChartSquare, label: 'Services' },
  { href: '/market', icon: ShoppingBag, label: 'AgroConnect' },
  { href: '/skills', icon: Wrench, label: 'SkillsHub' },
  { href: '/transport', icon: Bus, label: 'Transport Guide' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/issues', icon: Lightbulb, label: 'Issues' },
  { href: '/safety', icon: Shield, label: 'Safety' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  return (
    <Sidebar variant="inset" side='left'>
      <SidebarHeader className="flex items-center justify-between">
        <Logo withText={true} />
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href === '/dashboard' && pathname === '/')}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
         <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="User Settings" asChild>
                <Link href="/profile">
                    {userAvatar && <Avatar className="size-7">
                        <AvatarImage src={userAvatar.imageUrl} alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>}
                    <span className='truncate'>Esther Howard</span>
                </Link>
            </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="Support">
              <HelpCircle />
              <span>Support</span>
            </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
           </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
