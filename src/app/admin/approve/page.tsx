'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type PendingProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  status: string;
  submittedAt: Date;
};

export default function ApproveProductsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'pending_products'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: PendingProduct[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date()
        } as PendingProduct);
      });
      setPendingProducts(products);
    });

    return () => unsubscribe();
  }, [firestore]);

  const approveProduct = async (product: PendingProduct) => {
    if (!firestore) return;

    try {
      // Move to approved products
      await setDoc(doc(firestore, 'approved_products', product.id), {
        ...product,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: user?.uid
      });

      // Remove from pending
      await deleteDoc(doc(firestore, 'pending_products', product.id));

      toast({
        title: 'Product Approved',
        description: `${product.name} has been approved and added to the market.`
      });
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve product.'
      });
    }
  };

  const rejectProduct = async (product: PendingProduct) => {
    if (!firestore) return;

    try {
      await deleteDoc(doc(firestore, 'pending_products', product.id));

      toast({
        title: 'Product Rejected',
        description: `${product.name} has been rejected.`
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject product.'
      });
    }
  };

  // Check if user is admin (you can implement proper admin check)
  const isAdmin = user?.email === 'admin@powerhub.com'; // Replace with proper admin check

  if (!isAdmin) {
    return (
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-headline text-3xl font-bold">Product Approval</h1>
          <p className="text-muted-foreground">Review and approve farmer product submissions</p>
        </div>

        {pendingProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Products</h3>
              <p className="text-muted-foreground">All products have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.sellerName}</CardDescription>
                    </div>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">₦{product.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">Qty: {product.quantity}</span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{product.name}</DialogTitle>
                          <DialogDescription>{product.sellerName}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p><strong>Category:</strong> {product.category}</p>
                          <p><strong>Price:</strong> ₦{product.price.toLocaleString()}</p>
                          <p><strong>Quantity:</strong> {product.quantity}</p>
                          <p><strong>Description:</strong> {product.description}</p>
                          <p><strong>Submitted:</strong> {product.submittedAt.toLocaleDateString()}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={() => approveProduct(product)}
                      size="sm"
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectProduct(product)}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}