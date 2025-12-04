import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ withText = false, className }: { withText?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 font-headline text-lg font-bold", className)}>
        <div className="relative flex items-center justify-center size-9">
            <Image
                src="/crs.png"
                alt="PowerHub CRS Logo"
                width={36}
                height={36}
            />
        </div>
      {withText && <span className="whitespace-nowrap">PowerHub CRS</span>}
    </div>
  );
}
