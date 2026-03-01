'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { jobListings } from '@/lib/data';
import { Briefcase, MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLoading } from '@/context/loading-context';
import { useToast } from '@/hooks/use-toast';

export default function JobsPage() {
  const { isLoading } = useLoading();
  const { toast } = useToast();

  const handleApply = () => {
    toast({
      title: 'Application Sent!',
      description: 'Your application has been submitted successfully.'
    })
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Job Board</h1>
        <p className="text-muted-foreground">Find local employment opportunities.</p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search for jobs, companies, or keywords..." className="pl-10 text-base bg-background/50" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobListings.map((job) => {
          const image = PlaceHolderImages.find((img) => img.id === job.imageId);
          return (
            <Card key={job.id} glassy className="overflow-hidden flex flex-col">
              {image && (
                <div className="relative h-40 w-full">
                  <Image src={image.imageUrl} alt={job.title} fill className="object-cover" data-ai-hint={image.imageHint} />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline">{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleApply} disabled={isLoading}>Apply Now</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
