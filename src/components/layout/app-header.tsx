
'use client';

import { Search, Bell, User as UserIcon, Settings, LogOut, Home, Bus, Building2, Plus, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '../logo';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { ReportIssueDialog } from '../report-issue-dialog';
import { DialogTrigger } from '../ui/dialog';
import { collection } from 'firebase/firestore';
import { QuickNav } from '../quick-nav';

export function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isMapPage = pathname === '/map';
  const isDashboard = pathname.startsWith('/dashboard');
  
  const firestore = useFirestore();
  const reportsRef = useMemoFirebase(() => firestore ? collection(firestore, 'reports') : null, [firestore]);
  const { data: reports } = useCollection(reportsRef);
  const notificationCount = reports?.length ?? 0;

  const handleSignOut = async () => {
    try {
      if (!auth) return;
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

  const HeaderLogo = () => (
    <div className='hidden md:flex'>
        <Logo withText={true} className="text-xl" />
    </div>
  )

  const MobileHeader = () => (
     <div className="flex w-full items-center justify-between md:hidden">
        <Logo withText={true} className="text-xl" />
        <div className="flex items-center gap-1">
            <QuickNav>
                <Button variant="ghost" size="icon">
                    <LayoutGrid className="h-5 w-5" />
                </Button>
            </QuickNav>
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                    <Badge variant="destructive" className="absolute top-1 right-1 h-4 w-4 justify-center p-0 text-xs">{notificationCount}</Badge>
                )}
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/profile">
                    <UserIcon className='mr-2' />
                    Profile
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className='mr-2' />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className='mr-2' />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
  )

  if (isDashboard) {
      return (
        <header className='sticky top-0 flex h-16 items-center gap-4 bg-background/80 backdrop-blur-sm px-4 md:px-6 z-30'>
             <div className="hidden w-full items-center justify-between md:flex">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search for services, alerts, or community posts..."
                        className="pl-9 w-full bg-background/50"
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <QuickNav>
                        <Button variant="ghost" size="icon">
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                    </QuickNav>
                    <Button asChild>
                        <Link href="/report"><Plus className='mr-2'/>Report an Issue</Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                        <Bell className="h-5 w-5" />
                        {notificationCount > 0 && (
                          <Badge variant="destructive" className="absolute top-1 right-1 h-4 w-4 justify-center p-0 text-xs">{notificationCount}</Badge>
                        )}
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                            <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <UserIcon className='mr-2' />
                            Profile
                        </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className='mr-2' />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className='mr-2' />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
             </div>
            <MobileHeader />
        </header>
      )
  }


  return (
    <header className={cn("flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30", isMapPage && "absolute top-0 left-0 right-0 z-20 border-none bg-transparent backdrop-blur-none")}>
        <HeaderLogo />
     
      <div className={cn("flex w-full items-center gap-4", isMapPage && "md:hidden", "md:ml-auto")}>
        <div className="relative ml-auto hidden flex-1 sm:flex-initial md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search place, route, service..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background/50"
            />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full md:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <QuickNav>
            <Button variant="ghost" size="icon" className="rounded-full">
                <LayoutGrid className="h-5 w-5" />
            </Button>
        </QuickNav>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge variant="destructive" className="absolute top-1 right-1 h-4 w-4 justify-center p-0 text-xs">{notificationCount}</Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className='mr-2' />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Settings className='mr-2' />
                Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className='mr-2' />
                Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
       {isMapPage && (
          <div className='md:hidden ml-auto'>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <Home />
                    </Link>
                </Button>
          </div>
        )}
    </header>
  );
}
