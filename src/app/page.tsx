
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplashScreen } from '@/components/splash-screen';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';

// Mock authentication state. We'll replace this with real auth later.
const useMockAuth = () => {
    const [isSignedUp, setIsSignedUp] = useState(false);
    useEffect(() => {
        // In a real app, you'd check for a token or session here.
        // For now, we'll just simulate it.
        const userHasSignedUp = localStorage.getItem('hasSignedUp') === 'true';
        setIsSignedUp(userHasSignedUp);
    }, []);
    return { isSignedUp };
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const { isSignedUp } = useMockAuth();
  const seaImage = PlaceHolderImages.find((img) => img.id === 'sea-background');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // Shorter splash screen
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="relative h-screen w-full flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        {seaImage && (
          <Image
            src={seaImage.imageUrl}
            alt={seaImage.description}
            fill
            className="object-cover animate-pan-slow"
            data-ai-hint={seaImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/50 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            <Logo withText={true} className="text-5xl text-slate-800" />
            <p className="mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
              One map. All the services. Everyday life, simplified.
            </p>
            <div className='mt-8 flex flex-col sm:flex-row gap-4'>
                {isSignedUp ? (
                    <Button asChild size="lg">
                        <Link href="/login"> 
                            Login to Continue <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                ) : (
                    <>
                        <Button asChild size="lg">
                            <Link href="/signup">
                                Get Started <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/login">
                                Login
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
