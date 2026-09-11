'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface TermBadgeProps {
  termTh: string;
  termEn?: string;
  termId?: string;
  onClick?: (termId: string) => void;
}

export function TermBadge({ termTh, termEn, termId, onClick }: TermBadgeProps) {
  return (
    <button
      type="button"
      onClick={() => termId && onClick?.(termId)}
      className="inline-flex items-center gap-1 text-xs text-[#7F632F] hover:text-[#53401B] font-medium hover:underline decoration-dotted cursor-pointer transition-colors font-ui"
      title={`คลิกเพื่อดูคำอธิบาย ${termTh} ${termEn ? `(${termEn})` : ''}`}
    >
      <span>{termTh}</span>
      <HelpCircle className="w-3 h-3 text-[#A28143]" />
    </button>
  );
}
