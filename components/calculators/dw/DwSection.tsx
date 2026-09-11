'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateDw,
  calculateDwTimeDecay,
  type DwType,
} from '@/lib/calculations/dw';

interface DwSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function DwSection({ onOpenGlossary }: DwSectionProps) {
  // 1. DW Calculator State
  const [dwType, setDwType] = useState<DwType>('CALL');
  const [underlyingPrice, setUnderlyingPrice] = useState('52.50');
  const [exercisePrice, setExercisePrice] = useState('50.00');
  const [dwPrice, setDwPrice] = useState('0.48');
  const [conversionRatio, setConversionRatio] = useState('0.1'); // 1:10
  const [effectiveGearing, setEffectiveGearing] = useState('4.8');

  const dwResult = calculateDw({
    dwType,
    underlyingPrice: parseNumber(underlyingPrice),
    exercisePrice: parseNumber(exercisePrice),
    dwPrice: parseNumber(dwPrice),
    conversionRatio: parseNumber(conversionRatio),
    effectiveGearing: parseNumber(effectiveGearing),
    sensitivity: 1.0,
  });

  // 2. DW Time Decay State
  const [decayDwPrice, setDecayDwPrice] = useState('0.50');
  const [holdingQuantity, setHoldingQuantity] = useState('50,000');
  const [decayPercentPerDay, setDecayPercentPerDay] = useState('2.0');
  const [holdingDays, setHoldingDays] = useState('5');

  const decayResult = calculateDwTimeDecay({
    dwPrice: parseNumber(decayDwPrice),
    holdingQuantity: parseNumber(holdingQuantity),
    timeDecayPercentPerDay: parseNumber(decayPercentPerDay),
    holdingDays: parseNumber(holdingDays),
  });

