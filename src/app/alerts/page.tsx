import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { alerts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  const mapPreviewImage = PlaceHolderImages.find((img) => img.id === 'map-preview');

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Alerts</h1>
        <p className="text-muted-foreground">
          Live feed of reports from your community. Upvote to confirm.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {alerts.map((alert) => {
          const userAvatar = PlaceHolderImages.find((img) => img.id === alert.user.avatarId);
          return (
            <Card key={alert.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start gap-4">
                  {userAvatar && (
                    <Avatar>
                      <AvatarImage src={userAvatar.imageUrl} alt={alert.user.name} />
                      <AvatarFallback>{alert.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{alert.user.name}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">in {alert.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 space-y-3">
                 <Badge variant="outline" className='border-2'>
                    <alert.Icon className={cn("mr-2 h-4 w-4", alert.iconColor)} />
                    {alert.type}
                 </Badge>
                <p>{alert.description}</p>
                {mapPreviewImage && (
                  <div className="rounded-lg overflow-hidden border">
                    <Image
                      src={mapPreviewImage.imageUrl}
                      alt="Map preview"
                      width={600}
                      height={150}
                      className="object-cover w-full"
                      data-ai-hint={mapPreviewImage.imageHint}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 flex justify-end gap-2 border-t">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {alert.upvotes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {alert.comments}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
