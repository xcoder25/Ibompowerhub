'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Report = {
  id: string;
  category: string;
  description: string;
  location: string;
  status: 'New' | 'Verified' | 'In Progress' | 'Resolved';
  time: Timestamp;
  user: {
    name: string;
    avatarUrl?: string;
  };
};

const statusColors: { [key: string]: string } = {
    New: 'bg-blue-100 text-blue-800 border-blue-300',
    Verified: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'In Progress': 'bg-orange-100 text-orange-800 border-orange-300',
    Resolved: 'bg-green-100 text-green-800 border-green-300',
};

export default function CudaDashboardPage() {
  const firestore = useFirestore();
  const reportsRef = useMemoFirebase(() => (firestore ? collection(firestore, 'reports') : null), [firestore]);
  const { data: reports, isLoading } = useCollection<Report>(reportsRef);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredReports = reports?.filter(report => {
      const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            report.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
      return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">CUDA Report Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and track all community-submitted reports.
        </p>
      </div>

      <Card glassy>
        <CardHeader className='flex flex-col md:flex-row items-center gap-4'>
            <div className='flex-1'>
                 <CardTitle>Incoming Reports</CardTitle>
                 <CardDescription>
                    {filteredReports.length} report(s) matching current filters.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-background/50 w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-background/50">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Verified">Verified</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.category}</TableCell>
                    <TableCell className='max-w-xs truncate'>{report.description}</TableCell>
                    <TableCell>
                        <Badge className={cn('border', statusColors[report.status])}>{report.status}</Badge>
                    </TableCell>
                    <TableCell>{report.user.name}</TableCell>
                    <TableCell>{report.time ? new Date(report.time.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='text-destructive'>Delete Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
