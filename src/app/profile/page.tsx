import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Edit, Star, FileText, Settings, LogOut, Package, Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 bg-secondary/50">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {userAvatar && (
                <Avatar className="h-24 w-24 border-4 border-primary">
                  <AvatarImage src={userAvatar.imageUrl} alt="Esther Howard" />
                  <AvatarFallback>EH</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-headline text-3xl font-bold">Esther Howard</h1>
                <p className="text-muted-foreground">Resident / Service Provider</p>
                <div className="flex items-center justify-center md:justify-start gap-1 mt-1 text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5" />
                  <span className="text-muted-foreground ml-2">(4.1 Rating)</span>
                </div>
              </div>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                    <FileText className='size-6 text-primary' />
                    <CardTitle className='font-headline'>My Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-3xl font-bold'>12</p>
                    <p className='text-xs text-muted-foreground'>Total reports submitted</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                    <Star className='size-6 text-primary' />
                    <CardTitle className='font-headline'>Favorites</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-3xl font-bold'>5</p>
                    <p className='text-xs text-muted-foreground'>Saved sellers & artisans</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                    <Settings className='size-6 text-primary' />
                    <CardTitle className='font-headline'>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary" className='w-full justify-start'>Account & Security</Button>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Provider Dashboard</CardTitle>
            <CardDescription>Manage your services and availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className='flex items-center gap-4'>
                    <Package className='size-6 text-muted-foreground'/>
                    <div>
                        <Label htmlFor="listing-status" className='font-semibold'>My Listings</Label>
                        <p className='text-sm text-muted-foreground'>Manage your products or services</p>
                    </div>
                </div>
                <Button variant="outline">View Listings</Button>
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className='flex items-center gap-4'>
                    <Power className='size-6 text-muted-foreground'/>
                    <div>
                        <Label htmlFor="availability-status" className='font-semibold'>Availability</Label>
                        <p className='text-sm text-muted-foreground'>Set your status to available for requests</p>
                    </div>
                </div>
              <Switch id="availability-status" defaultChecked/>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
