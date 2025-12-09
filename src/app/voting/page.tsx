
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { polls } from '@/lib/data';
import { Vote } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function VotingPage() {
  const [votedPolls, setVotedPolls] = useState<Record<number, string>>({});

  const handleVote = (pollId: number, option: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: option }));
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Voting</h1>
        <p className="text-muted-foreground">Participate in local polls and decision-making.</p>
      </div>

      <div className="space-y-6">
        {polls.map((poll) => {
          const hasVoted = !!votedPolls[poll.id];
          const userVote = votedPolls[poll.id];

          return (
            <Card key={poll.id} glassy>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{poll.title}</CardTitle>
                <CardDescription>{poll.totalVotes} votes so far</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(poll.votes).map(([option, count]) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={option}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className={cn("font-medium", hasVoted && userVote === option && "text-primary")}>
                            {option}
                          </span>
                          {hasVoted && <span className="text-sm font-semibold">{percentage}%</span>}
                        </div>
                        {hasVoted ? (
                          <Progress value={percentage} />
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleVote(poll.id, option)}
                          >
                            Vote for {option}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
