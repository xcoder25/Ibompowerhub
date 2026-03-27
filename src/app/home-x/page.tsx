'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Home, MapPin, Search, Filter, Bed, Bath, Square, Heart, Star, Eye, Phone, ChevronLeft, ChevronRight, Activity, Map as MapIcon, Grid, MessageCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialProperties = [
  {
    id: 1,
    title: 'Luxury 3-Bed Apartment',
    location: 'Shelter Afrique Estate, Uyo',
    price: '₦2,500,000/yr',
    type: 'Apartment',
    beds: 3,
    baths: 3,
    size: '2,400 sqft',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    description: "Experience premium living in this massive 3-bedroom luxury apartment. Features a fully fitted kitchen, modern POP ceiling, dedicated parking space, and constant power supply in Uyo's most secure estate.",
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 812 345 6789',
    viewers: 12
  },
  {
    id: 2,
    title: 'Modern Cozy Studio',
    location: 'Ewet Housing Estate, Uyo',
    price: '₦800,000/yr',
    type: 'Studio',
    beds: 1,
    baths: 1,
    size: '600 sqft',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    description: 'Perfect for young professionals! This sleek studio apartment comes semi-furnished with a built-in wardrobe, smart lighting, and high-speed internet provisions.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 903 444 1122',
    viewers: 5
  },
  {
    id: 3,
    title: 'Premium 4-Bed Duplex',
    location: 'Osongama Estate, Uyo',
    price: '₦4,500,000/yr',
    type: 'Duplex',
    beds: 4,
    baths: 5,
    size: '4,500 sqft',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    description: 'An architectural masterpiece in Osongama. This duplex boasts high ceilings, a home office, en-suite bedrooms, and a stunning backyard garden. Ideal for a family seeking luxury.',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 701 223 9988',
    viewers: 22
  },
  {
    id: 4,
    title: 'Commercial Office Space',
    location: 'Idoro Road, Uyo',
    price: '₦1,500,000/yr',
    type: 'Commercial',
    beds: 0,
    baths: 2,
    size: '1,200 sqft',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    description: 'Highly visible commercial space ideal for a pharmacy, mini-mart, or corporate office. Located on the bustling Idoro road with ample parking for clients.',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 809 111 0000',
    viewers: 8
  },
  {
    id: 5,
    title: 'Weekend Shortlet Villa',
    location: 'Nwaniba Road, Uyo',
    price: '₦120,000/night',
    type: 'Shortlet',
    beds: 2,
    baths: 2,
    size: '1,800 sqft',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800',
    description: 'Your perfect getaway destination. Beautifully furnished with a private pool, snooker board, smart TVs in all rooms, and a private chef upon request.',
    images: [
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 815 666 4433',
    viewers: 15
  },
  {
    id: 6,
    title: 'Serene 2-Bed Flat',
    location: 'Oron Road, Uyo',
    price: '₦1,200,000/yr',
    type: 'Apartment',
    beds: 2,
    baths: 2,
    size: '1,000 sqft',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=800',
    description: 'Quiet, accessible, and highly affordable. This newly built 2-bedroom apartment features modern finishings and is just a 5-minute drive from the city center.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 703 123 4567',
    viewers: 3
  }
];

const categories = ['All', 'Apartment', 'Duplex', 'Studio', 'Commercial', 'Shortlet'];

