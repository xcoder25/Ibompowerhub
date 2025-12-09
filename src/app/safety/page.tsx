
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Phone, AlertTriangle, ChevronRight } from 'lucide-react';
import { emergencyContacts } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SafetyPage() {
  const alertImage = PlaceHolderImages.find(img => img.id === 'safety-alert');

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Safety</h1>
        <p className="text-muted-foreground">Safety tips, emergency contacts, and alerts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card glassy className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Recent Safety Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-semibold">Road Closure on Marian Road</p>
                  <p className="text-sm text-muted-foreground">Due to fallen tree. Avoid area.</p>
                </div>
                <Button variant="ghost" size="icon"><ChevronRight/></Button>
             </div>
             <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-semibold">High Tension Cable Down</p>
                  <p className="text-sm text-muted-foreground">At Etta Agbor. Power company has been notified.</p>
                </div>
                <Button variant="ghost" size="icon"><ChevronRight/></Button>
             </div>
          </CardContent>
        </Card>
        
        <Card glassy className="overflow-hidden">
            {alertImage && (
                <div className="relative h-32 w-full">
                    <Image src={alertImage.imageUrl} alt="Safety Tip" fill className="object-cover" data-ai-hint={alertImage.imageHint}/>
                </div>
            )}
            <CardHeader>
                <CardTitle className="font-headline text-lg">Safety Tip of the Day</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Always be aware of your surroundings, especially at night. Walk in well-lit areas and avoid taking shortcuts through isolated places.</p>
            </CardContent>
        </Card>

      </div>

      <Card glassy className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Phone /> Emergency Contacts
          </CardTitle>
          <CardDescription>Quick access to emergency services in Calabar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-3">
                <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-lg font-mono tracking-wider">{contact.number}</p>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <a href={`tel:${contact.number}`}>Call Now</a>
                </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
