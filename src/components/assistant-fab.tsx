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

export function AssistantFAB() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-2xl z-30"
            size="icon"
          >
            <Link href="/assistant" aria-label="AI Assistant">
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
