
import Image from "next/image";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Image
          src="/crs.png"
          alt="PowerHub CRS Logo"
          width={80}
          height={80}
          priority
        />
        <span className="font-headline text-4xl font-bold">PowerHub CRS</span>
      </div>
    </div>
  );
}
