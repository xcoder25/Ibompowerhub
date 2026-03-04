"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function CollectorGrid({ collectors }: { collectors: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = collectors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serviceArea.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by area or agency name..."
          className="pl-10 h-11 rounded-xl bg-white/50 dark:bg-slate-900/50 border-white/20 shadow-sm focus-visible:ring-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((collector) => {
          const image = PlaceHolderImages.find(
            (img) => img.id === collector.imageId,
          );
          return (
            <Card
              key={collector.id}
              className="group hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden border border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl hover:-translate-y-1"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={collector.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <CardHeader className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg font-bold tracking-tight">{collector.name}</CardTitle>
                  <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0">Verified</Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5 mt-2 text-[13px] font-medium text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {collector.serviceArea}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full h-11 rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 border-emerald-200 transition-colors" variant="outline">
                  <a href={`tel:${collector.phone}`}>
                    <Phone className="mr-2 h-4 w-4" /> Contact Agent
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
