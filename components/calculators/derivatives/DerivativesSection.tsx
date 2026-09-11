'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateTfexPnl,
  calculateTfexMargin,
  TFEX_PRESETS,
  type TfexInstrumentType,
} from '@/lib/calculations/derivatives';

interface DerivativesSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function DerivativesSection({ onOpenGlossary }: DerivativesSectionProps) {
  // 1. TFEX PnL State
  const [instrument, setInstrument] = useState<TfexInstrumentType>('SET50');
  const [position, setPosition] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState('920.0');
  const [exitPrice, setExitPrice] = useState('928.5');
  const [contracts, setContracts] = useState('2');
  const [commPerContract, setCommPerContract] = useState('80');

  const pnlResult = calculateTfexPnl({
    instrumentType: instrument,
    position,
    entryPrice: parseNumber(entryPrice),
    exitPrice: parseNumber(exitPrice),
    contracts: parseNumber(contracts),
    commissionPerContract: parseNumber(commPerContract),
  });

  // 2. TFEX Margin Call State
  const [equityBalance, setEquityBalance] = useState('30,000');
  const [marginContracts, setMarginContracts] = useState('2');
  const [marginEntryPrice, setMarginEntryPrice] = useState('920.0');

  const marginResult = calculateTfexMargin({
    equityBalance: parseNumber(equityBalance),
    contracts: parseNumber(marginContracts),
    initialMarginPerContract: TFEX_PRESETS[instrument].typicalIm,
    maintenanceMarginPerContract: TFEX_PRESETS[instrument].typicalMm,
    multiplier: TFEX_PRESETS[instrument].multiplier,
    position,
    entryPrice: parseNumber(marginEntryPrice),
  });

