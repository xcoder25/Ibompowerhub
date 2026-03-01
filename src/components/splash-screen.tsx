
import Image from "next/image";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-pulse">
          <Image
            src="/aks.png"
            alt="Arise AKS Logo"
            width={140}
            height={140}
            priority
          />
        </div>
        <span className="font-headline text-5xl font-black tracking-tight">
          Arise AKS
        </span>
      </div>
    </div>
  );
}