export default function HomeXPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [properties, setProperties] = useState(initialProperties);
  const [displayedProperties, setDisplayedProperties] = useState(properties);
  const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { toast } = useToast();

  // Simulate real-time viewer count and new leads
  useEffect(() => {
    const interval = setInterval(() => {
      setProperties(currentProps => 
        currentProps.map(prop => ({
          ...prop,
          viewers: Math.max(1, prop.viewers + Math.floor(Math.random() * 5) - 2) // Random fluctuation between -2 and +2
        }))
      );

      // Randomly occasionally drop a fake notification
      if (Math.random() > 0.8) {
        const randomProp = initialProperties[Math.floor(Math.random() * initialProperties.length)];
        toast({
          title: "🔥 Real-time Activity",
          description: `Someone just booked a tour for ${randomProp.title}!`,
          duration: 4000,
        });
      }
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [toast]);

  useEffect(() => {
    handleSearch(searchTerm, selectedCategory, properties);
  }, [properties]); // re-filter when real-time updates happen

  const handleSearch = (term: string, category: string, currentProps: typeof initialProperties = properties) => {
    let filtered = currentProps.filter(prop => {
      const matchesCategory = category === 'All' || prop.type === category;
      const matchesSearch = term === '' || 
        prop.title.toLowerCase().includes(term.toLowerCase()) || 
        prop.location.toLowerCase().includes(term.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setDisplayedProperties(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    handleSearch(searchTerm, category);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term, selectedCategory);
  };

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const isWishlisted = prev.includes(id);
      if (!isWishlisted) {
        toast({ title: 'Added to Wishlist', description: 'Property saved for later.' });
        return [...prev, id];
      }
      return prev.filter(w => w !== id);
    });
  };

  return (
    <div className="flex-1 w-full max-w-[100vw] bg-slate-50/50 dark:bg-slate-950 overflow-x-hidden relative">
      {/* Floating Chat Agent */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 relative"
          onClick={() => toast({ title: "Live Agent Connected", description: "Hello! How can I help you find your dream home today?" })}
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
        </button>
      </div>

      {/* Premium Hero Section */}
      <div className="relative w-full h-[30vh] md:h-[40vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600"
          alt="HomeX Banner"
          fill
          className="object-cover transition-transform duration-[20s] hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 flex flex-col gap-2 sm:gap-3 max-w-2xl">
          <Badge className="w-fit bg-red-500 text-white border-none shadow-lg text-[10px] sm:text-xs tracking-widest uppercase animate-pulse flex items-center gap-1">
            <Zap className="h-3 w-3" /> LIVE DEMO
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-xl">
            Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">dream space.</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base font-medium max-w-sm drop-shadow-md">
            Rent, buy, and lease vetted premium properties. Real-time availability tracking included.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar via sticky */}
      <div className="sticky top-16 sm:top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex gap-3 relative">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search locations, property types..."
                className="pl-12 h-14 bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-2xl text-base font-medium ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-500/20 shadow-sm"
                value={searchTerm}
                onChange={handleSearchTermChange}
              />
            </div>
            
            {/* View Toggle */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 shadow-inner h-14">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                className={`flex-1 rounded-xl h-full px-4 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-5 w-5 mr-1" />
                Grid
              </Button>
              <Button 
                variant={viewMode === 'map' ? 'default' : 'ghost'} 
                className={`flex-1 rounded-xl h-full px-4 ${viewMode === 'map' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-5 w-5 mr-1" />
                Map
              </Button>
            </div>

            <Button size="icon" variant="secondary" className="h-14 w-14 shrink-0 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Filter className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex overflow-x-auto gap-2 no-scrollbar -mx-4 px-4 pb-1">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                onClick={() => handleCategoryChange(category)}
                size="sm"
                className={`whitespace-nowrap rounded-xl px-5 h-10 text-sm font-bold transition-all ${
                  selectedCategory === category 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 min-h-[50vh]">
        
        {displayedProperties.length === 0 && (
          <div className='text-center py-20 animate-fade-in'>
            <div className="bg-slate-100 dark:bg-slate-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-10 w-10 text-slate-400" />
            </div>
            <p className='font-black text-2xl mb-2 text-slate-900 dark:text-white'>No properties found</p>
            <p className="text-slate-500 font-medium">We couldn't find any homes matching your criteria.</p>
          </div>
        )}

        {displayedProperties.length > 0 && viewMode === 'map' && (
          <div className="w-full h-[600px] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden relative border border-slate-300 dark:border-slate-700 flex items-center justify-center">
            {/* Super feature: Interactive Map Stub */}
            <Image 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600" 
              alt="Map View" 
              fill 
              className="object-cover opacity-60 dark:opacity-40"
            />
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-multiply"></div>
            {/* Mock Map Markers for displayed properties */}
            {displayedProperties.map((prop, idx) => {
              // Deterministic but scattered map positions
              const top = 20 + ((idx * 13) % 60);
              const left = 20 + ((idx * 27) % 60);
              return (
                <div 
                  key={prop.id} 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  style={{ top: `${top}%`, left: `${left}%` }}
                  onClick={() => { setSelectedProperty(prop); setCurrentImageIndex(0); }}
                >
                  <div className="bg-white dark:bg-slate-900 rounded-full px-3 py-1 shadow-xl font-bold text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 transition-transform group-hover:scale-110 mb-1 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    {prop.price}
                  </div>
                  <div className="h-3 w-3 bg-blue-500 rotate-45 mx-auto -mt-3 shadow-md border-r border-b border-transparent dark:border-transparent"></div>
                </div>
              );
            })}
            
            <div className="absolute bottom-6 left-6 right-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-blue-500" />
                Interactive Map View
              </p>
              <p className="text-sm text-slate-500 mt-1">Select a marker on the map to interact with nearby properties in real-time.</p>
            </div>
          </div>
        )}

        {displayedProperties.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedProperties.map((prop) => (
              <Card key={prop.id} className="group overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
                  <Image
                    src={prop.image}
                    alt={prop.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity group-hover:opacity-90" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 font-black text-[10px] tracking-widest uppercase">
                      {prop.type}
                    </Badge>
                    <button 
                      onClick={(e) => toggleWishlist(prop.id, e)}
                      className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all group/btn"
                    >
                      <Heart className={`h-5 w-5 transition-transform group-hover/btn:scale-110 ${wishlist.includes(prop.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Realtime Live Viewers Tag */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Activity className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">{prop.viewers} viewing</span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-2xl font-black">{prop.price}</p>
                  </div>
                  
                  {/* Overlay Action */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none z-10">
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3 min-h-[28px]">
                    <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-black text-amber-700 dark:text-amber-500">{prop.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white mb-2 line-clamp-1">{prop.title}</CardTitle>
                  <p className="flex items-center text-sm font-medium text-slate-500 mb-6 line-clamp-1">
                    <MapPin className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                    {prop.location}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <Bed className="h-5 w-5 text-blue-500 mb-1" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{prop.beds} Beds</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <Bath className="h-5 w-5 text-blue-500 mb-1" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{prop.baths} Baths</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <Square className="h-5 w-5 text-blue-500 mb-1" />
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 truncate w-full text-center">{prop.size}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0 mt-auto z-20">
                  <Button
                    onClick={() => { setSelectedProperty(prop); setCurrentImageIndex(0); }}
                    className="w-full h-14 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Eye className="h-5 w-5" />
                    Explore Property
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Apartment Details Modal */}
      <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh] gap-0">
          {selectedProperty && (
            <>
              {/* Left Side: Images */}
              <div className="relative w-full md:w-[50%] h-64 md:h-[600px] shrink-0 group">
                <Image
                  src={selectedProperty.images[currentImageIndex]}
                  alt={selectedProperty.title}
                  fill
                  className="object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {selectedProperty.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all z-10 hover:scale-110 border border-white/20"
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? selectedProperty.images.length - 1 : prev - 1); }}
                    >
                      <ChevronLeft className="h-7 w-7" />
                    </button>
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all z-10 hover:scale-110 border border-white/20"
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === selectedProperty.images.length - 1 ? 0 : prev + 1); }}
                    >
                      <ChevronRight className="h-7 w-7" />
                    </button>
                  </>
                )}

                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <Badge className="bg-red-500/90 text-white backdrop-blur-md border-none shadow-lg text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 animate-pulse" />
                    {selectedProperty.viewers} Viewing Now
                  </Badge>
                  <button 
                    onClick={(e) => toggleWishlist(selectedProperty.id, e)}
                    className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/40 transition-all"
                  >
                    <Heart className={`h-5 w-5 ${wishlist.includes(selectedProperty.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-white/20 text-white backdrop-blur-md border-white/30 text-xs font-black uppercase">
                      Tour Available
                    </Badge>
                    <Badge className="bg-indigo-500/90 text-white backdrop-blur-md border-none text-xs font-black uppercase">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {selectedProperty.images.map((_, idx) => (
                      <div key={idx} className={`h-1.5 rounded-full transition-all ${currentImageIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="p-6 md:p-8 flex-1 flex flex-col overflow-y-auto w-full md:w-[50%] bg-white dark:bg-slate-950">
                <DialogTitle className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white mb-2">
                  {selectedProperty.title}
                </DialogTitle>
                <div className="flex items-center text-sm font-medium text-slate-500 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <MapPin className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  {selectedProperty.location}
                  <span className="ml-auto text-blue-500 cursor-pointer hover:underline text-xs flex items-center gap-1">
                    <MapIcon className="h-3 w-3" /> View Map
                  </span>
                </div>

                <div className="text-4xl font-black text-blue-600 dark:text-blue-500 mb-6 flex items-end gap-2">
                  {selectedProperty.price}
                  {selectedProperty.type !== 'Shortlet' ? <span className="text-sm font-medium text-slate-400 mb-2">/ year</span> : <span className="text-sm font-medium text-slate-400 mb-2">/ night</span>}
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 mb-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-2">
                  <div className="flex flex-col items-center justify-center p-3">
                    <Bed className="h-6 w-6 text-indigo-500 mb-2" />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-300">{selectedProperty.beds} Beds</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border-x border-slate-200 dark:border-slate-800">
                    <Bath className="h-6 w-6 text-indigo-500 mb-2" />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-300">{selectedProperty.baths} Baths</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3">
                    <Square className="h-6 w-6 text-indigo-500 mb-2" />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-300">{selectedProperty.size}</span>
                  </div>
                </div>

                <div className="mb-8 flex-1">
                  <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Description</h3>
                  <DialogDescription className="text-sm md:text-base leading-loose text-slate-600 dark:text-slate-400 h-full">
                    {selectedProperty.description}
                  </DialogDescription>

                  {/* Super feature additions */}
                  <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" /> PowerHub Guarantee
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300/80 leading-relaxed">
                      This property is verified by our field agents. Rent payments can be securely processed with our automated escrow system for complete peace of mind.
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl font-bold text-base flex-1 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => {
                      toast({ title: 'Virtual Tour Starting', description: `Loading 360° environment for ${selectedProperty.title}...` });
                    }}
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Virtual Tour
                  </Button>
                  <Button 
                    variant="default" 
                    className="h-14 rounded-2xl font-black text-base shadow-xl shadow-green-500/20 active:scale-95 transition-all bg-green-500 hover:bg-green-600 text-white flex-1"
                    onClick={() => {
                      toast({ title: 'Connecting to Agent', description: `Dialing secure line ${selectedProperty.ownerPhone}...` });
                    }}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Agent
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
