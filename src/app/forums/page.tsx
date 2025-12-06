
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function ForumsPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Forums</h1>
        <p className="text-muted-foreground">
          Discuss topics with your neighbors.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <MessageSquare />
            Forums
          </CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This section will host community discussion boards where residents can connect, share ideas, and discuss local topics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
