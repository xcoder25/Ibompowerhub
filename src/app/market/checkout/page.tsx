
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useLoading } from '@/context/loading-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingBag, ArrowLeft, CreditCard, Truck, MapPin, Wallet, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type WalletData = {
  balance: number;
  currency: string;
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { setIsLoading, isLoading } = useLoading();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const walletDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
    [firestore, user]
  );

  const { data: walletData } = useDoc<WalletData>(walletDocRef);

  const deliveryFee = 500;
  const grandTotal = totalPrice + deliveryFee;
  const hasEnoughBalance = walletData ? walletData.balance >= grandTotal : false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (paymentMethod === 'wallet') {
      if (!hasEnoughBalance) {
        toast({
          variant: 'destructive',
          title: 'Insufficient Balance',
          description: 'Your Ibom Wallet balance is too low for this purchase.'
        });
        return;
      }

      try {
        const newBalance = walletData!.balance - grandTotal;
        await updateDoc(walletDocRef!, { balance: newBalance });

        await addDoc(collection(firestore!, 'wallets', user!.uid, 'transactions'), {
          type: 'debit',
          amount: grandTotal,
          description: `Ibom Market Order - ${items.length} items`,
          timestamp: new Date(),
          reference: `IM-${Date.now()}`
        });
      } catch (error) {
        console.error('Error processing wallet payment:', error);
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: 'Failed to authorize wallet transaction.'
        });
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      clearCart();
      setIsLoading(false);
      router.push('/market/success');
    }, 3000);
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 min-h-[70vh]">
        <div className="bg-slate-100 dark:bg-slate-900 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-black mb-2 tracking-tight">Your Basket is Empty</h2>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-xs">Fill it up with fresh produce from our local Akwa Ibom farmers.</p>
        <Button asChild className="h-14 px-8 rounded-2xl font-black bg-slate-900 border-none">
          <Link href="/market">Explore Market</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <Button variant="ghost" asChild className="mb-8 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl">
          <Link href="/market">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="font-bold">Return to Market</span>
          </Link>
        </Button>

        <h1 className="text-4xl font-black tracking-tighter mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  Logistics & Delivery
                </CardTitle>
                <CardDescription className="font-medium">Specify your delivery coordinates within the state.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Recipient Name</Label>
                      <Input id="name" placeholder="John Doe" required className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                      <Input id="phone" placeholder="080... (Ibom Line)" type="tel" required className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-slate-400">Delivery Address</Label>
                    <Input id="address" placeholder="e.g. 54 Oron Road, Uyo" required className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold" value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-slate-400">Internal Notes</Label>
                    <Input id="notes" placeholder="e.g. Deliver to the back of the building" className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold" value={formData.notes} onChange={handleInputChange} />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  Settlement Method
                </CardTitle>
                <CardDescription className="font-medium">Securely authorize your transaction.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Label
                    htmlFor="cod"
                    className={`flex flex-col items-start p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <RadioGroupItem value="cod" id="cod" className="border-primary" />
                      <span className="font-black text-lg">Cash on Entry</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">Pay at your doorstep.</span>
                  </Label>

                  <Label
                    htmlFor="wallet"
                    className={`flex flex-col items-start p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'} ${!hasEnoughBalance ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <RadioGroupItem value="wallet" id="wallet" disabled={!hasEnoughBalance} className="border-primary" />
                      <span className="font-black text-lg">Ibom Wallet</span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-xs font-bold text-slate-500 italic">Bal: ₦{walletData?.balance?.toLocaleString() || '0'}</span>
                      {!hasEnoughBalance && <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Low Bal</span>}
                    </div>
                  </Label>
                </RadioGroup>

                {paymentMethod === 'wallet' && !hasEnoughBalance && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-center justify-between">
                    <p className="text-sm font-bold text-red-800 dark:text-red-300">
                      Balance is too low for this order.
                    </p>
                    <Link href="/wallet" className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-100 dark:bg-white px-4 py-2 rounded-xl">
                      Top up
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl shadow-primary/10 bg-slate-900 text-white rounded-[2.5rem] overflow-hidden sticky top-24">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="font-black text-base line-clamp-1">{item.name}</span>
                        <span className="text-xs font-bold text-slate-400">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-black">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Subtotal</span>
                    <span className="font-black font-medium">₦{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Logistics</span>
                    <span className="font-black font-medium">₦{deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-4">
                    <span className="text-xl font-black">Grand Total</span>
                    <span className="text-2xl font-black text-primary">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button
                  form="checkout-form"
                  type="submit"
                  className="w-full h-16 rounded-2xl font-black text-xl bg-primary text-white hover:scale-[1.03] transition-all shadow-2xl shadow-primary/40 border-none"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirm Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
