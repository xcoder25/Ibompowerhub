
"use client";

import { useState } from 'react';
import { Loader2, Zap, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { getNeighborhoodStatus, type NeighborhoodStatusOutput } from '@/ai/flows/neighborhood-status-tool';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
    power: {
      ON: { icon: Zap, color: 'text-green-500 border-green-500', label: 'Power On' },
      OFF: { icon: Zap, color: 'text-red-500 border-red-500', label: 'Power Off' },
      UNKNOWN: { icon: Zap, color: 'text-gray-500 border-gray-500', label: 'Power Unknown' },
    },
    flood: {
      LOW: { icon: AlertTriangle, color: 'text-green-500 border-green-500', label: 'Low Risk' },
      MEDIUM: { icon: AlertTriangle, color: 'text-yellow-500 border-yellow-500', label: 'Medium Risk' },
      HIGH: { icon: AlertTriangle, color: 'text-red-500 border-red-500', label: 'High Risk' },
      UNKNOWN: { icon: AlertTriangle, color: 'text-gray-500 border-gray-500', label: 'Flood Unknown' },
    },
    waste: {
      NO: { icon: CheckCircle, color: 'text-green-500 border-green-500', label: 'Clean' },
      YES: { icon: Trash2, color: 'text-yellow-500 border-yellow-500', label: 'Waste Overflow' },
      UNKNOWN: { icon: Trash2, color: 'text-gray-500 border-gray-500', label: 'Waste Unknown' },
    },
  };

export default function NeighborhoodStatus() {
  const [reportSummaries, setReportSummaries] = useState(
    'Power outage reported on Marian Road. Flash flood near 8 Miles. Waste bin at Watt Market is full.'
  );
  const [status, setStatus] = useState<NeighborhoodStatusOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const result = await getNeighborhoodStatus({ reportSummaries });
      setStatus(result);
    } catch (error) {
      console.error('Error getting neighborhood status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card glassy className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-headline">Neighborhood Status</CardTitle>
        <CardDescription>AI-powered summary from recent reports.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <Textarea
            placeholder="Enter report summaries..."
            value={reportSummaries}
            onChange={(e) => setReportSummaries(e.target.value)}
            className="h-24 bg-background/50"
            />
        </div>

        {loading && <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin" /></div>}

        {status && (
            <div className='space-y-3'>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn('text-sm border-2', statusConfig.power[status.powerStatus].color)}>
                        {(() => {
                            const Icon = statusConfig.power[status.powerStatus].icon;
                            return <Icon className="mr-2 h-4 w-4" />;
                        })()}
                        {statusConfig.power[status.powerStatus].label}
                    </Badge>
                    <Badge variant="outline" className={cn('text-sm border-2', statusConfig.flood[status.floodRisk].color)}>
                        {(() => {
                            const Icon = statusConfig.flood[status.floodRisk].icon;
                            return <Icon className="mr-2 h-4 w-4" />;
                        })()}
                        {statusConfig.flood[status.floodRisk].label}
                    </Badge>
                      <Badge variant="outline" className={cn('text-sm border-2', statusConfig.waste[status.wasteOverflow].color)}>
                        {(() => {
                            const Icon = statusConfig.waste[status.wasteOverflow].icon;
                            return <Icon className="mr-2 h-4 w-4" />;
                        })()}
                        {statusConfig.waste[status.wasteOverflow].label}
                    </Badge>
                </div>
                  <p className="text-sm text-muted-foreground pt-2">{status.overallStatus}</p>
            </div>
        )}

      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalysis} disabled={loading} className="w-full">
          {loading ? 'Analyzing...' : 'Analyze Reports'}
        </Button>
      </CardFooter>
    </Card>
  );
}
