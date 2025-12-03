import Image from 'next/image';
import { Plus } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import NeighborhoodStatus from '@/components/neighborhood-status';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';

export default function Home() {
  const mapImage = PlaceHolderImages.find((img) => img.id === 'map-main');

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="relative w-full h-full flex-1">
        {mapImage && (
          <Image
            src={mapImage.imageUrl}
            alt={mapImage.description}
            fill
            className="object-cover"
            data-ai-hint={mapImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="absolute top-4 left-4">
          <NeighborhoodStatus />
        </div>
      </div>

      <ReportIssueDialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-20"
            aria-label="Report an issue"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </DialogTrigger>
      </ReportIssueDialog>
    </div>
  );
}
