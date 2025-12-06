
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { powerSchedule } from '@/lib/data';
import { Power, Zap, ZapOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PowerPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Power Services</h1>
        <p className="text-muted-foreground">Information on power supply, outages, and load shedding.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glassy>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Power className="size-6" />
            </div>
            <div>
              <CardTitle>Your Status</CardTitle>
              <CardDescription>Federal Housing, Group A</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">Power is ON</p>
            <p className="text-sm text-muted-foreground">Next outage in 4 hours</p>
          </CardContent>
        </Card>
        <Card glassy>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Zap className="size-6" />
            </div>
            <div>
              <CardTitle>Today's Runtime</CardTitle>
              <CardDescription>Total hours with power</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">10 hours</p>
            <p className="text-sm text-muted-foreground">42% of the day</p>
          </CardContent>
        </Card>
        <Card glassy>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <ZapOff className="size-6" />
            </div>
            <div>
              <CardTitle>Total Outage</CardTitle>
              <CardDescription>Total hours without power</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">14 hours</p>
            <p className="text-sm text-muted-foreground">58% of the day</p>
          </CardContent>
        </Card>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline">Load Shedding Schedule</CardTitle>
          <CardDescription>Find out when to expect power in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Power ON (duration)</TableHead>
                <TableHead>Power OFF (duration)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {powerSchedule.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.area}</TableCell>
                  <TableCell>{item.group}</TableCell>
                  <TableCell className="text-green-600 font-medium">{item.in}</TableCell>
                  <TableCell className="text-red-600 font-medium">{item.out}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
