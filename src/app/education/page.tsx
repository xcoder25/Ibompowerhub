
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function EducationPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Education</h1>
        <p className="text-muted-foreground">
          Find schools and educational resources.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <BookOpen />
            Education
          </CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This section will provide a directory of local schools, colleges, and other educational institutions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
