'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, AlertTriangle, Star, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ActivityList() {
    // Mock Data
    const activities = [
        {
            id: 1,
            type: 'forum',
            title: 'Posted in "Best places to get fresh seafood..."',
            time: '2 hours ago',
            icon: MessageSquare,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            id: 2,
            type: 'review',
            title: 'Reviewed Artisan "John Doe"',
            time: '1 day ago',
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
        {
            id: 3,
            type: 'alert',
            title: 'Reported Power Outage at Federal Housing',
            time: '3 days ago',
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        },
        {
            id: 4,
            type: 'task',
            title: 'Completed setup of profile',
            time: '1 week ago',
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        }
    ];

    return (
        <Card className='border border-border/50 bg-card/50'>
            <CardHeader>
                <CardTitle className="text-xl font-headline">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className={`p-2 rounded-full ${activity.bg} mt-0.5`}>
                                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
