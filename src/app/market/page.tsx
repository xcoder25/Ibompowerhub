'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sellers as initialSellers, sellerCategories } from '@/lib/market';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin, Phone, Truck, Search, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { findProduct } from '@/ai/flows/agro-assistant-flow';
import { useLoading } from '@/context/loading-context';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sellers, setSellers] = useState(initialSellers);
  const { toast } = useToast();
  const { showLoader, isLoading, setIsLoading } = useLoading();

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
  
  const handleActionClick = (sellerId: number, action: 'whatsapp' | 'delivery') => {
    showLoader(3000);
    toast({
        title: `${action === 'whatsapp' ? 'Opening WhatsApp...' : 'Processing Delivery...'}`,
        description: `Connecting with ${sellers.find(s => s.id === sellerId)?.name}.`,
    });
  };

  const handleAiSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);
    setSellers([]); // Clear current sellers

    try {
        const result = await findProduct({ query: searchTerm, availableSellers: JSON.stringify(initialSellers) });
        if (result.foundSellers.length > 0) {
            const foundSellerIds = result.foundSellers.map(s => s.id);
            const newSellers = initialSellers.filter(s => foundSellerIds.includes(s.id));
            setSellers(newSellers);
            toast({
                title: "AI Search Results",
                description: `Found ${newSellers.length} sellers for "${searchTerm}".`
            });
        } else {
            toast({
                variant: 'destructive',
                title: "No sellers found",
                description: `The AI couldn't find any sellers for "${searchTerm}". Try a different product.`
            });
            setSellers(initialSellers); // Reset to all if none found
        }
    } catch (error) {
        console.error("AI search failed:", error);
        toast({
            variant: 'destructive',
            title: "AI Search Error",
            description: "Something went wrong. Please try again."
        });
        setSellers(initialSellers); // Reset on error
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">AgroConnect Market</h1>
        <p className="text-muted-foreground">
          Connect with local farmers and sellers for fresh produce.
        </p>
      </div>
      
       <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for a product or seller..."
            className="pl-10 text-base bg-background/50"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
           <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-primary"
            onClick={handleAiSearch}
            disabled={isLoading}
            >
            <Bot />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...sellerCategories].map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {sellers.length === 0 && !isLoading && (
            <div className='text-center py-16 text-muted-foreground'>
                <p className='font-semibold text-lg'>No sellers found</p>
                <p>Try adjusting your search or filter.</p>
            </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sellers.map((seller) => {
          const image = PlaceHolderImages.find((img) => img.id === seller.imageId);
          return (
            <Card key={seller.id} glassy className="overflow-hidden">
              {image && (
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={image.imageUrl}
                    alt={seller.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline">{seller.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{seller.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{seller.distance} away</span>
                </div>
                <p className="font-semibold mt-2">{seller.priceRange}</p>
                 <div className="mt-2 flex flex-wrap gap-1">
                    {seller.products.slice(0, 3).map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleActionClick(seller.id, 'whatsapp')}
                    disabled={isLoading}
                >
                    <Phone className="mr-2 h-4 w-4" />
                    WhatsApp
                </Button>
                <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleActionClick(seller.id, 'delivery')}
                    disabled={isLoading}
                >
                    <Truck className="mr-2 h-4 w-4" />
                    Delivery
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
