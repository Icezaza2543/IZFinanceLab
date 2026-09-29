'use client';

import React from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
}

export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = 'sm',
}: SegmentedToggleProps<T>) {
  return (
    <fieldset
      aria-label={ariaLabel}
      className="inline-flex min-w-0 shrink-0 rounded-lg border border-[#D5D0C5] bg-[#EEEAE1]/60 p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-md font-semibold transition-colors ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
            } ${
              active
                ? 'bg-[#1A221F] text-[#FBFAF7] shadow-sm'
                : 'text-[#68655D] hover:text-[#181A18] hover:bg-[#FBFAF7]/70'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </fieldset>
  );
}
