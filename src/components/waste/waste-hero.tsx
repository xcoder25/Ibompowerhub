import Image from "next/image";
import Crs from "../../../public/crs.png";
import { Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { ReportIssueDialog } from "@/components/report-issue-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SchedulePickupDialog } from "./schedule-pickup";

export default function WasteHero() {
  const heroImage = PlaceHolderImages.find(
    (img) => img.id === "waste-management-hero",
  );

  return (
    <Card className="overflow-hidden border-none bg-slate-900">
      <div className="relative h-64 w-full">
        <Image
          src={Crs}
          fill
          alt="Waste Management"
          className="object-cover opacity-60"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-scenter p-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Clean Cross River
          </h1>
          <p className="text-slate-200 max-w-xl text-lg">
            Supporting Calabar's beauty through smart waste management and
            community action.
          </p>
        </div>
      </div>
      <CardFooter className="p-4 bg-slate-50 flex flex-col sm:flex-row gap-3">
        <ReportIssueDialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="mr-2 h-4 w-4" /> Report Illegal Dumping
            </Button>
          </DialogTrigger>
        </ReportIssueDialog>
        <SchedulePickupDialog>
          <Button variant="outline" className="w-full">
            <Calendar className="mr-2 h-4 w-4" /> Schedule Pickup
          </Button>
        </SchedulePickupDialog>
      </CardFooter>
    </Card>
  );
}
