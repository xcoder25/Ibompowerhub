import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ withText = false, className, size = 36, layout = 'row' }: { withText?: boolean; className?: string; size?: number; layout?: 'row' | 'col' }) {
  return (
    <div className={cn(
      "flex items-center font-headline font-bold",
      layout === 'row' ? 'gap-2.5 text-lg' : 'flex-col gap-4',
      className
    )}>
      <div className="relative flex items-center justify-center">
        <Image
          src="/aks.png"
          alt="Arise AKS Logo"
          width={size}
          height={size}
          priority={size > 50}
        />
      </div>
      {withText && <span className="whitespace-nowrap text-green-800">Arise AKS</span>}
    </div>
  );
}
