import React from 'react';
import { cn } from '../../lib/utils'; // Assuming cn is in utils.js

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  // Simplified Button component - in reality, might have variants from shadcn/ui
  const Comp = asChild ? 'div' : 'button'; // Not handling Slot from shadcn/ui for simplicity
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        // Example variants (simplified)
        variant === 'destructive' ? 'bg-red-500 text-white hover:bg-red-600' :
        variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' :
        'bg-blue-500 text-white hover:bg-blue-600', // Default variant
        // Example sizes (simplified)
        size === 'sm' ? 'h-9 rounded-md px-3' :
        size === 'lg' ? 'h-11 rounded-md px-8' :
        'h-10 px-4 py-2', // Default size
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };
