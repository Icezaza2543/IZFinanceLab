import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-xl border border-[#D5D0C5] bg-[#FBFAF7] px-3.5 py-2 text-base font-numeric text-[#181A18] transition-colors outline-none placeholder:text-[#68655D]/60 focus-visible:border-[#A28143] focus-visible:ring-1 focus-visible:ring-[#A28143] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
