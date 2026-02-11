"use client";

import { useState } from "react";
import { Calendar, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { schedulePickupAction } from "@/app/waste-management/actions";
import { toast } from "sonner";

export function SchedulePickupDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await schedulePickupAction(formData);

    if (result.success) {
      toast.success(result.message);
      setIsOpen(false); // Close modal on success
    }
    setIsPending(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Schedule Waste Pickup
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Arit Okon"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Contact Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="080..."
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address (Specific Landmark)</Label>
            <Input
              id="address"
              name="address"
              placeholder="Near Marian Market..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="wasteType">Waste Category</Label>
              <Select name="wasteType" defaultValue="household">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="household">Household</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="recyclable">Recyclable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pickupDate">Date</Label>
              <Input id="pickupDate" name="pickupDate" type="date" required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Processing..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
