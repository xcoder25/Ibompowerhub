'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Moon, Sun, Languages, ShieldCheck, Bell, 
  Lock, Smartphone, Database, Trash2, LogOut, ChevronRight, 
  ExternalLink, FileText, Scale, Check, User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  getOfflinePowerTokens, 
  getOfflineFlightTickets, 
  clearOfflinePowerTokens, 
  clearOfflineFlightTickets 
} from '@/lib/offline-vault';

type KycData = {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  bvnVerified?: boolean;
  identityVerified?: boolean;
  addressVerified?: boolean;
  faceVerified?: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Settings preferences local states
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [floodAlerts, setFloodAlerts] = useState(true);
  const [powerAlerts, setPowerAlerts] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [language, setLanguage] = useState('english');
  const [vaultTokenCount, setVaultTokenCount] = useState(0);
  const [vaultTicketCount, setVaultTicketCount] = useState(0);

  // Load vault stats
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tokens = getOfflinePowerTokens();
      const tickets = getOfflineFlightTickets();
      setVaultTokenCount(tokens.length);
      setVaultTicketCount(tickets.length);

      const savedBio = localStorage.getItem('ibom_pref_biometric') === 'true';
      setBiometricEnabled(savedBio);
    }
  }, []);

  // Fetch KYC status
  const kycDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'kyc', user.uid) : null),
    [firestore, user]
  );
  const { data: kycData } = useDoc<KycData>(kycDocRef);

  const effectiveKyc: KycData = {
    emailVerified: user?.emailVerified ?? false,
    phoneVerified: kycData?.phoneVerified ?? false,
    bvnVerified: kycData?.bvnVerified ?? false,
    identityVerified: kycData?.identityVerified ?? false,
    addressVerified: kycData?.addressVerified ?? false,
    faceVerified: kycData?.faceVerified ?? false,
  };
  const kycCompletedCount = Object.values(effectiveKyc).filter(Boolean).length;
  const isFullyVerified = kycCompletedCount === 6;

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    if (val === 'efik') {
      toast({
        title: 'Efik / Ibibio Selected',
        description: 'Native localized dialect support will be applied across system prompts.',
      });
    } else {
      toast({
        title: 'Language Updated',
        description: 'App display language set to English (Default).',
      });
    }
  };

  const handleToggleBiometrics = (checked: boolean) => {
    setBiometricEnabled(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ibom_pref_biometric', checked ? 'true' : 'false');
    }
    toast({
      title: checked ? 'Biometrics Activated' : 'Biometrics Disabled',
      description: checked ? 'Fingerprint / Face ID enabled for rapid sign-in.' : 'Standard PIN/password login will be required.',
    });
  };

  const handleClearVault = () => {
    clearOfflinePowerTokens();
    clearOfflineFlightTickets();
    setVaultTokenCount(0);
    setVaultTicketCount(0);
    toast({
      title: 'Local Vault Cleared',
      description: 'Cached tokens and boarding passes removed from this device.',
    });
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full size-9">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight text-foreground">App Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your preferences & security</p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5">
              <User className="size-3.5" />
              Profile
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Appearance & Interface */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sun className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Appearance & Language</CardTitle>
                <CardDescription className="text-xs">Customize the interface theme and locale</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  {theme === 'dark' ? <Moon className="size-4 text-emerald-400" /> : <Sun className="size-4 text-amber-500" />}
                </div>
                <div>
                  <Label htmlFor="theme-toggle" className="text-sm font-semibold cursor-pointer">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Toggle between high-contrast dark and sunlight light theme</p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Languages className="size-4 text-blue-500" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Language Preference</Label>
                  <p className="text-xs text-muted-foreground">Primary system prompt and notification language</p>
                </div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="english">English (US/UK)</SelectItem>
                  <SelectItem value="efik">Efik / Ibibio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Digital Identity & Verification */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Digital Identity & KYC</CardTitle>
                <CardDescription className="text-xs">Citizen level verification for transactions & state services</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">State Verification Status</span>
                  {isFullyVerified ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px]">
                      Fully Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 font-bold text-[10px]">
                      {kycCompletedCount}/6 Steps Completed
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFullyVerified 
                    ? 'Your account has maximum transfer limits and unconstrained utility vending access.' 
                    : 'Complete your BVN and Address verification to unlock unrestricted wallet limits.'}
                </p>
              </div>
              <Link href="/kyc" className="shrink-0">
                <Button size="sm" className="rounded-xl font-bold text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isFullyVerified ? 'View KYC Profile' : 'Verify Identity'}
                  <ChevronRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Civic Telemetry */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Bell className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Notifications & Civic Alerts</CardTitle>
                <CardDescription className="text-xs">Manage environmental and transaction dispatches</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card">
              <div>
                <Label htmlFor="flood-toggle" className="text-sm font-semibold cursor-pointer">FloodSense Early Warning Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive real-time SEMA flood hazard broadcasts in your LGA</p>
              </div>
              <Switch id="flood-toggle" checked={floodAlerts} onCheckedChange={setFloodAlerts} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card">
              <div>
                <Label htmlFor="power-toggle" className="text-sm font-semibold cursor-pointer">Power Grid Feeder Alerts</Label>
                <p className="text-xs text-muted-foreground">Alerts for scheduled maintenance and load-shedding windows</p>
              </div>
              <Switch id="power-toggle" checked={powerAlerts} onCheckedChange={setPowerAlerts} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card">
              <div>
                <Label htmlFor="sms-toggle" className="text-sm font-semibold cursor-pointer">SMS Transaction Receipts</Label>
                <p className="text-xs text-muted-foreground">Instant 20-digit STS token and flight PNR dispatches to your mobile</p>
              </div>
              <Switch id="sms-toggle" checked={smsReceipts} onCheckedChange={setSmsReceipts} />
            </div>
          </CardContent>
        </Card>

        {/* Security & Offline Vault Storage */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Database className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Security & Offline Vault</CardTitle>
                <CardDescription className="text-xs">Local device encrypted storage and biometric access</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Smartphone className="size-4 text-purple-500" />
                </div>
                <div>
                  <Label htmlFor="bio-toggle" className="text-sm font-semibold cursor-pointer">Biometric App Lock</Label>
                  <p className="text-xs text-muted-foreground">Prompt Fingerprint / Face ID before confirming transfers</p>
                </div>
              </div>
              <Switch id="bio-toggle" checked={biometricEnabled} onCheckedChange={handleToggleBiometrics} />
            </div>

            {/* Offline Vault Storage Monitor */}
            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Zero-Data Offline Vault</p>
                  <p className="text-xs text-muted-foreground">
                    Locally saved: <strong>{vaultTokenCount}</strong> power tokens, <strong>{vaultTicketCount}</strong> flight boarding passes
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearVault}
                  disabled={vaultTokenCount === 0 && vaultTicketCount === 0}
                  className="rounded-xl text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  Clear Vault Cache
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal, Privacy & Compliance */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Legal & Regulatory</CardTitle>
            <CardDescription className="text-xs">NDPR certifications and citizen terms of use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/privacy" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Privacy Policy (NDPA 2023)</p>
                  <p className="text-xs text-muted-foreground">How your telemetry and financial tokens are protected</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            <Link href="/terms" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                  <Scale className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Terms of Service</p>
                  <p className="text-xs text-muted-foreground">Utility vending, flight ticketing, and civic reporting conditions</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <div className="pt-2 flex justify-center">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full sm:w-auto min-w-[200px] rounded-2xl h-11 font-bold gap-2 shadow-sm"
          >
            <LogOut className="size-4" />
            Sign Out of Hub
          </Button>
        </div>
      </main>
    </div>
  );
}
