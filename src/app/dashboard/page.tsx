
'use client';

import { BarChart, Users, Megaphone, AlertTriangle, AreaChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

const chartData = [
  { date: '2024-07-01', reports: 5 },
  { date: '2024-07-02', reports: 7 },
  { date: '2024-07-03', reports: 6 },
  { date: '2024-07-04', reports: 9 },
  { date: '2024-07-05', reports: 8 },
  { date: '2024-07-06', reports: 12 },
  { date: '2024-07-07', reports: 10 },
];

const recentReports = [
  { type: 'Power Outage', location: 'Marian Road', time: '1h ago', priority: 'High' },
  { type: 'Waste Overflow', location: 'Watt Market', time: '3h ago', priority: 'Medium' },
  { type: 'Flooding', location: '8 Miles', time: '5h ago', priority: 'High' },
  { type: 'Transport Issue', location: 'Highway', time: '1d ago', priority: 'Low' },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Dashboard</h1>
        <p className="text-muted-foreground">An overview of your neighborhood's pulse.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card glassy>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground">+32 since last week</p>
          </CardContent>
        </Card>
        <Card glassy>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">5 resolved today</p>
          </CardContent>
        </Card>
        <Card glassy>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Priority Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">New power outage report</p>
          </CardContent>
        </Card>
        <Card glassy>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+540</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card glassy className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Report Trends</CardTitle>
            <CardDescription>Number of reports submitted over the past 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                reports: {
                  label: 'Reports',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area dataKey="reports" type="monotone" fill="url(#colorReports)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card glassy className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Recent Reports</CardTitle>
            <CardDescription>A live feed of the latest issues in the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{report.type}</p>
                    <p className="text-sm text-muted-foreground">{report.location}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={report.priority === 'High' ? 'destructive' : report.priority === 'Medium' ? 'secondary' : 'outline'}
                      className="mb-1"
                    >
                      {report.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{report.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
