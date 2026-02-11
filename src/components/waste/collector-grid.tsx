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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by area or agency name..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((collector) => {
          const image = PlaceHolderImages.find(
            (img) => img.id === collector.imageId,
          );
          return (
            <Card
              key={collector.id}
              className="group hover:shadow-lg transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={collector.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{collector.name}</CardTitle>
                  <Badge variant="secondary">Verified</Badge>
                </div>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <MapPin className="h-3 w-3" /> {collector.serviceArea}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
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
