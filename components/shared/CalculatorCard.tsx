'use client';

import React from 'react';
import { HelpCircle, RotateCcw } from 'lucide-react';

interface CalculatorCardProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onReset?: () => void;
  onOpenHelp?: () => void;
  children: React.ReactNode;
  resultNode: React.ReactNode;
  formulaNode?: React.ReactNode;
}

export function CalculatorCard({
  id,
  title,
  subtitle,
  badge,
  onReset,
  onOpenHelp,
  children,
  resultNode,
  formulaNode,
}: CalculatorCardProps) {
  return (
    <article
      id={id}
      className="rounded-2xl border border-[#D5D0C5] bg-[#FBFAF7] p-6 sm:p-8 shadow-[0_4px_24px_rgba(24,26,24,0.03)] transition-all"
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-[#D5D0C5]/70 pb-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            {badge && (
              <span className="inline-block rounded-md bg-[#EEEAE1] border border-[#D5D0C5] px-2.5 py-0.5 font-display text-xs tracking-[0.14em] uppercase text-[#A28143] font-semibold">
                {badge}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#181A18]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-[#68655D] leading-relaxed font-normal">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5D0C5] bg-[#FBFAF7] px-3 py-1.5 text-xs font-medium text-[#68655D] hover:text-[#181A18] hover:bg-[#EEEAE1] transition-colors"
              title="ดูคำอธิบายศัพท์และหลักการ"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#A28143]" />
              <span>หลักการ & คำศัพท์</span>
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5D0C5] bg-[#FBFAF7] px-3 py-1.5 text-xs font-medium text-[#68655D] hover:text-[#181A18] hover:bg-[#EEEAE1] transition-colors"
              title="คืนค่าตั้งต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ต</span>
            </button>
          )}
        </div>
      </header>

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-5">{children}</div>
        <div className="flex flex-col justify-between">{resultNode}</div>
      </div>

      {formulaNode && <div className="mt-5">{formulaNode}</div>}
    </article>
  );
}
