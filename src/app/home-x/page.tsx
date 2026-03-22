'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Home, MapPin, Search, Filter, Bed, Bath, Square, Heart, Star, Navigation2, Eye, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const properties = [
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
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 812 345 6789'
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
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 903 444 1122'
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
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600607687931-ce82bd48c772?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 701 223 9988'
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
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 809 111 0000'
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
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 815 666 4433'
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
      'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
    ],
    ownerPhone: '+234 703 123 4567'
  }
];

const categories = ['All', 'Apartment', 'Duplex', 'Studio', 'Commercial', 'Shortlet'];

export default function HomeXPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [displayedProperties, setDisplayedProperties] = useState(properties);
  const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  const handleSearch = (term: string, category: string) => {
    let filtered = properties.filter(prop => {
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

  const handleTour = (title: string) => {
    toast({
      title: 'Tour Requested',
      description: `A physical or virtual tour request for ${title} has been sent to the agent.`,
    });
  };

  return (
    <div className="flex-1 w-full max-w-[100vw] bg-slate-50/50 dark:bg-slate-950 overflow-x-hidden">
      {/* Premium Hero Section */}
      <div className="relative w-full h-[25vh] sm:h-[30vh] md:h-[35vh] lg:h-[45vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600"
          alt="HomeX Banner"
          fill
          className="object-cover transition-transform duration-1000 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 flex flex-col gap-2 sm:gap-3 max-w-2xl">
          <Badge className="w-fit bg-blue-500 text-white border-none shadow-lg text-[10px] sm:text-xs tracking-widest uppercase">
            Home-x Property
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-xl">
            Find your <span className="text-blue-400">dream space.</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base font-medium max-w-sm drop-shadow-md">
            Rent, buy, and lease vetted premium properties directly in Akwa Ibom.
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
                className="pl-12 h-14 bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-2xl text-base font-medium ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-500/20"
                value={searchTerm}
                onChange={handleSearchTermChange}
              />
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
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        
        {displayedProperties.length === 0 && (
          <div className='text-center py-20'>
            <div className="bg-slate-100 dark:bg-slate-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-10 w-10 text-slate-400" />
            </div>
            <p className='font-black text-2xl mb-2 text-slate-900 dark:text-white'>No properties found</p>
            <p className="text-slate-500 font-medium">We couldn't find any homes matching your search criteria.</p>
          </div>
        )}

        {displayedProperties.length > 0 && (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 font-black text-[10px] tracking-widest uppercase">
                      {prop.type}
                    </Badge>
                    <button className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-all group/btn">
                      <Heart className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                    </button>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-2xl font-black">{prop.price}</p>
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
                
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button
                    onClick={() => { setSelectedProperty(prop); setCurrentImageIndex(0); }}
                    className="w-full h-14 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Eye className="h-5 w-5" />
                    View Apartment
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Apartment Details Modal */}
      <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px] gap-0">
          {selectedProperty && (
            <>
              {/* Left Side: Images */}
              <div className="relative w-full md:w-[50%] h-64 md:h-[600px] shrink-0 group">
                <Image
                  src={selectedProperty.images[currentImageIndex]}
                  alt={selectedProperty.title}
                  fill
                  className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                
                {selectedProperty.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all z-10"
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? selectedProperty.images.length - 1 : prev - 1); }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all z-10"
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === selectedProperty.images.length - 1 ? 0 : prev + 1); }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <Badge className="bg-blue-500 text-white border-none shadow-lg text-xs font-black tracking-widest uppercase">
                    {selectedProperty.type}
                  </Badge>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {selectedProperty.images.map((_, idx) => (
                      <div key={idx} className={`h-1.5 rounded-full transition-all ${currentImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="p-6 md:p-8 flex-1 flex flex-col overflow-y-auto w-full md:w-[50%]">
                <DialogTitle className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white mb-2">
                  {selectedProperty.title}
                </DialogTitle>
                <div className="flex items-center text-sm font-medium text-slate-500 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <MapPin className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  {selectedProperty.location}
                </div>

                <div className="text-3xl font-black text-blue-600 dark:text-blue-500 mb-6">
                  {selectedProperty.price}
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 mb-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-2">
                  <div className="flex flex-col items-center justify-center p-3">
                    <Bed className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-300">{selectedProperty.beds} Beds</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border-x border-slate-200 dark:border-slate-800">
                    <Bath className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-300">{selectedProperty.baths} Baths</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3">
                    <Square className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-300">{selectedProperty.size}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Overview</h3>
                  <DialogDescription className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400 h-full">
                    {selectedProperty.description}
                  </DialogDescription>
                </div>

                <div className="mt-auto pt-6">
                  <Button 
                    variant="default" 
                    className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-green-500/20 active:scale-95 transition-all bg-green-500 hover:bg-green-600 text-white gap-2"
                    onClick={() => {
                      toast({ title: 'Connecting to Owner', description: `Dialing ${selectedProperty.ownerPhone}...` });
                    }}
                  >
                    <Phone className="h-5 w-5" />
                    Contact Owner
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
