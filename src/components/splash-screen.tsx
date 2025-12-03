
import { Logo } from './logo';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950">
      <div className="animate-pulse">
        <Logo withText={true} className="text-4xl" />
      </div>
    </div>
  );
}
