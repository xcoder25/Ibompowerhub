
'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
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


export function AssistantFAB() {
  const fabRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set initial position for desktop and mobile
    const initialX = window.innerWidth - (isMobile ? 80 : 100);
    const initialY = window.innerHeight - (isMobile ? 180 : 100);
    setPosition({ x: initialX, y: initialY });
  }, [isMobile]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!fabRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: clientX - fabRef.current.offsetLeft,
      y: clientY - fabRef.current.offsetTop,
    });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !fabRef.current) return;

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    
    // Check if the button has moved more than a few pixels to count as a drag
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      setHasMoved(true);
    }

    // Constrain movement within the viewport
    const maxX = window.innerWidth - fabRef.current.offsetWidth;
    const maxY = window.innerHeight - fabRef.current.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasMoved) {
      e.preventDefault(); // Prevent navigation if it was a drag
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={fabRef}
            asChild
            className={cn(
              'fixed h-14 w-14 rounded-full shadow-2xl z-30 cursor-grab',
              isDragging && 'cursor-grabbing'
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
          >
            <Link href="/assistant" aria-label="AI Assistant" draggable="false">
              <MessageSquare className="h-7 w-7" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