  return (
    <div className="space-y-8">
      {/* 1. DW Moneyness & Gearing Calculator */}
      <CalculatorCard
        id="calc-dw-gearing"
        title="เครื่องคำนวณสถานะ DW (Moneyness, Gearing & Break-even)"
        subtitle="ประเมินมูลค่าแท้จริง อัตราทดแท้จริง และราคาหุ้นแม่ที่จุดคุ้มทุน"
        badge="DERIVATIVE WARRANTS"
        onReset={() => {
          setDwType('CALL');
          setUnderlyingPrice('52.50');
          setExercisePrice('50.00');
          setDwPrice('0.48');
          setConversionRatio('0.1');
          setEffectiveGearing('4.8');
        }}
        onOpenHelp={() => onOpenGlossary?.('dw-moneyness')}
        resultNode={
          <ResultDisplay
            badgeText={`DW STATUS · ${dwResult.moneynessStatus}`}
            primaryLabel="ราคาหุ้นแม่ ณ จุดคุ้มทุน (Break-even)"
            primaryValue={dwResult.breakEvenUnderlyingPrice}
            primaryUnit="บาท"
            secondaryNote={`หุ้นแม่ขยับ 1% ราคา DW จะขยับประมาณ ${dwResult.priceChange1PctUnderlying}%`}
            statusMessage={{
              text: dwResult.summaryTh,
              variant: dwResult.moneynessStatus === 'ITM' ? 'safe' : dwResult.moneynessStatus === 'ATM' ? 'warning' : 'danger',
            }}
            metrics={[
              { label: 'มูลค่าแท้จริง (Intrinsic)', value: dwResult.intrinsicValue, unit: 'บาท' },
              { label: 'มูลค่าทางเวลา (Time Value)', value: dwResult.timeValue, unit: 'บาท' },
              { label: 'Effective Gearing', value: `${effectiveGearing}x`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="DW Moneyness & Break-even"
            formula="Call Break-even = Exercise Price + (DW Price ÷ Conversion Ratio)"
            explanation="Moneyness แบ่งเป็น 3 สถานะ: ITM (มีมูลค่าแท้จริง), ATM (ราคาใกล้เคียงราคาใช้สิทธิ) และ OTM (ไม่มีมูลค่าแท้จริง มีแต่มูลค่าทางเวลา) DW ที่เป็น Deep OTM มีความเสี่ยงที่จะหมดอายุโดยไร้ค่าสูงที่สุด"
            tips="ตรวจเช็กตารางราคาของผู้ดูแลสภาพคล่อง (Market Maker) เสมอก่อนส่งคำสั่งซื้อขาย เพื่อให้ได้ราคาที่ตรงตามสูตรคำนวณ"
            relatedTermId="dw-moneyness"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ประเภท DW</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDwType('CALL')}
                className={`py-2 rounded-xl text-xs font-semibold border font-ui transition-colors ${
                  dwType === 'CALL'
                    ? 'bg-[#1E3A2F] text-[#E0F2E9] border-[#2E5E4A] shadow-sm'
                    : 'bg-[#FBFAF7] hover:bg-[#EEEAE1] text-[#68655D] border-[#D5D0C5]'
                }`}
              >
                Call DW (ขึ้น)
              </button>
              <button
                type="button"
                onClick={() => setDwType('PUT')}
                className={`py-2 rounded-xl text-xs font-semibold border font-ui transition-colors ${
                  dwType === 'PUT'
                    ? 'bg-[#3F1E1B] text-[#F9E0DE] border-[#652E2A] shadow-sm'
                    : 'bg-[#FBFAF7] hover:bg-[#EEEAE1] text-[#68655D] border-[#D5D0C5]'
                }`}
              >
                Put DW (ลง)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">อัตราทด (Effective Gearing)</label>
            <Input value={effectiveGearing} onChange={(e) => setEffectiveGearing(formatDecimalInput(e.target.value))} className="font-numeric text-base h-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">ราคาหุ้นแม่ปัจจุบัน (Underlying Price)</label>
            <div className="relative">
              <Input value={underlyingPrice} onChange={(e) => setUnderlyingPrice(formatDecimalInput(e.target.value))} className="font-numeric text-xl h-12 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">ราคาใช้สิทธิ (Exercise Price)</label>
            <div className="relative">
              <Input value={exercisePrice} onChange={(e) => setExercisePrice(formatDecimalInput(e.target.value))} className="font-numeric text-xl h-12 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">บาท</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">ราคา DW ปัจจุบัน</label>
            <div className="relative">
              <Input value={dwPrice} onChange={(e) => setDwPrice(formatDecimalInput(e.target.value, 3))} className="font-numeric text-xl h-12 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">อัตราการใช้สิทธิ (Conversion Ratio)</label>
            <Input value={conversionRatio} onChange={(e) => setConversionRatio(formatDecimalInput(e.target.value, 4))} className="font-numeric text-xl h-12" />
          </div>
        </div>
      </CalculatorCard>

      {/* 2. DW Time Decay Estimator */}
      <CalculatorCard
        id="calc-dw-time-decay"
        title="เครื่องคำนวณการลดลงของมูลค่าตามเวลา (Time Decay Estimator)"
        subtitle="ประเมินต้นทุนการถือครอง DW ข้ามวันและเงินที่จะลดลงตามระยะเวลา"
        badge="TIME DECAY ANALYSIS"
        onReset={() => {
          setDecayDwPrice('0.50');
          setHoldingQuantity('50,000');
          setDecayPercentPerDay('2.0');
          setHoldingDays('5');
        }}
        onOpenHelp={() => onOpenGlossary?.('time-decay')}
        resultNode={
          <ResultDisplay
            badgeText="THETA COST"
            primaryLabel="มูลค่าที่คาดว่าจะลดลง (Time Decay Loss)"
            primaryValue={formatMoney(decayResult.totalLossAmount)}
            primaryUnit="บาท"
            secondaryNote={`มูลค่าลดลง -${decayResult.totalLossPercent}% ในเวลา ${holdingDays} วัน (ตกเฉลี่ยวันละ ${formatMoney(decayResult.dailyCostAmount)} บาท)`}
            metrics={[
              { label: 'มูลค่าซื้อเริ่มต้น', value: formatMoney(decayResult.currentTotalValue), unit: 'บาท' },
              { label: `ราคา DW หลังผ่าน ${holdingDays} วัน`, value: decayResult.estimatedDwPriceAfterDays, unit: 'บาท', highlight: true },
              { label: 'ต้นทุนเวลาเฉลี่ย/วัน', value: formatMoney(decayResult.dailyCostAmount), unit: 'บาท' },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Time Decay (Theta)"
            formula="DW_Price(t) = DW_Price(0) × (1 - DecayRate)^t"
            explanation="DW มีวันหมดอายุที่แน่นอน มูลค่าทางเวลาจะลดลงทุกวันแม้ว่าราคาหุ้นแม่จะนิ่งอยู่กับที่ ยิ่งใกล้หมดอายุ การลดลงของมูลค่าเวลาจะยิ่งเร่งตัวขึ้นอย่างรวดเร็ว"
            tips="ไม่ควรวางแผนถือ DW ข้ามวันหยุดยาว (Long Weekend) หรือถือครองเกิน 1–2 สัปดาห์ เพราะต้นทุน Time Decay จะกัดกินผลกำไรไปอย่างมาก"
            relatedTermId="time-decay"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">ราคา DW ที่ซื้อ (บาท)</label>
            <Input value={decayDwPrice} onChange={(e) => setDecayDwPrice(formatDecimalInput(e.target.value, 3))} className="font-numeric text-xl h-12" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">จำนวนหน่วย DW ที่ถือครอง</label>
            <Input value={holdingQuantity} onChange={(e) => setHoldingQuantity(formatNumberInput(e.target.value))} className="font-numeric text-xl h-12" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">อัตรา Time Decay ต่อวัน (%/วัน)</label>
            <div className="relative">
              <Input value={decayPercentPerDay} onChange={(e) => setDecayPercentPerDay(formatDecimalInput(e.target.value))} className="font-numeric text-xl h-12 pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">จำนวนวันที่วางแผนจะถือครอง (วัน)</label>
            <div className="relative">
              <Input value={holdingDays} onChange={(e) => setHoldingDays(formatNumberInput(e.target.value))} className="font-numeric text-xl h-12 pr-10" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">วัน</span>
            </div>
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
