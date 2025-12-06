
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { waterSchedule } from '@/lib/data';
import { Droplets, Clock, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function WaterPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Water Services</h1>
        <p className="text-muted-foreground">Information on water supply schedules and service alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glassy>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
             <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Clock className="size-6" />
             </div>
            <div>
              <CardTitle>Your Area Status</CardTitle>
              <CardDescription>State Housing Estate</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-500">Water is running</p>
            <p className="text-sm text-muted-foreground">Next supply tomorrow, 6am - 12pm</p>
          </CardContent>
        </Card>
        <Card glassy>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
             <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <AlertTriangle className="size-6" />
             </div>
            <div>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Service interruptions</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
             <p className="font-semibold">Low pressure in 8 Miles</p>
             <p className="text-sm text-muted-foreground">Maintenance work ongoing. Expected resolution: 4pm.</p>
          </CardContent>
        </Card>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline">Water Supply Schedule</CardTitle>
          <CardDescription>Weekly timetable for different areas in Calabar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waterSchedule.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.area}</TableCell>
                  <TableCell>{item.days}</TableCell>
                  <TableCell className="font-semibold">{item.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
