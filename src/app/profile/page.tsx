
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Star, FileText, Settings, LogOut, Package, Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
    name: string;
    role: string;
    profileImageUrl?: string;
    rating?: number;
};

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const handleSignOut = () => {
    if (!auth) return;
    // Non-blocking call
    signOut(auth);
  };

  const isLoading = isUserLoading || isProfileLoading;


  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 bg-transparent">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card glassy>
          <CardContent className="pt-6">
            {isLoading ? (
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                        <Skeleton className="h-5 w-24 mx-auto sm:mx-0" />
                        <Skeleton className="h-5 w-32 mx-auto sm:mx-0" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                      <AvatarImage src={userProfile?.profileImageUrl ?? user?.photoURL ?? undefined} alt={userProfile?.name ?? "User"} />
                      <AvatarFallback>{userProfile?.name?.charAt(0) ?? user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                  <div className="flex-1">
                    <h1 className="font-headline text-3xl font-bold">{userProfile?.name ?? user?.displayName}</h1>
                    <p className="text-muted-foreground">{userProfile?.role ?? 'Resident'}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-yellow-400">
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5" />
                      <span className="text-muted-foreground ml-2">({userProfile?.rating ?? 4.1} Rating)</span>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
            <Card glassy>
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                    <FileText className='size-6 text-primary' />
                    <CardTitle className='font-headline'>My Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-3xl font-bold'>12</p>
                    <p className='text-xs text-muted-foreground'>Total reports submitted</p>
                </CardContent>
            </Card>
             <Card glassy>
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                    <Star className='size-6 text-primary' />
                    <CardTitle className='font-headline'>Favorites</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-3xl font-bold'>5</p>
                    <p className='text-xs text-muted-foreground'>Saved sellers & artisans</p>
                </CardContent>
            </Card>
             <Card glassy>
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                    <Settings className='size-6 text-primary' />
                    <CardTitle className='font-headline'>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary" className='w-full justify-start'>Account & Security</Button>
                </CardContent>
            </Card>
        </div>

        <Card glassy>
          <CardHeader>
            <CardTitle className="font-headline">Provider Dashboard</CardTitle>
            <CardDescription>Manage your services and availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4">
                <div className='flex items-center gap-4'>
                    <Package className='size-6 text-muted-foreground'/>
                    <div>
                        <Label htmlFor="listing-status" className='font-semibold'>My Listings</Label>
                        <p className='text-sm text-muted-foreground'>Manage your products or services</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto shrink-0">View Listings</Button>
            </div>
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4">
                <div className='flex items-center gap-4'>
                    <Power className='size-6 text-muted-foreground'/>
                    <div>
                        <Label htmlFor="availability-status" className='font-semibold'>Availability</Label>
                        <p className='text-sm text-muted-foreground'>Set your status to available for requests</p>
                    </div>
                </div>
              <Switch id="availability-status" defaultChecked className="ml-auto sm:ml-0"/>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
            <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </div>

      </div>
    </div>
  );
}
