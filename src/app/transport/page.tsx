import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const popularRoutes = [
  { from: '8 Miles', to: 'Watt Market', fare: '₦300' },
  { from: 'Marian', to: 'Unical', fare: '₦200' },
  { from: 'Housing Estate', to: 'Akpabuyo', fare: '₦500' },
  { from: 'Airport', to: 'Tinapa', fare: '₦400' },
];

export default function TransportPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Transport Guide</h1>
        <p className="text-muted-foreground">
          Estimate fares and find information on local routes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Route Fare Estimator</CardTitle>
          <CardDescription>Enter your origin and destination to get an estimated fare.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Input placeholder="Origin" className='text-base' />
            <Input placeholder="Destination" className='text-base'/>
          </div>
          <Button className="w-full md:w-auto">
            Estimate Fare
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
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
