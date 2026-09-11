'use client';

import React from 'react';

export interface ResultMetric {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

interface ResultDisplayProps {
  badgeText?: string;
  primaryLabel: string;
  primaryValue: string | number;
  primaryUnit?: string;
  secondaryNote?: string;
  metrics?: ResultMetric[];
  statusMessage?: {
    text: string;
    variant?: 'safe' | 'warning' | 'danger' | 'info';
  };
  progressPercent?: number;
  progressLabel?: string;
}

export function ResultDisplay({
  badgeText = 'SUMMARY ANALYSIS',
  primaryLabel,
  primaryValue,
  primaryUnit = 'บาท',
  secondaryNote,
  metrics,
  statusMessage,
  progressPercent,
  progressLabel,
}: ResultDisplayProps) {
  return (
    <output
      className="relative flex flex-col justify-between overflow-hidden rounded-[1.25rem] bg-[#1A221F] p-6 text-[#FBFAF7] shadow-[0_16px_40px_rgba(26,34,31,0.22)] border border-[#262D2A]"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Editorial Muted Gold Top Rule */}
      <div
        className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-[#A28143] via-[#E9DEC7]/60 to-transparent"
        aria-hidden="true"
      />

      <div>
        <div className="flex items-center justify-between text-xs font-display tracking-[0.2em] uppercase text-[#C8CCC6]/80 mb-2">
          <span>{badgeText}</span>
          <span className="text-[10px] tracking-widest text-[#A28143]">· ATELIER ·</span>
        </div>

        <div className="border-b border-white/10 pb-5">
          <p className="text-base font-medium leading-snug text-[#C8CCC6]">
            {primaryLabel}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 leading-none">
            <span className="font-numeric text-[clamp(2.4rem,5.5vw,3.75rem)] font-semibold tracking-[-0.03em] text-[#FBFAF7]">
              {primaryValue}
            </span>
            {primaryUnit && (
              <span className="text-lg font-normal text-[#C8CCC6]">
                {primaryUnit}
              </span>
            )}
          </div>
          {secondaryNote && (
            <p className="mt-3 text-sm font-normal leading-relaxed text-[#C8CCC6]/90">
              {secondaryNote}
            </p>
          )}

          {progressPercent !== undefined && (
            <div className="mt-4 pt-2">
              <div className="flex justify-between text-xs text-[#C8CCC6] mb-1.5 font-medium">
                <span>{progressLabel || 'ความคืบหน้าตามเป้าหมาย'}</span>
                <span className="font-numeric font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#A28143] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs font-medium border leading-relaxed ${
              statusMessage.variant === 'danger'
                ? 'bg-[#2A1D1C] border-[#5A2C28] text-[#F3C4BE]'
                : statusMessage.variant === 'warning'
                ? 'bg-[#28241A] border-[#5A4B29] text-[#E8D4A8]'
                : 'bg-[#1C2621] border-[#2E4A3B] text-[#CBE4D6]'
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      {metrics && metrics.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 pt-4 border-t border-white/10">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#262D2A]/80 border border-white/5">
              <dt className="text-[11px] font-medium leading-tight text-[#C8CCC6]/80 truncate">
                {m.label}
              </dt>
              <dd
                className={`font-numeric mt-1.5 text-base font-semibold ${
                  m.highlight ? 'text-[#E9DEC7]' : 'text-[#FBFAF7]'
                }`}
              >
                {m.value}{' '}
                {m.unit && <span className="text-xs font-normal text-[#C8CCC6]/80">{m.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </output>
  );
}
