
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function IssuesPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Issues</h1>
        <p className="text-muted-foreground">
          Track and report issues in your neighborhood.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Lightbulb />
            Issues
          </CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will be able to see a list of all reported issues, their statuses, and report new ones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
