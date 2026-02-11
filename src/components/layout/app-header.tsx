
'use client';

import { Search, Bell, User as UserIcon, Settings, LogOut, Home, Plus, LayoutGrid, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
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
import { Logo } from '../logo';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { QuickNav } from '../quick-nav';
import { collection } from 'firebase/firestore';
import { useCart } from '@/context/cart-context';
import { useState } from 'react';
import { CartSheet } from '../cart-sheet';

export function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

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

  return (
    <>
      <header className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6",
        isMapPage && "absolute border-none bg-transparent backdrop-blur-none"
      )}>
        <div className="flex w-full items-center justify-between">
          {/* Left Side: Logo */}
          <Logo withText={true} className="text-xl" />

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2">
              {isDashboard && (
                   <div className="relative hidden flex-1 sm:flex-initial md:block max-w-xs lg:max-w-md">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          type="search"
                          placeholder="Search services, alerts..."
                          className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background/50"
                      />
                  </div>
              )}
              
              <QuickNav>
                  <Button variant="ghost" size="icon" className="rounded-full">
                      <LayoutGrid className="h-5 w-5" />
                  </Button>
              </QuickNav>
              
              {isDashboard && (
                  <Button asChild className='hidden sm:flex'>
                      <Link href="/report"><Plus className='mr-2'/>Report Issue</Link>
                  </Button>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 text-[10px] bg-primary text-primary-foreground border-2 border-background">{totalItems}</Badge>
                )}
                <span className="sr-only">Open cart</span>
              </Button>
              
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
        </div>
      </header>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
