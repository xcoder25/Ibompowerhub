
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Star, FileText, Settings, LogOut, Package, Power, LayoutDashboard, Moon, Sun, Languages, HardHat, Wallet, Plus, Minus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type UserProfile = {
    name: string;
    role: string;
    profileImageUrl?: string;
    rating?: number;
    bio?: string;
    location?: string;
};

type WalletData = {
    balance: number;
    currency: string;
};

type Transaction = {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    timestamp: Date;
    reference?: string;
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

    const walletDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
        [firestore, user]
    );

    const { data: walletData, isLoading: isWalletLoading } = useDoc<WalletData>(walletDocRef);

    // Local state for immediate UI updates (optimistic UI) across sessions in this demo
    const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({});
    const [amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);

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

    // Load transactions
    useEffect(() => {
        if (!user || !firestore) return;

        const transactionsRef = collection(firestore, 'wallets', user.uid, 'transactions');
        const q = query(transactionsRef, orderBy('timestamp', 'desc'), limit(10));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const txns: Transaction[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                txns.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate() || new Date()
                } as Transaction);
            });
            setTransactions(txns);
        });

        return () => unsubscribe();
    }, [user, firestore]);


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

    const addFunds = async () => {
        if (!amount || !user || !firestore || !walletData) return;

        const numAmount = parseFloat(amount);
        if (numAmount <= 0) return;

        try {
            const newBalance = walletData.balance + numAmount;
            await updateDoc(walletDocRef!, { balance: newBalance });

            await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
                type: 'credit',
                amount: numAmount,
                description: 'Funds added',
                timestamp: new Date()
            });

            setAmount('');
            toast({
                title: 'Funds Added',
                description: `₦${numAmount.toLocaleString()} has been added to your wallet.`
            });
        } catch (error) {
            console.error('Error adding funds:', error);
            toast({
                title: 'Error',
                description: 'Failed to add funds. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const withdrawFunds = async () => {
        if (!amount || !user || !firestore || !walletData) return;

        const numAmount = parseFloat(amount);
        if (numAmount <= 0 || numAmount > walletData.balance) return;

        try {
            const newBalance = walletData.balance - numAmount;
            await updateDoc(walletDocRef!, { balance: newBalance });

            await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
                type: 'debit',
                amount: numAmount,
                description: 'Funds withdrawn',
                timestamp: new Date()
            });

            setAmount('');
            toast({
                title: 'Funds Withdrawn',
                description: `₦${numAmount.toLocaleString()} has been withdrawn from your wallet.`
            });
        } catch (error) {
            console.error('Error withdrawing funds:', error);
            toast({
                title: 'Error',
                description: 'Failed to withdraw funds. Please try again.',
                variant: 'destructive'
            });
        }
    };

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
                    <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 h-12">
                        <TabsTrigger value="activity" className="text-sm">Activity</TabsTrigger>
                        <TabsTrigger value="wallet" className="text-sm">Wallet</TabsTrigger>
                        <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
                        <TabsTrigger value="dashboard" className="text-sm">Dashboard</TabsTrigger>
                    </TabsList>

                    <TabsContent value="activity" className="space-y-6">
                        <ActivityList />
                    </TabsContent>

                    <TabsContent value="wallet" className="space-y-6">
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl flex items-center gap-2">
                                    <Wallet className="h-5 w-5" />
                                    Wallet Balance
                                </CardTitle>
                                <CardDescription>Manage your funds and view recent transactions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center">
                                    <p className="text-4xl font-bold tracking-tighter">
                                        ₦{walletData?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                    </p>
                                    <p className="text-muted-foreground">Available Balance</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount (₦)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-8">
                                        <Button onClick={addFunds} disabled={!amount || isWalletLoading} className="flex-1 gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add
                                        </Button>
                                        <Button onClick={withdrawFunds} disabled={!amount || !walletData || parseFloat(amount) > walletData.balance || isWalletLoading} variant="outline" className="flex-1 gap-2">
                                            <Minus className="h-4 w-4" />
                                            Withdraw
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Recent Transactions</h3>
                                    {transactions.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {transactions.slice(0, 5).map((txn) => (
                                                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg border">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${txn.type === 'credit' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                                            {txn.type === 'credit' ? <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" /> : <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{txn.description}</p>
                                                            <p className="text-sm text-muted-foreground">{txn.timestamp.toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-semibold ${txn.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/wallet">View All Transactions</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
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
