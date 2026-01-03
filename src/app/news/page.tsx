'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { newsArticles } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">News & Announcements</h1>
        <p className="text-muted-foreground">The latest updates from around Cross River State.</p>
      </div>

      <div className="grid gap-8">
        {newsArticles.map((article) => {
          const image = PlaceHolderImages.find((img) => img.id === article.imageId);
          return (
            <Card key={article.id} glassy className="overflow-hidden md:grid md:grid-cols-3">
              {image && (
                <div className="relative md:col-span-1 h-48 md:h-full">
                  <Image
                    src={image.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={article.category === 'Government' ? 'default' : 'secondary'}>
                      {article.category}
                    </Badge>
                    <CardDescription>{article.date}</CardDescription>
                  </div>
                  <CardTitle className="font-headline text-xl">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{article.summary}</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline">
                        Read More <ArrowRight className='ml-2'/>
                    </Button>
                </CardFooter>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
