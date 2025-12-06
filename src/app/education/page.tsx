
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { educationalInstitutions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, Search } from 'lucide-react';
import Image from 'next/image';

export default function EducationPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Education Hub</h1>
        <p className="text-muted-foreground">Find schools, colleges, and educational resources in your community.</p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search for a school or program..." className="pl-10 text-base bg-background/50" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {educationalInstitutions.map((inst) => {
          const image = PlaceHolderImages.find((img) => img.id === inst.imageId);
          return (
            <Card key={inst.id} glassy className="overflow-hidden">
              {image && (
                <div className="relative h-40 w-full">
                  <Image src={image.imageUrl} alt={inst.name} fill className="object-cover" data-ai-hint={image.imageHint} />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline">{inst.name}</CardTitle>
                <CardDescription>{inst.type}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
