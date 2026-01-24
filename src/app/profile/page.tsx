
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Star, FileText, Settings, LogOut, Package, Power, LayoutDashboard, Moon, Sun, Languages, HardHat } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { ActivityList } from '@/components/profile/activity-list';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
    name: string;
    role: string;
    profileImageUrl?: string;
    rating?: number;
    bio?: string;
    location?: string;
};

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const firestore = useFirestore();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [firestore, user]
    );

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    // Local state for immediate UI updates (optimistic UI) across sessions in this demo
    const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        if (userProfile) {
            setLocalProfile(userProfile);
        } else if (user) {
            setLocalProfile({
                name: user.displayName || 'User',
                role: 'Resident'
            })
        }
    }, [userProfile, user]);


    const handleSignOut = () => {
        if (!auth) return;
        signOut(auth);
    };

    const handleUpdateProfile = (updates: any) => {
        setLocalProfile(prev => ({ ...prev, ...updates }));
        // In a real app, you would update Firestore here
        // updateDoc(userDocRef, updates);
    };

    const handleLanguageChange = (language: string) => {
        if (language === 'efik') {
            toast({
                title: 'Coming Soon!',
                description: 'Full Efik language support will be added in a future update.'
            })
        }
    }

    const isLoading = isUserLoading || isProfileLoading;
    const isSeller = localProfile?.role === 'Seller';
    const isArtisan = localProfile?.role === 'Artisan';
    const currentName = localProfile?.name ?? user?.displayName ?? 'User';
    // @ts-ignore
    const currentBio = localProfile?.bio ?? 'Community Member';
    // @ts-ignore
    const currentLocation = localProfile?.location ?? 'Calabar, Nigeria';


    return (
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-transparent">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Profile Header Card */}
                <Card className="border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
                    {/* Cover Image Placeholder */}
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"></div>

                    <CardContent className="relative pt-0 px-6 sm:px-8 pb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 mb-6">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg text-4xl">
                                <AvatarImage src={userProfile?.profileImageUrl ?? user?.photoURL ?? undefined} alt={currentName} />
                                <AvatarFallback>{currentName.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1 mb-2">
                                <h1 className="font-headline text-3xl font-bold">{currentName}</h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    {localProfile?.role ?? 'Resident'}
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></span>
                                    <span>{currentLocation}</span>
                                </p>
                            </div>

                            <div className="mb-2 shrink-0">
                                <EditProfileDialog
                                    user={{ ...localProfile, name: currentName, bio: currentBio, location: currentLocation }}
                                    onUpdateProfile={handleUpdateProfile}
                                />
                            </div>
                        </div>

                        <div className="max-w-2xl">
                            <p className="text-foreground/80 leading-relaxed">{currentBio}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* content tabs */}
                <Tabs defaultValue="activity" className="space-y-6">
                    <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-12">
                        <TabsTrigger value="activity" className="text-sm">Activity</TabsTrigger>
                        <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
                        <TabsTrigger value="dashboard" className="text-sm">Dashboard</TabsTrigger>
                    </TabsList>

                    <TabsContent value="activity" className="space-y-6">
                        <ActivityList />
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">App Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-4 gap-4">
                                    <div className='flex items-center gap-4'>
                                        <div className="p-2 bg-secondary/50 rounded-full">
                                            {theme === 'dark' ? <Moon className='size-5 text-foreground' /> : <Sun className='size-5 text-foreground' />}
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label htmlFor="dark-mode" className='font-semibold'>Dark Mode</Label>
                                            <p className='text-sm text-muted-foreground'>Toggle between light and dark themes.</p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="dark-mode"
                                        checked={theme === 'dark'}
                                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-4 gap-4">
                                    <div className='flex items-center gap-4'>
                                        <div className="p-2 bg-secondary/50 rounded-full">
                                            <Languages className='size-5 text-foreground' />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label htmlFor="language" className='font-semibold'>Language</Label>
                                            <p className='text-sm text-muted-foreground'>Choose your preferred language.</p>
                                        </div>
                                    </div>
                                    <Select defaultValue="english" onValueChange={handleLanguageChange}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="efik">Efik (Coming Soon)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-center mt-8">
                            <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="dashboard">
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">Provider Dashboard</CardTitle>
                                <CardDescription>Manage your services and availability.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!isSeller && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-4 gap-4 bg-primary/5">
                                        <div className='flex items-center gap-4'>
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <Package className='size-5 text-primary' />
                                            </div>
                                            <div>
                                                <h3 className='font-semibold'>Start Selling</h3>
                                                <p className='text-sm text-muted-foreground'>Join AgorConnect marketplace.</p>
                                            </div>
                                        </div>
                                        <Button asChild variant="outline"><Link href="/market/sell">Become a Seller</Link></Button>
                                    </div>
                                )}
                                {!isArtisan && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-4 gap-4 bg-sky-500/5">
                                        <div className='flex items-center gap-4'>
                                            <div className="p-2 bg-sky-100 rounded-full dark:bg-sky-900/50">
                                                <HardHat className='size-5 text-sky-600 dark:text-sky-400' />
                                            </div>
                                            <div>
                                                <h3 className='font-semibold'>Offer Skills</h3>
                                                <p className='text-sm text-muted-foreground'>Join SkillsHub as an Artisan.</p>
                                            </div>
                                        </div>
                                        <Button asChild variant="outline"><Link href="/skills/register">Become an Artisan</Link></Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
