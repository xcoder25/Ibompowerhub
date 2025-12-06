
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote } from 'lucide-react';

export default function VotingPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Voting</h1>
        <p className="text-muted-foreground">
          Participate in local polls and decision-making.
        </p>
      </div>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Vote />
            Voting
          </CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This section will allow residents to participate in community polls, vote on local issues, and see the results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
