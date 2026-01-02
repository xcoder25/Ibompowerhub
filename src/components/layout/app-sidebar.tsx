
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Palmtree,
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
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

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
    { href: '/tourism', icon: Palmtree, label: 'Tourism' },
]

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/auth/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

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
                    <Avatar className="size-7">
                        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                        <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <span className='truncate'>{user?.displayName ?? 'Profile'}</span>
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
            <SidebarMenuButton tooltip="Logout" onClick={handleSignOut}>
                <LogOut />
                <span>Logout</span>
            </SidebarMenuButton>
           </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
