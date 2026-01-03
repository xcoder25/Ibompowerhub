
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus, Bot, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { popularRoutes, fareEstimates } from '@/lib/data';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getNavigationRoute } from '@/ai/flows/map-navigation-flow';


export default function TransportPage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [estimatedFare, setEstimatedFare] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const { toast } = useToast();

    const handleEstimate = () => {
        if (!origin || !destination) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please enter both origin and destination.',
            });
            return;
        }
        
        const key = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
        const fare = fareEstimates[key];

        if (fare) {
            setEstimatedFare(fare);
        } else {
            setEstimatedFare(null);
            toast({
                title: 'No standard fare found',
                description: 'This route may not have a standard fare. Check with the driver.',
            });
        }
    }

    const handleAiEstimate = async () => {
        if (!origin && !destination) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please enter a route to get a fare estimate.',
            });
            return;
        }

        setAiLoading(true);
        setEstimatedFare(null);

        try {
            // Re-using the navigation flow to parse origin/destination
            const result = await getNavigationRoute({ query: `from ${origin} to ${destination}`});
            const key = `${result.origin.toLowerCase()}-${result.destination.toLowerCase()}`;
            const fare = fareEstimates[key];
            if (fare) {
                 setEstimatedFare(fare);
                 setOrigin(result.origin);
                 setDestination(result.destination);
            } else {
                 setEstimatedFare(null);
                 toast({
                    title: 'No standard fare found',
                    description: 'The AI could not find a standard fare for this route.',
                });
            }
        } catch (error) {
            console.error("AI Fare Estimation error:", error);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not understand the route.' });
        } finally {
            setAiLoading(false);
        }
    }


  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Transport Guide</h1>
        <p className="text-muted-foreground">
          Estimate fares and find information on local routes.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline">Route Fare Estimator</CardTitle>
          <CardDescription>Enter your origin and destination to get an estimated fare.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Input placeholder="Origin (e.g., 8 Miles)" className='text-base bg-background/50' value={origin} onChange={e => setOrigin(e.target.value)} />
            <Input placeholder="Destination (e.g., Watt Market)" className='text-base bg-background/50' value={destination} onChange={e => setDestination(e.target.value)} />
          </div>
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button className="w-full sm:w-auto" onClick={handleEstimate}>
                Estimate Fare
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleAiEstimate} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                AI Estimate
            </Button>
          </div>
           {estimatedFare && (
            <div className='pt-4'>
                <p className='text-sm text-muted-foreground'>Estimated Fare:</p>
                <p className='text-2xl font-bold text-primary'>{estimatedFare}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline">Local Fare Reference</CardTitle>
          <CardDescription>Standard fares for popular routes within Calabar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Fare</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularRoutes.map((route, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{route.from}</TableCell>
                  <TableCell>{route.to}</TableCell>
                  <TableCell className="text-right font-semibold">{route.fare}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
