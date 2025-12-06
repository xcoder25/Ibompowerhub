
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Safety</h1>
        <p className="text-muted-foreground">
          Safety tips, emergency contacts, and alerts.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Shield />
            Safety
          </CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This section will provide important safety information, local emergency contacts, and real-time safety alerts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
