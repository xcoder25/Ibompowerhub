
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const issues = [
    { id: 1, issue: 'Broken Streetlight', location: 'Marian Rd', status: 'Reported' },
    { id: 2, issue: 'Pothole', location: 'Etta Agbor', status: 'In Progress' },
    { id: 3, issue: 'Waste Collection Missed', location: '8 Miles', status: 'Resolved' },
];

export default function IssuesPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Issues</h1>
        <p className="text-muted-foreground">Track and report issues in your neighborhood.</p>
      </div>

      <Card glassy>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>All Reported Issues</CardTitle>
           <div className='flex items-center gap-2 w-full sm:w-auto'>
                <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search issues..." className="pl-9 bg-background/50 h-9 w-full" />
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
           </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {issues.map(issue => (
                        <TableRow key={issue.id}>
                            <TableCell className='font-medium'>{issue.issue}</TableCell>
                            <TableCell>{issue.location}</TableCell>
                            <TableCell>
                                <Badge variant={issue.status === 'Resolved' ? 'default': 'secondary'}>{issue.status}</Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                                <Button variant="outline" size="sm">View</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
