'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay, type ResultMetric } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { SegmentedToggle } from '@/components/shared/SegmentedToggle';
import { Input } from '@/components/ui/input';
import { CHART_COLORS, TimeSeriesChart } from '@/components/shared/TimeSeriesChart';
import {
  formatDecimalInput,
  formatDuration,
  formatMoney,
  formatNumberInput,
  formatPercent,
  parseNumber,
} from '@/lib/formatters';
import {
  calculateDcaFund,
  DCA_MAX_MONTHS,
  type DcaDurationUnit,
  type DcaFrequency,
  type DcaTiming,
} from '@/lib/calculations/mutual-funds';

const DEFAULTS = {
  initial: '0',
  amount: '5,000',
  frequency: 'monthly' as DcaFrequency,
  returnPct: '8.0',
  duration: '10',
  durationUnit: 'years' as DcaDurationUnit,
  timing: 'end' as DcaTiming,
  stepUp: '0',
  inflation: '0',
};

const DURATION_PRESETS = [5, 10, 20, 30];

interface DcaCalculatorProps {
  onOpenGlossary?: (termId: string) => void;
}

export function DcaCalculator({ onOpenGlossary }: DcaCalculatorProps) {
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [frequency, setFrequency] = useState<DcaFrequency>(DEFAULTS.frequency);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [durationUnit, setDurationUnit] = useState<DcaDurationUnit>(DEFAULTS.durationUnit);
  const [timing, setTiming] = useState<DcaTiming>(DEFAULTS.timing);
  const [stepUp, setStepUp] = useState(DEFAULTS.stepUp);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const result = calculateDcaFund({
    initialLumpSum: parseNumber(initial),
    contributionAmount: parseNumber(amount),
    contributionFrequency: frequency,
    expectedAnnualReturnPercent: parseNumber(returnPct),
    duration: parseNumber(duration),
    durationUnit,
    contributionTiming: timing,
    annualStepUpPercent: parseNumber(stepUp),
    inflationPercent: parseNumber(inflation),
  });

  const requestedMonths = parseNumber(duration) * (durationUnit === 'years' ? 12 : 1);
  const isClamped = requestedMonths > DCA_MAX_MONTHS;

  const handleDurationUnitChange = (next: DcaDurationUnit) => {
    if (next === durationUnit) return;
    const current = parseNumber(duration);
    if (next === 'months') {
      setDuration(formatNumberInput(String(Math.round(current * 12))));
    } else {
      setDuration(formatDecimalInput(String(Number((current / 12).toFixed(2)))));
    }
    setDurationUnit(next);
  };

  const handleReset = () => {
    setInitial(DEFAULTS.initial);
    setAmount(DEFAULTS.amount);
    setFrequency(DEFAULTS.frequency);
    setReturnPct(DEFAULTS.returnPct);
    setDuration(DEFAULTS.duration);
    setDurationUnit(DEFAULTS.durationUnit);
    setTiming(DEFAULTS.timing);
    setStepUp(DEFAULTS.stepUp);
    setInflation(DEFAULTS.inflation);
  };

  const signed = (n: number) => (n >= 0 ? '+' : '');

  const metrics: ResultMetric[] = [
    { label: 'เงินต้นสะสม', value: formatMoney(result.totalInvestedCapital), unit: 'บาท' },
    { label: 'กำไรสะสม', value: `${signed(result.totalProfit)}${formatMoney(result.totalProfit)}`, unit: 'บาท', highlight: true },
    {
      label: 'ผลตอบแทนรวม',
      value: `${signed(result.profitPercentage)}${formatPercent(result.profitPercentage)}%`,
      unit: `(${formatPercent(result.valueMultiple)} เท่า)`,
    },
  ];
  if (parseNumber(inflation) > 0) {
    metrics.push({ label: 'มูลค่าเทียบเงินวันนี้', value: formatMoney(result.realPortfolioValue), unit: 'บาท' });
  }
  if (parseNumber(stepUp) > 0) {
    metrics.push({ label: 'เงินลงทุนงวดสุดท้าย', value: formatMoney(result.lastContribution), unit: 'บาท' });
  }

  return (
    <CalculatorCard
      id="calc-dca-simulator"
      title="เครื่องจำลองการลงทุนแบบ DCA (Dollar-Cost Averaging)"
      subtitle="จำลองการลงทุนสม่ำเสมอรายเดือนหรือรายปี พร้อมกราฟการเติบโตของพอร์ตและตารางรายงวด"
      badge="วินัยการลงทุน"
      onReset={handleReset}
      onOpenHelp={() => onOpenGlossary?.('dca')}
      resultNode={
        <ResultDisplay
          badgeText="ผลลัพธ์การออม DCA"
          primaryLabel={`มูลค่าพอร์ตเมื่อครบ ${formatDuration(result.totalMonths)}`}
          primaryValue={formatMoney(result.portfolioValue)}
          primaryUnit="บาท"
          secondaryNote={`ลงทุนทั้งหมด ${formatMoney(result.contributionCount)} งวด ${
            frequency === 'monthly' ? 'ทุกเดือน' : 'ทุกปี'
          } (${timing === 'start' ? 'ต้นงวด' : 'ปลายงวด'}) · ผลตอบแทน ${formatPercent(parseNumber(returnPct))}%/ปี ทบต้นรายเดือน`}
          metrics={metrics}
        />
      }
      chartNode={
        <TimeSeriesChart
          title="การเติบโตของพอร์ตตามช่วงเวลา"
          axis="months"
          data={result.monthlyData.map((p) => ({ x: p.month, value: p.value, capital: p.capital }))}
          series={[
            { key: 'value', label: 'มูลค่าพอร์ต', color: CHART_COLORS[1] },
            { key: 'capital', label: 'เงินต้นสะสม', color: CHART_COLORS[0] },
          ]}
          derived={[{ label: 'กำไรสะสม', value: (p) => p.value - p.capital, signed: true }]}
          note="ส่วนต่างระหว่างสองเส้น = กำไรสะสม"
        />
      }
      formulaNode={
        <FormulaAccordion
          formulaTitle="Dollar-Cost Averaging (DCA)"
          formula="FV = P × (1 + i)ⁿ + PMT × [ ((1 + i)ⁿ − 1) / i ] × (1 + i)ᵏ   โดย i = r / 12, n = จำนวนเดือน, k = 1 หากลงทุนต้นงวด (0 หากปลายงวด)"
          explanation="เครื่องคิดเลขนี้จำลองพอร์ตทีละเดือน: ทบผลตอบแทนรายเดือน (r/12) และเติมเงินตามรอบที่เลือก หากตั้งค่าเพิ่มเงินลงทุนทุกปี เงินต่องวดจะเพิ่มขึ้นทุก 12 เดือน ส่วนมูลค่าเทียบเงินวันนี้คือมูลค่าพอร์ตที่หักผลของเงินเฟ้อแล้ว"
          tips="DCA มีประสิทธิภาพสูงสุดกับกองทุนดัชนีที่มีการกระจายความเสี่ยงสูง เช่น กองทุนหุ้นทั่วโลก หรือ S&P 500 และการเพิ่มเงินลงทุนตามรายได้ที่โตขึ้นทุกปีช่วยเร่งพอร์ตได้มาก"
          relatedTermId="dca"
          onOpenGlossary={onOpenGlossary}
        />
      }
    >
      {/* เงินก้อนแรกเริ่ม */}
      <div>
        <label htmlFor="dca-initial" className="block text-sm font-bold mb-1">
          เงินก้อนแรกเริ่ม (ถ้ามี)
        </label>
        <div className="relative">
          <Input
            id="dca-initial"
            inputMode="numeric"
            value={initial}
            onChange={(e) => setInitial(formatNumberInput(e.target.value))}
            className="font-numbers text-xl h-11 pr-12"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
        </div>
      </div>

      {/* เงินลงทุนต่องวด */}
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label htmlFor="dca-amount" className="block text-sm font-bold">
            เงินลงทุนต่องวด
          </label>
          <SegmentedToggle
            ariaLabel="ความถี่ในการลงทุน"
            value={frequency}
            onChange={setFrequency}
            options={[
              { value: 'monthly', label: 'ทุกเดือน' },
              { value: 'yearly', label: 'ทุกปี' },
            ]}
          />
        </div>
        <div className="relative">
          <Input
            id="dca-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(formatNumberInput(e.target.value))}
            className="font-numbers text-xl h-11 pr-20"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">
            {frequency === 'monthly' ? 'บาท/เดือน' : 'บาท/ปี'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ผลตอบแทน */}
        <div>
          <label htmlFor="dca-return" className="block text-sm font-bold mb-1 sm:min-h-[1.75rem] sm:leading-[1.75rem]">
            ผลตอบแทนคาดหวัง (%/ปี)
          </label>
          <div className="relative">
            <Input
              id="dca-return"
              inputMode="decimal"
              value={returnPct}
              onChange={(e) => setReturnPct(formatDecimalInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
          </div>
        </div>

        {/* ระยะเวลา */}
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 sm:min-h-[1.75rem]">
            <label htmlFor="dca-duration" className="block text-sm font-bold">
              ระยะเวลาลงทุน
            </label>
            <SegmentedToggle
              ariaLabel="หน่วยของระยะเวลา"
              value={durationUnit}
              onChange={handleDurationUnitChange}
              options={[
                { value: 'years', label: 'ปี' },
                { value: 'months', label: 'เดือน' },
              ]}
            />
          </div>
          <div className="relative">
            <Input
              id="dca-duration"
              inputMode={durationUnit === 'years' ? 'decimal' : 'numeric'}
              value={duration}
              onChange={(e) =>
                setDuration(
                  durationUnit === 'years'
                    ? formatDecimalInput(e.target.value)
                    : formatNumberInput(e.target.value),
                )
              }
              className="font-numbers text-xl h-11 pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">
              {durationUnit === 'years' ? 'ปี' : 'เดือน'}
            </span>
          </div>
        </div>
      </div>

      <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {DURATION_PRESETS.map((y) => {
            const active = durationUnit === 'years' && parseNumber(duration) === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setDurationUnit('years');
                  setDuration(String(y));
                }}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-[#A28143] bg-[#A28143]/10 text-[#7A5F2C]'
                    : 'border-[#D5D0C5] text-[#68655D] hover:bg-[#EEEAE1]'
                }`}
              >
                {y} ปี
              </button>
            );
          })}
        </div>
        <p className={`text-xs ${isClamped ? 'text-[#9A3B2E] font-semibold' : 'text-[#68655D]'}`}>
          {isClamped
            ? `สูงสุด 60 ปี (${formatMoney(DCA_MAX_MONTHS)} เดือน)`
            : `= ${formatDuration(result.totalMonths)} (${formatMoney(result.totalMonths)} เดือน)`}
        </p>
      </div>

      {/* ตัวเลือกเพิ่มเติม */}
      <div className="rounded-xl border border-[#D5D0C5] bg-[#EEEAE1]/30">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          aria-controls="dca-advanced"
          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-semibold text-[#181A18] hover:bg-[#EEEAE1]/60 rounded-xl transition-colors"
        >
          <span>ตัวเลือกเพิ่มเติม</span>
          <ChevronDown className={`h-4 w-4 text-[#68655D] transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div id="dca-advanced" className="space-y-4 border-t border-[#D5D0C5]/70 px-3.5 pb-4 pt-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold">จังหวะการลงทุนในแต่ละงวด</p>
                <p className="text-xs text-[#68655D]">ต้นงวด = เงินได้ทบผลตอบแทนตั้งแต่งวดแรก</p>
              </div>
              <SegmentedToggle
                ariaLabel="จังหวะการลงทุน"
                size="md"
                value={timing}
                onChange={setTiming}
                options={[
                  { value: 'start', label: 'ต้นงวด' },
                  { value: 'end', label: 'ปลายงวด' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dca-stepup" className="block text-sm font-bold mb-1">
                  เพิ่มเงินลงทุนทุกปี (%)
                </label>
                <div className="relative">
                  <Input
                    id="dca-stepup"
                    inputMode="decimal"
                    value={stepUp}
                    onChange={(e) => setStepUp(formatDecimalInput(e.target.value))}
                    className="font-numbers text-lg h-10 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
                </div>
                <p className="mt-1 text-xs text-[#68655D]">เช่น เพิ่มตามเงินเดือนที่ขึ้น 3–5% ต่อปี</p>
              </div>

              <div>
                <label htmlFor="dca-inflation" className="block text-sm font-bold mb-1">
                  เงินเฟ้อ (%/ปี)
                </label>
                <div className="relative">
                  <Input
                    id="dca-inflation"
                    inputMode="decimal"
                    value={inflation}
                    onChange={(e) => setInflation(formatDecimalInput(e.target.value))}
                    className="font-numbers text-lg h-10 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
                </div>
                <p className="mt-1 text-xs text-[#68655D]">ใช้คำนวณมูลค่าพอร์ตเทียบกำลังซื้อวันนี้</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}
