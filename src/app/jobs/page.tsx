
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function JobsPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Job Board</h1>
        <p className="text-muted-foreground">
          Find local employment opportunities.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Briefcase />
            Jobs
          </CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Here you will find a list of job openings from local employers. Businesses will be able to post jobs, and residents can apply.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
