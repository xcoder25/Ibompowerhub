
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Power } from 'lucide-react';

export default function PowerPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Power Services</h1>
        <p className="text-muted-foreground">
          Information on power supply and outages.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Power />
            Power
          </CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will find information about power outage schedules, report issues, and view announcements from the power company.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