  return (
    <div className="space-y-8">
      {/* 1. TFEX Futures PnL Calculator */}
      <CalculatorCard
        id="calc-tfex-futures"
        title="เครื่องคำนวณกำไร-ขาดทุนสัญญาซื้อขายล่วงหน้า (TFEX Futures PnL)"
        subtitle="คำนวณผลตอบแทน Leverage และค่าคอมมิชชันต่อสัญญาของ SET50 และ Gold Futures"
        badge="FUTURES CONTRACTS"
        onReset={() => {
          setInstrument('SET50');
          setPosition('LONG');
          setEntryPrice('920.0');
          setExitPrice('928.5');
          setContracts('2');
          setCommPerContract('80');
        }}
        onOpenHelp={() => onOpenGlossary?.('tfex-tick-value')}
        resultNode={
          <ResultDisplay
            badgeText="FUTURES PERFORMANCE"
            primaryLabel="ผลตอบแทนสุทธิ (Net PnL)"
            primaryValue={formatMoney(pnlResult.netPnl)}
            primaryUnit="บาท"
            secondaryNote={`ส่วนต่างดัชนี ${pnlResult.pointDifference > 0 ? '+' : ''}${pnlResult.pointDifference} จุด | ผลตอบแทนเทียบเงินประกัน ${pnlResult.returnOnMarginPercent}%`}
            statusMessage={{
              text: pnlResult.isProfit ? 'สถานะนี้ทำกำไรสุทธิหลังหักค่าธรรมเนียม' : 'สถานะนี้ขาดทุนสุทธิ',
              variant: pnlResult.isProfit ? 'safe' : 'danger',
            }}
            metrics={[
              { label: 'กำไรก่อนหักค่าคอมฯ', value: formatMoney(pnlResult.grossPnl), unit: 'บาท' },
              { label: 'ค่าคอมฯ รวม 2 ขา + VAT', value: formatMoney(pnlResult.totalCommission), unit: 'บาท' },
              { label: 'Return on Margin (RoM)', value: `${pnlResult.returnOnMarginPercent}%`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="กำไร-ขาดทุนสัญญาฟิวเจอร์ส"
            formula="Net PnL = (ส่วนต่างราคา) × ตัวคูณดัชนี × จำนวนสัญญา - ค่าคอมมิชชันรวม"
            explanation="SET50 Futures มีตัวคูณดัชนี 200 บาทต่อจุด ส่วน Gold Online Futures มีตัวคูณ 300 บาทต่อ 1 USD การเคลื่อนไหวเพียงเล็กน้อยจะถูกทวีคูณด้วย Leverage สูง"
            tips="ควรวางเงินในพอร์ตมากกว่า Initial Margin ขั้นต่ำเสมออย่างน้อย 2–3 เท่า เพื่อป้องกันความผันผวนระหว่างวัน"
            relatedTermId="tfex-tick-value"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">เลือกประเภทสัญญาอนุพันธ์</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['SET50', 'GOLD_ONLINE', 'GOLD_50'] as TfexInstrumentType[]).map((inst) => (
              <button
                key={inst}
                type="button"
                onClick={() => {
                  setInstrument(inst);
                  if (inst === 'GOLD_ONLINE') {
                    setEntryPrice('2650.0');
                    setExitPrice('2665.0');
                  } else if (inst === 'GOLD_50') {
                    setEntryPrice('43500');
                    setExitPrice('43800');
                  } else {
                    setEntryPrice('920.0');
                    setExitPrice('928.5');
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors font-ui ${
                  instrument === inst
                    ? 'bg-[#1A221F] text-[#FBFAF7] border-[#1A221F] shadow-sm'
                    : 'bg-[#FBFAF7] hover:bg-[#EEEAE1] text-[#68655D] border-[#D5D0C5]'
                }`}
              >
                {TFEX_PRESETS[inst].name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ทิศทางสถานะ (Position)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPosition('LONG')}
                className={`py-2 rounded-xl text-xs font-semibold border font-ui transition-colors ${
                  position === 'LONG'
                    ? 'bg-[#1E3A2F] text-[#E0F2E9] border-[#2E5E4A] shadow-sm'
                    : 'bg-[#FBFAF7] hover:bg-[#EEEAE1] text-[#68655D] border-[#D5D0C5]'
                }`}
              >
                Long (ขึ้น)
              </button>
              <button
                type="button"
                onClick={() => setPosition('SHORT')}
                className={`py-2 rounded-xl text-xs font-semibold border font-ui transition-colors ${
                  position === 'SHORT'
                    ? 'bg-[#3F1E1B] text-[#F9E0DE] border-[#652E2A] shadow-sm'
                    : 'bg-[#FBFAF7] hover:bg-[#EEEAE1] text-[#68655D] border-[#D5D0C5]'
                }`}
              >
                Short (ลง)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">จำนวนสัญญา</label>
            <Input value={contracts} onChange={(e) => setContracts(formatNumberInput(e.target.value))} className="font-numeric text-base h-10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ราคาเปิดสัญญา (Entry)</label>
            <Input value={entryPrice} onChange={(e) => setEntryPrice(formatDecimalInput(e.target.value))} className="font-numeric text-base h-10" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ราคาปิดสัญญา (Exit)</label>
            <Input value={exitPrice} onChange={(e) => setExitPrice(formatDecimalInput(e.target.value))} className="font-numeric text-base h-10" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ค่าคอมมิชชันต่อสัญญาต่อขา (บาท)</label>
          <Input value={commPerContract} onChange={(e) => setCommPerContract(formatNumberInput(e.target.value))} className="font-numeric text-base h-10 max-w-[160px]" />
        </div>
      </CalculatorCard>

      {/* 2. TFEX Margin & Risk Management Calculator */}
      <CalculatorCard
        id="calc-tfex-margin"
        title="เครื่องคำนวณหลักประกันและความเสี่ยง (Margin Call & Force Close Alert)"
        subtitle="ประเมินจุดตัดขาดทุน ระดับราคาที่จะโดนเรียกเงินประกัน หรือถูกบังคับปิดสัญญา"
        badge="RISK MANAGEMENT"
        onReset={() => {
          setEquityBalance('30,000');
          setMarginContracts('2');
          setMarginEntryPrice('920.0');
        }}
        onOpenHelp={() => onOpenGlossary?.('maintenance-margin')}
        resultNode={
          <ResultDisplay
            badgeText="MARGIN BUFFER"
            primaryLabel="ราคาที่จะโดน Margin Call"
            primaryValue={marginResult.marginCallPriceLevel}
            primaryUnit="จุด"
            secondaryNote={`ดัชนีวิ่งผิดทางได้อีก ${marginResult.marginCallPointsBuffer} จุด ก่อนโดนเรียกเติมเงิน`}
            statusMessage={{
              text: marginResult.statusTh,
              variant: marginResult.statusVariant,
            }}
            metrics={[
              { label: 'ระดับราคา Force Close', value: marginResult.forceClosePriceLevel, unit: 'จุด', highlight: true },
              { label: 'Initial Margin รวม (IM)', value: formatMoney(marginResult.totalImRequired), unit: 'บาท' },
              { label: 'Maintenance Margin (MM)', value: formatMoney(marginResult.totalMmRequired), unit: 'บาท' },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Initial, Maintenance และ Force Close Margin"
            formula="Margin Call เมื่อ Equity < MM (70% ของ IM) | Force Close เมื่อ Equity < FM (30% ของ IM)"
            explanation="เมื่อแตะระดับ Margin Call ผู้ลงทุนต้องนำเงินมาวางเพิ่มให้กลับขึ้นไปเท่ากับระดับ Initial Margin (IM) เต็มจำนวน หากไม่เติมเงินและราคาวิ่งไปถึง Force Close พอร์ตจะถูกบังคับปิดทันที"
            tips="การตั้ง Stop Loss เสมอทุกครั้งที่เปิดสถานะ จะช่วยจำกัดความเสียหายไม่ให้ลุกลามจนโดน Margin Call"
            relatedTermId="maintenance-margin"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">เงินสดคงเหลือในพอร์ต (Equity)</label>
            <div className="relative">
              <Input
                value={equityBalance}
                onChange={(e) => setEquityBalance(formatNumberInput(e.target.value))}
                className="font-numeric text-xl h-12 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">จำนวนสัญญาที่ถือครอง</label>
            <div className="relative">
              <Input
                value={marginContracts}
                onChange={(e) => setMarginContracts(formatNumberInput(e.target.value))}
                className="font-numeric text-xl h-12 pr-16"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">สัญญา</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">ราคาดัชนีตอนเปิดสถานะ ({position})</label>
          <div className="relative">
            <Input
              value={marginEntryPrice}
              onChange={(e) => setMarginEntryPrice(formatDecimalInput(e.target.value))}
              className="font-numeric text-xl h-12 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">จุด</span>
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
