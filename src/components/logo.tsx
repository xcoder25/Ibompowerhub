import { cn } from "@/lib/utils"

export function Logo({ withText = false, className }: { withText?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 font-headline text-lg font-bold", className)}>
        <div className="relative flex items-center justify-center size-9">
            <svg
                viewBox="0 0 24 24"
                className="absolute text-primary fill-current"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative size-4"
            >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        </div>
      {withText && <span className="whitespace-nowrap">PowerHub CRS</span>}
    </div>
  );
}
