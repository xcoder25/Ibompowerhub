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
    <Card className="overflow-hidden shadow-md rounded-3xl bg-slate-900 border-none">
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={Crs}
          fill
          alt="Waste Management"
          className="object-cover opacity-60"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/20">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 text-center">
            Clean Akwa Ibom
          </h1>
          <p className="text-slate-200 max-w-xl text-sm md:text-base font-medium text-center drop-shadow-md">
            Preserving our state's beauty through smart waste management and
            community action.
          </p>
        </div>
      </div>
      <CardFooter className="p-4 sm:p-5 bg-slate-50 flex flex-col sm:flex-row gap-3">
        <ReportIssueDialog>
          <DialogTrigger asChild>
            <Button className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95">
              <Trash2 className="mr-2 h-4 w-4" /> Report Illegal Dumping
            </Button>
          </DialogTrigger>
        </ReportIssueDialog>
        <SchedulePickupDialog>
          <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-100 transition-all active:scale-95">
            <Calendar className="mr-2 h-4 w-4" /> Schedule Pickup
          </Button>
        </SchedulePickupDialog>
      </CardFooter>
    </Card>
  );
}
