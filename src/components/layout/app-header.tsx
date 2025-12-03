'use client';

import { Search, Bell, User as UserIcon, Settings, LogOut } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '../logo';

export function AppHeader() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
  const isMobile = useIsMobile();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-transparent px-4 md:px-6 sticky top-0 z-30 backdrop-blur-sm bg-background/80 md:bg-transparent md:backdrop-blur-none">
      <div className="flex items-center gap-2 md:hidden">
         <Logo />
      </div>
     
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search place, route, service..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background/50"
            />
          </div>
        </form>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5 md:hidden" />
          <Bell className="h-5 w-5 hidden md:block" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {userAvatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar.imageUrl} alt="User" />
                  <AvatarFallback>EH</AvatarFallback>
                </Avatar>
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
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
            <DropdownMenuItem>
                <LogOut className='mr-2' />
                Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
