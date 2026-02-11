
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const orderNumber = Math.floor(Math.random() * 900000) + 100000;

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center py-8 shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl">Order Placed!</CardTitle>
          <p className="text-muted-foreground">Thank you for your order. We've notified the sellers.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg inline-block w-full">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
            <p className="text-2xl font-mono font-bold">#PH-{orderNumber}</p>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Estimated Delivery</p>
                <p className="text-sm text-muted-foreground">Within 60-90 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Seller Notification</p>
                <p className="text-sm text-muted-foreground">Sellers are preparing your items now.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full h-12 text-lg">
            <Link href="/dashboard">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/market">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
