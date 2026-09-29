'use client';

import React, { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { SegmentedToggle } from '@/components/shared/SegmentedToggle';
import { formatCompactMoney, formatDuration, formatMoney } from '@/lib/formatters';

// ลำดับสีคงที่ ผ่าน dataviz validator (lightness, chroma, CVD, contrast) บนพื้น #FBFAF7
export const CHART_COLORS = ['#2F6FA0', '#B5802A'] as const;

/**
 * หน่วยของแกน X
 * - months: x = เดือนที่ (0 = เริ่มต้น) มีปุ่มสลับรายปี/รายเดือน
 * - years:  x = ปีที่
 * - days:   x = วันที่
 * - age:    x = อายุ (ปี)
 */
export type TimeAxisMode = 'months' | 'years' | 'days' | 'age';

export type TimeSeriesPoint = { x: number } & Record<string, number>;

export interface TimeSeries {
  key: string;
  label: string;
  color: string;
}

export interface DerivedColumn {
  label: string;
  value: (point: TimeSeriesPoint) => number;
  signed?: boolean;
}

interface TimeSeriesChartProps {
  title: string;
  data: TimeSeriesPoint[];
  series: TimeSeries[];
  axis: TimeAxisMode;
  note?: string;
  derived?: DerivedColumn[];
  referenceX?: { x: number; label: string };
  formatValue?: (value: number) => string;
  unit?: string;
}

type Granularity = 'yearly' | 'monthly';
type ViewMode = 'chart' | 'table';

function niceStep(span: number, candidates: number[]): number {
  return candidates.find((s) => span / s <= 12) ?? candidates[candidates.length - 1];
}

function buildTicks(min: number, max: number, axis: TimeAxisMode, granularity: Granularity): number[] {
  const span = max - min;
  let step: number;
  if (axis === 'months') {
    step = niceStep(span, granularity === 'yearly' ? [12, 24, 60, 120] : [1, 2, 3, 6, 12, 24, 60, 120]);
  } else {
    step = niceStep(span, [1, 2, 5, 10, 20, 50, 100]);
  }
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  if (start !== min) ticks.push(min);
  for (let v = start; v <= max; v += step) ticks.push(v);
  return ticks;
}

function axisCaption(axis: TimeAxisMode, granularity: Granularity): string {
  if (axis === 'months') return granularity === 'yearly' ? 'ปีที่' : 'เดือนที่';
  if (axis === 'years') return 'ปีที่';
  if (axis === 'days') return 'วันที่';
  return 'อายุ (ปี)';
}

function tooltipLabel(x: number, axis: TimeAxisMode): string {
  if (axis === 'months') return x === 0 ? 'เริ่มต้น' : `เดือนที่ ${formatMoney(x)} · ${formatDuration(x)}`;
  if (axis === 'years') return x === 0 ? 'ปัจจุบัน' : `ปีที่ ${x}`;
  if (axis === 'days') return x === 0 ? 'วันนี้' : `วันที่ ${x}`;
  return `อายุ ${x} ปี`;
}

function tableLabel(x: number, axis: TimeAxisMode, granularity: Granularity): string {
  if (axis === 'months') {
    if (x === 0) return 'เริ่มต้น';
    if (granularity === 'monthly') return String(x);
    return x % 12 === 0 ? String(x / 12) : formatDuration(x);
  }
  if (axis === 'age') return String(x);
  return x === 0 ? (axis === 'days' ? 'วันนี้' : 'ปัจจุบัน') : String(x);
}

const withSign = (n: number, signed?: boolean) => (signed && n > 0 ? '+' : '');

export function TimeSeriesChart({
  title,
  data,
  series,
  axis,
  note,
  derived = [],
  referenceX,
  formatValue = formatMoney,
  unit = '฿',
}: TimeSeriesChartProps) {
  const [chosenGranularity, setGranularity] = useState<Granularity | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const chartId = React.useId().replace(/:/g, '');

  const lastX = data.length > 0 ? data[data.length - 1].x : 0;
  const firstX = data.length > 0 ? data[0].x : 0;
  // ช่วงสั้นไม่เกิน 3 ปี แสดงรายเดือนเป็นค่าเริ่มต้น จนกว่าผู้ใช้จะเลือกเอง
  const granularity: Granularity = chosenGranularity ?? (lastX - firstX <= 36 ? 'monthly' : 'yearly');
  const shown =
    axis === 'months' && granularity === 'yearly'
      ? data.filter((p) => p.x % 12 === 0 || p.x === lastX)
      : data;
  const ticks = buildTicks(firstX, lastX, axis, granularity);

  const chartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  return (
    <section className="rounded-[1.25rem] border border-[#D5D0C5] bg-[#FBFAF7] p-4 sm:p-6" aria-label={title}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#181A18]">{title}</h3>
          {(series.length > 1 || note) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#68655D]">
              {series.length > 1 &&
                series.map((s) => (
                  <span key={s.key} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              {note && <span className="text-[#68655D]/80">{note}</span>}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {axis === 'months' && (
            <SegmentedToggle
              ariaLabel="ความละเอียดของข้อมูล"
              value={granularity}
              onChange={setGranularity}
              options={[
                { value: 'yearly', label: 'รายปี' },
                { value: 'monthly', label: 'รายเดือน' },
              ]}
            />
          )}
          <SegmentedToggle
            ariaLabel="รูปแบบการแสดงผล"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'chart', label: 'กราฟ' },
              { value: 'table', label: 'ตาราง' },
            ]}
          />
        </div>
      </div>

      {viewMode === 'chart' ? (
        <>
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full sm:h-[340px]">
            <AreaChart data={shown} margin={{ top: referenceX ? 28 : 16, right: 12, left: 4, bottom: 0 }}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`${chartId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.04} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="#D5D0C5" strokeOpacity={0.6} strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[firstX, lastX]}
                ticks={ticks}
                tickFormatter={(x: number) =>
                  axis === 'months' && granularity === 'yearly' ? `${Math.round((x / 12) * 10) / 10}` : `${x}`
                }
                tickLine={false}
                axisLine={{ stroke: '#D5D0C5' }}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(v: number) => formatCompactMoney(v)}
                tickLine={false}
                axisLine={false}
                width={64}
                tickMargin={4}
              />
              {referenceX && (
                <ReferenceLine
                  x={referenceX.x}
                  stroke="#68655D"
                  strokeDasharray="4 4"
                  label={{ value: referenceX.label, position: 'top', fill: '#68655D', fontSize: 12 }}
                />
              )}
              <ChartTooltip
                cursor={{ stroke: '#68655D', strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as TimeSeriesPoint | undefined;
                  if (!active || !point) return null;
                  return (
                    <SeriesTooltip
                      label={tooltipLabel(point.x, axis)}
                      point={point}
                      series={series}
                      derived={derived}
                      formatValue={formatValue}
                      unit={unit}
                    />
                  );
                }}
              />
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#${chartId}-${s.key})`}
                  dot={false}
                  activeDot={{ r: 5, stroke: '#FBFAF7', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ChartContainer>
          <p className="mt-1 text-center text-xs text-[#68655D]">{axisCaption(axis, granularity)}</p>
        </>
      ) : (
        <div className="max-h-[360px] overflow-auto rounded-xl border border-[#D5D0C5]">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="sticky top-0 bg-[#EEEAE1] text-xs text-[#68655D]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">{axisCaption(axis, granularity)}</th>
                {series.map((s) => (
                  <th key={s.key} className="px-3 py-2 text-right font-semibold">
                    {s.label}
                  </th>
                ))}
                {derived.map((d) => (
                  <th key={d.label} className="px-3 py-2 text-right font-semibold">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-numbers">
              {shown.map((p) => (
                <tr key={p.x} className="border-t border-[#D5D0C5]/60 even:bg-[#EEEAE1]/30">
                  <td className="px-3 py-1.5 text-left font-ui text-[#68655D]">{tableLabel(p.x, axis, granularity)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="px-3 py-1.5 text-right">
                      {formatValue(p[s.key])}
                    </td>
                  ))}
                  {derived.map((d) => {
                    const v = d.value(p);
                    return (
                      <td key={d.label} className="px-3 py-1.5 text-right font-semibold">
                        {withSign(v, d.signed)}
                        {formatValue(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SeriesTooltip({
  label,
  point,
  series,
  derived,
  formatValue,
  unit,
}: {
  label: string;
  point: TimeSeriesPoint;
  series: TimeSeries[];
  derived: DerivedColumn[];
  formatValue: (value: number) => string;
  unit: string;
}) {
  return (
    <div className="min-w-[200px] rounded-xl border border-[#262D2A] bg-[#1A221F] px-3.5 py-3 text-[#FBFAF7] shadow-[0_12px_32px_rgba(26,34,31,0.25)]">
      <p className="mb-2 text-xs font-medium text-[#C8CCC6]">{label}</p>
      <div className="space-y-1.5">
        {series.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#C8CCC6]">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-numbers font-semibold">
              {formatValue(point[s.key])} {unit}
            </span>
          </div>
        ))}
        {derived.length > 0 && (
          <div className="space-y-1.5 border-t border-white/10 pt-1.5">
            {derived.map((d) => {
              const v = d.value(point);
              return (
                <div key={d.label} className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-[#C8CCC6]">{d.label}</span>
                  <span className="font-numbers font-semibold text-[#E9DEC7]">
                    {withSign(v, d.signed)}
                    {formatValue(v)} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
