
'use client';

import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';

type AssistantFABProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};


export function AssistantFAB({ onClick }: AssistantFABProps) {
  const fabRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInDismissZone, setIsInDismissZone] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {
    setIsDismissed(false);
  }, [pathname]);


  useEffect(() => {
    // Set initial position for desktop and mobile
    const initialX = window.innerWidth - (isMobile ? 80 : 100);
    const initialY = window.innerHeight - (isMobile ? 180 : 100);
    setPosition({ x: initialX, y: initialY });
  }, [isMobile]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!fabRef.current) return;
    setIsDragging(true);
    setHasMoved(false); // Reset move status on new drag start
    // Calculate offset from the top-left of the button
    const rect = fabRef.current.getBoundingClientRect();
    setDragStart({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !fabRef.current) return;

    // Calculate new position based on cursor position and initial offset
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // Check if the button has moved more than a few pixels to count as a drag
    if (!hasMoved) {
      const currentRect = fabRef.current.getBoundingClientRect();
      if (Math.abs(newX - currentRect.left) > 5 || Math.abs(newY - currentRect.top) > 5) {
        setHasMoved(true);
      }
    }

    // Constrain movement within the viewport
    const maxX = window.innerWidth - fabRef.current.offsetWidth;
    const maxY = window.innerHeight - fabRef.current.offsetHeight;

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: constrainedX, y: constrainedY });

    // Mark as dismissible if dragged into the bottom bar area or the left sidebar edge
    if (constrainedY > window.innerHeight - 100 || constrainedX < 30) {
      setIsInDismissZone(true);
    } else {
      setIsInDismissZone(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (isInDismissZone) {
      setIsDismissed(true);
    }
    setTimeout(() => setHasMoved(false), 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasMoved) {
      e.preventDefault(); // Prevent click if it was a drag
      e.stopPropagation();
    } else {
      onClick(e); // Fire the passed onClick handler
    }
  }

  if (isDismissed) return null;

  return (
    <>
      <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={fabRef}
            className={cn(
              'fixed h-14 w-14 rounded-full shadow-2xl z-[60] cursor-grab transition-[transform,background-color] duration-200',
              isDragging && 'cursor-grabbing scale-105',
              isInDismissZone && 'bg-red-500 hover:bg-red-600 scale-90 opacity-90 shadow-red-500/30'
            )}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              touchAction: 'none' // Prevent scrolling on mobile while dragging
            }}
            size="icon"
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
            onClick={handleClick}
            aria-label="Orion AI Assistant"
          >
            {isInDismissZone ? <X className="h-7 w-7 text-white animate-in zoom-in" /> : <Sparkles className="h-7 w-7" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Orion AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    {/* Dismiss visual indicator target */}
    {isDragging && (
      <>
        <div className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-full border-2 transition-all duration-300 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md pointer-events-none",
          isInDismissZone ? "border-red-500 text-red-500 scale-110 shadow-lg shadow-red-500/20" : "border-slate-300 dark:border-slate-700 text-slate-500"
        )}>
          <X className="h-6 w-6" />
        </div>
        {!isMobile && (
          <div className={cn(
            "fixed top-1/2 left-4 -translate-y-1/2 p-4 rounded-full border-2 transition-all duration-300 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md pointer-events-none",
            isInDismissZone ? "border-red-500 text-red-500 scale-110 shadow-lg shadow-red-500/20" : "border-slate-300 dark:border-slate-700 text-slate-500"
          )}>
            <X className="h-6 w-6" />
          </div>
        )}
      </>
    )}
    </>
  );
}
