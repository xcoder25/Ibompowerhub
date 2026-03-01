
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sellers as initialSellers, sellerCategories } from '@/lib/market';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin, Phone, ShoppingCart, Search, Bot, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { findProduct } from '@/ai/flows/agro-assistant-flow';
import { useLoading } from '@/context/loading-context';
import { useCart } from '@/context/cart-context';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sellers, setSellers] = useState(initialSellers);
  const [approvedProducts, setApprovedProducts] = useState<any[]>([]);
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useLoading();
  const { addItem } = useCart();
  const firestore = useFirestore();

  // Fetch approved products
  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'approved_products'), orderBy('approvedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: any[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      setApprovedProducts(products);
    });

    return () => unsubscribe();
  }, [firestore]);

  const handleSearch = (term: string, category: string) => {
    let filtered = initialSellers.filter(seller => {
      const matchesCategory = category === 'All' || seller.category === category;
      const matchesSearch = term === '' ||
        seller.name.toLowerCase().includes(term.toLowerCase()) ||
        seller.products.some(p => p.toLowerCase().includes(term.toLowerCase())) ||
        seller.category.toLowerCase().includes(term.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setSellers(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    handleSearch(searchTerm, category);
  }

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term, selectedCategory);
  }

  const handleAddToCart = (product: any, productName?: string) => {
    addItem({
      id: product.id || `${product.name}-${Date.now()}`,
      name: productName || product.name,
      price: product.price || 0,
      sellerName: product.sellerName || product.name,
      imageId: product.imageId,
    });

    toast({
      title: 'Added to cart',
      description: `${productName || product.name} has been added to your basket.`,
    });
  };

  const handleAiSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);
    setSellers([]);

    try {
      const result = await findProduct({ query: searchTerm, availableSellers: JSON.stringify(initialSellers) });
      if (result.foundSellers.length > 0) {
        const foundSellerIds = result.foundSellers.map(s => s.id);
        const newSellers = initialSellers.filter(s => foundSellerIds.includes(s.id));
        setSellers(newSellers);
        toast({
          title: "Ibom AI Found Results",
          description: `Found ${newSellers.length} vendors for your request.`
        });
      } else {
        toast({
          variant: 'destructive',
          title: "No matches found",
          description: `Our AI couldn't find matches for "${searchTerm}". Try a different term.`
        });
        setSellers(initialSellers);
      }
    } catch (error) {
      console.error("AI search failed:", error);
      toast({
        variant: 'destructive',
        title: "Search Error",
        description: "Something went wrong. Please try again."
      });
      setSellers(initialSellers);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50/50 dark:bg-slate-950">
      {/* Premium Hero Section */}
      <div className="relative h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[40vh] overflow-hidden">
        <Image
          src="/heromk.png"
          alt="Ibom Market Banner"
          fill
          className="object-cover transition-scale duration-700 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col gap-1 sm:gap-2">
          <Badge className="w-fit bg-primary/90 text-white border-none backdrop-blur-md text-[10px] sm:text-xs">Local Producers</Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter">Ibom Market</h1>
          <p className="hidden xs:block text-slate-300 text-[10px] sm:text-sm md:text-base font-medium max-w-xs md:max-w-md">Discover fresh, farm-direct produce from Akwa Ibom's finest growers.</p>
        </div>
      </div>

      {/* Sticky Search & Filter Bar */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search yams, seafood..."
              className="pl-10 sm:pl-12 pr-12 h-12 sm:h-14 bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium ring-offset-background selection:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-primary hover:bg-primary/10 rounded-xl"
              onClick={handleAiSearch}
              disabled={isLoading}
            >
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>

          <div className="flex overflow-x-auto gap-2 -mx-4 px-4 pb-1 no-scrollbar">
            {['All', ...sellerCategories].map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                onClick={() => handleCategoryChange(category)}
                size="sm"
                className={`whitespace-nowrap rounded-lg sm:rounded-xl px-3 sm:px-4 py-1 h-8 sm:h-10 text-xs sm:text-sm font-bold transition-all ${selectedCategory === category ? 'shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8">

        {sellers.length === 0 && !isLoading && (
          <div className='text-center py-20 animate-in fade-in zoom-in duration-300'>
            <div className="bg-slate-100 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className='font-black text-xl'>No vendors found</p>
            <p className="text-slate-500">Try searching for something else or explore categories.</p>
          </div>
        )}

        {/* Section Title */}
        {sellers.length > 0 && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Market Hubs Near You
            </h2>
            <span className="text-xs font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline">View All</span>
          </div>
        )}

        {/* Ultra Premium Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {/* Hardcoded Merchants */}
          {sellers.map((seller) => {
            const image = PlaceHolderImages.find((img) => img.id === seller.imageId);
            return (
              <Card
                key={seller.id}
                className="group overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={seller.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex gap-1 sm:gap-2">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-bold text-[8px] sm:text-[10px] uppercase tracking-tighter">
                      {seller.distance}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-3 sm:pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                    <CardTitle className="text-sm sm:text-xl font-black leading-tight tracking-tight line-clamp-1">{seller.name}</CardTitle>
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-black text-[8px] sm:text-[10px] uppercase px-1 sm:px-2">
                      {seller.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:pb-4">
                  <p className="text-[10px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 line-clamp-1">
                    {seller.products.join(', ')}
                  </p>
                  <p className="text-sm sm:text-lg font-black text-slate-900 dark:text-white mt-1">{seller.priceRange}</p>
                </CardContent>
                <CardFooter className="p-3 pt-0 sm:pb-6 sm:px-6">
                  <Button
                    variant="default"
                    className="w-full h-10 sm:h-12 rounded-xl sm:rounded-[1.25rem] font-black text-[10px] sm:text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all px-2"
                    onClick={() => handleAddToCart(seller, seller.products[0])}
                  >
                    <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Express
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

          {/* Approved Producers */}
          {approvedProducts.map((product) => {
            const image = PlaceHolderImages.find((img) => img.id === 'seller-vegetables');
            return (
              <Card
                key={product.id}
                className="group overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                    <Badge className="bg-primary text-white border-none font-black shadow-lg text-[8px] sm:text-[10px]">DIRECT</Badge>
                  </div>
                </div>
                <CardHeader className="p-3 sm:pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                    <CardTitle className="text-sm sm:text-xl font-black leading-tight tracking-tight line-clamp-1">{product.name}</CardTitle>
                    <Badge variant="secondary" className="font-bold text-[8px] sm:text-[10px] uppercase tracking-tighter px-1 sm:px-2">
                      {product.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:pb-4">
                  <p className="text-[8px] sm:text-xs font-bold text-primary uppercase mb-1 sm:mb-2 line-clamp-1">Vendor: {product.sellerName}</p>
                  <p className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">₦{product.price.toLocaleString()}</p>
                  <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 font-medium">
                    {product.description}
                  </p>
                </CardContent>
                <CardFooter className="p-3 pt-0 sm:pb-6 sm:px-6">
                  <Button
                    variant="default"
                    className="w-full h-10 sm:h-12 rounded-xl sm:rounded-[1.25rem] font-black text-[10px] sm:text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button for Selling */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3">
        <Link href="/market/sell">
          <Button className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/30 active:scale-90 transition-all group overflow-hidden">
            <Plus className="h-6 w-6 sm:h-8 sm:w-8 transition-transform group-hover:rotate-90" />
          </Button>
        </Link>
        <Link href="/market/checkout">
          <Button variant="secondary" className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl sm:rounded-[2rem] shadow-2xl border-none active:scale-90 transition-all relative">
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:min-w-[24px] px-1 flex items-center justify-center bg-red-500 border-none text-white font-black text-[10px] sm:text-xs">
              !
            </Badge>
          </Button>
        </Link>
      </div>
    </div>
  );
}
