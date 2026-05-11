'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

// Simple Tooltip component
export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  if (!content) {
    return <>{children}</>;
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[side]}`}>
          <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

// Provider components that don't require content
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const TooltipTrigger = ({ children, ...props }: { children: React.ReactNode; asChild?: boolean }) => {
  return <div {...props}>{children}</div>;
};

export const TooltipContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("bg-gray-900 text-white text-xs rounded-lg px-2 py-1", className)}>{children}</div>;
};