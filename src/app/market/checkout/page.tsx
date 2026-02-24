
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
import { ShoppingBag, ArrowLeft, CreditCard, Truck, MapPin, Wallet } from 'lucide-react';
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
  const { showLoader, isLoading } = useLoading();
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
          description: 'Your wallet balance is not enough for this order.'
        });
        return;
      }

      try {
        // Deduct from wallet
        const newBalance = walletData!.balance - grandTotal;
        await updateDoc(walletDocRef!, { balance: newBalance });

        // Add transaction
        await addDoc(collection(firestore!, 'wallets', user!.uid, 'transactions'), {
          type: 'debit',
          amount: grandTotal,
          description: `Payment for order - ${items.length} items`,
          timestamp: new Date(),
          reference: `ORD-${Date.now()}`
        });
      } catch (error) {
        console.error('Error processing wallet payment:', error);
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: 'Failed to process wallet payment. Please try again.'
        });
        return;
      }
    }

    showLoader(3000);
    setTimeout(() => {
      clearCart();
      router.push('/market/success');
    }, 3000);
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">You need items in your cart to checkout.</p>
        <Button asChild>
          <Link href="/market">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/market">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Market
        </Link>
      </Button>

      <h1 className="font-headline text-3xl font-bold tracking-tight mb-8 text-center sm:text-left">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card glassy>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Information
              </CardTitle>
              <CardDescription>Enter where you'd like your fresh produce delivered.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="080..." type="tel" required value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input id="address" placeholder="123 Marian Road, Calabar" required value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Input id="notes" placeholder="e.g. Leave at the gate" value={formData.notes} onChange={handleInputChange} />
                </div>
              </form>
            </CardContent>
          </Card>

          <Card glassy>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
              <CardDescription>Choose how you'd like to pay.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 flex justify-between items-center cursor-pointer">
                    <span>Pay on Delivery</span>
                    <span className="text-xs text-muted-foreground">Cash or Transfer</span>
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${!hasEnoughBalance ? 'opacity-50' : ''}`}>
                  <RadioGroupItem value="wallet" id="wallet" disabled={!hasEnoughBalance} />
                  <Label htmlFor="wallet" className="flex-1 flex justify-between items-center cursor-pointer">
                    <div className="flex flex-col">
                      <span>PowerHub Wallet</span>
                      <span className="text-xs text-muted-foreground">
                        Balance: ₦{walletData?.balance?.toLocaleString() || '0'}
                      </span>
                    </div>
                    {!hasEnoughBalance && (
                      <span className="text-xs font-medium text-red-600">Insufficient</span>
                    )}
                  </Label>
                </div>
              </RadioGroup>
              {paymentMethod === 'wallet' && !hasEnoughBalance && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Insufficient wallet balance.{' '}
                    <Link href="/wallet" className="underline font-medium">
                      Add funds
                    </Link>{' '}
                    to continue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 pr-4 line-clamp-1">
                      <span className="font-semibold">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₦{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button form="checkout-form" type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
