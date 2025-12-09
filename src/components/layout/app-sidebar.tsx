
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
  Bot,
  Building2,
  Calendar,
  HeartPulse,
  Briefcase,
  Vote,
  Droplets,
  BookOpen,
  Power,
  MessageSquare,
  Trash2,
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
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Logo } from '../logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const mainNav = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map View' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
];

const servicesNav = [
  { href: '/services', icon: GanttChartSquare, label: 'All Services' },
  { href: '/market', icon: ShoppingBag, label: 'AgroConnect' },
  { href: '/skills', icon: Wrench, label: 'SkillsHub' },
  { href: '/transport', icon: Bus, label: 'Transport Guide' },
  { href: '/directory', icon: Building2, label: 'Directory' },
];

const communityNav = [
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/forums', icon: MessageSquare, label: 'Forums' },
  { href: '/voting', icon: Vote, label: 'Voting' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  
];

const reportNav = [
    { href: '/issues', icon: Lightbulb, label: 'All Issues' },
    { href: '/safety', icon: Shield, label: 'Safety' },
    { href: '/waste', icon: Trash2, label: 'Waste' },
    { href: '/water', icon: Droplets, label: 'Water' },
    { href: '/power', icon: Power, label: 'Power' },
]

const resourcesNav = [
    { href: '/health', icon: HeartPulse, label: 'Health' },
    { href: '/education', icon: BookOpen, label: 'Education' },
    { href: '/property', icon: Building2, label: 'Property' },
]

export function AppSidebar() {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  const renderNavGroup = (items: typeof mainNav, groupLabel: string) => (
      <SidebarGroup>
        <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
      </SidebarGroup>
  )

  return (
    <Sidebar variant="inset" side='left'>
      <SidebarHeader className="flex items-center justify-between">
        <Logo withText={true} />
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="p-0">
          {renderNavGroup(mainNav, 'Main')}
          <SidebarSeparator />
          {renderNavGroup(servicesNav, 'Services')}
           <SidebarSeparator />
          {renderNavGroup(communityNav, 'Community')}
           <SidebarSeparator />
          {renderNavGroup(reportNav, 'Reports')}
           <SidebarSeparator />
          {renderNavGroup(resourcesNav, 'Resources')}
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
            <SidebarMenuButton tooltip="Logout" asChild>
              <Link href="/logout">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
           </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

    