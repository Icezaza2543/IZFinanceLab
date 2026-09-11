'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateBondYield,
  calculateBondCoupon,
  calculateCleanDirtyPrice,
} from '@/lib/calculations/fixed-income';

interface FixedIncomeSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function FixedIncomeSection({ onOpenGlossary }: FixedIncomeSectionProps) {
  // 1. Bond Yield State
  const [parValue, setParValue] = useState('1,000');
  const [marketPrice, setMarketPrice] = useState('960');
  const [couponRate, setCouponRate] = useState('4.5');
  const [yearsToMaturity, setYearsToMaturity] = useState('5');

  const yieldResult = calculateBondYield({
    faceValue: parseNumber(parValue),
    marketPrice: parseNumber(marketPrice),
    annualCouponRatePercent: parseNumber(couponRate),
    yearsToMaturity: parseNumber(yearsToMaturity),
    couponFrequencyPerYear: 2,
  });

  // 2. Bond Coupon Schedule State
  const [bondInvestment, setBondInvestment] = useState('500,000');
  const [scheduleCouponRate, setScheduleCouponRate] = useState('4.8');
  const [frequency, setFrequency] = useState<'annually' | 'semi-annually' | 'quarterly'>('semi-annually');

  const couponResult = calculateBondCoupon({
    totalInvestmentValue: parseNumber(bondInvestment),
    annualCouponRatePercent: parseNumber(scheduleCouponRate),
    paymentFrequency: frequency,
    withholdingTaxPercent: 15,
  });

  // 3. Clean vs Dirty Price State
  const [cleanPrice, setCleanPrice] = useState('1,020');
  const [cleanPar, setCleanPar] = useState('1,000');
  const [cleanCouponRate, setCleanCouponRate] = useState('5.0');
  const [daysElapsed, setDaysElapsed] = useState('85');

  const cleanDirtyResult = calculateCleanDirtyPrice({
    cleanPrice: parseNumber(cleanPrice),
    faceValue: parseNumber(cleanPar),
    annualCouponRatePercent: parseNumber(cleanCouponRate),
    daysSinceLastCoupon: parseNumber(daysElapsed),
    daysInCouponPeriod: 180,
  });

  return (
    <div className="space-y-8">
      {/* 1. Bond Yield Calculator */}
      <CalculatorCard
        id="calc-bond-yield"
        title="เครื่องคำนวณผลตอบแทนตราสารหนี้ (Current Yield & YTM)"
        subtitle="คำนวณผลตอบแทนกระแสเงินสดและผลตอบแทนจนครบกำหนดอายุ (Yield to Maturity)"
        badge="ผลตอบแทนหุ้นกู้"
        onReset={() => {
          setParValue('1,000');
          setMarketPrice('960');
          setCouponRate('4.5');
          setYearsToMaturity('5');
        }}
        onOpenHelp={() => onOpenGlossary?.('ytm')}
        resultNode={
          <ResultDisplay
            badgeText="Yield to Maturity (ประมาณการ)"
            primaryLabel="ผลตอบแทนรวมจนครบกำหนด (YTM)"
            primaryValue={`${yieldResult.approxYtmPercent}%`}
            primaryUnit="ต่อปี"
            secondaryNote={`Current Yield ปัจจุบัน ${yieldResult.currentYieldPercent}% ต่อปี | กำไรส่วนต่างพาร์ ${formatMoney(yieldResult.capitalGainLossAtMaturity)} บาท`}
            metrics={[
              { label: 'Current Yield (ด/บ/ราคา)', value: `${yieldResult.currentYieldPercent}%`, unit: '/ปี' },
              { label: 'ดอกเบี้ยคูปองรับ/ปี', value: formatMoney(yieldResult.annualCouponAmount), unit: 'บาท' },
              { label: 'YTM ตลอดอายุ', value: `${yieldResult.approxYtmPercent}%`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Yield to Maturity (YTM)"
            formula="YTM ≈ [ C + (F - P) / n ] ÷ [ (F + P) / 2 ]"
            explanation="หากซื้อตราสารหนี้ต่ำกว่าราคาพาร์ (Discount) YTM จะสูงกว่าดอกเบี้ยหน้าตั๋วเสมอ เพราะนักลงทุนจะได้รับทั้งดอกเบี้ยตามสัญญาและกำไรส่วนต่างราคาเมื่อถือจนครบกำหนด"
            tips="สำหรับนักลงทุนที่ตั้งใจถือหุ้นกู้จนครบกำหนดอายุ YTM คืออัตราผลตอบแทนที่แท้จริงที่ควรใช้ในการเปรียบเทียบระหว่างรุ่นหุ้นกู้"
            relatedTermId="ytm"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ราคาพาร์ (Par Value)</label>
            <div className="relative">
              <Input value={parValue} onChange={(e) => setParValue(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ราคาซื้อขายในตลาด (Market Price)</label>
            <div className="relative">
              <Input value={marketPrice} onChange={(e) => setMarketPrice(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ดอกเบี้ยหน้าตั๋ว (%/ปี: Coupon Rate)</label>
            <div className="relative">
              <Input value={couponRate} onChange={(e) => setCouponRate(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11 pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">อายุคงเหลือจนครบกำหนด (ปี)</label>
            <div className="relative">
              <Input value={yearsToMaturity} onChange={(e) => setYearsToMaturity(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11 pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">ปี</span>
            </div>
          </div>
        </div>
      </CalculatorCard>

      {/* 2. Bond Coupon Schedule & Tax Calculator */}
      <CalculatorCard
        id="calc-bond-coupon"
        title="ตารางรับดอกเบี้ยคูปองสุทธิ (Coupon Schedule & 15% Tax)"
        subtitle="คำนวณเงินสดรับงวดต่อปีหลังหักภาษี ณ ที่จ่าย 15% สำหรับบุคคลธรรมดา"
        badge="กระแสเงินสดตราสารหนี้"
        onReset={() => {
          setBondInvestment('500,000');
          setScheduleCouponRate('4.8');
          setFrequency('semi-annually');
        }}
        onOpenHelp={() => onOpenGlossary?.('bond-withholding-tax')}
        resultNode={
          <ResultDisplay
            badgeText="ดอกเบี้ยรับสุทธิหลังหักภาษี 15%"
            primaryLabel="เงินดอกเบี้ยสุทธิที่ได้รับต่องวด"
            primaryValue={formatMoney(couponResult.paymentPerPeriodNet)}
            primaryUnit="บาท/งวด"
            secondaryNote={`รับปีละ ${couponResult.numberOfPaymentsPerYear} งวด รวมทั้งปีรับสุทธิ ${formatMoney(couponResult.netAnnualInterest)} บาท (Yield สุทธิ ${couponResult.effectiveNetYieldPercent}%)`}
            metrics={[
              { label: 'ดอกเบี้ยรวมก่อนหักภาษี/ปี', value: formatMoney(couponResult.grossAnnualInterest), unit: 'บาท' },
              { label: 'ภาษีหัก ณ ที่จ่าย 15%/ปี', value: formatMoney(couponResult.taxAnnual), unit: 'บาท' },
              { label: 'ผลตอบแทนสุทธิแท้จริง', value: `${couponResult.effectiveNetYieldPercent}%`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="ภาษีดอกเบี้ยตราสารหนี้ 15%"
            formula="ดอกเบี้ยสุทธิ = ดอกเบี้ยรับตามสัญญา × (1 - 0.15) | งวดจ่าย = ดอกเบี้ยสุทธิต่อปี ÷ จำนวนงวด"
            explanation="ดอกเบี้ยหุ้นกู้และพันธบัตรรัฐบาลสำหรับบุคคลธรรมดาจะถูกหักภาษี ณ ที่จ่าย 15% เสมอ โดยกฎหมายอนุญาตให้เลือกเป็น Final Tax ได้ ไม่ต้องนำไปรวมคำนวณภาษีปลายปี"
            tips="หากฐานภาษีเงินได้ของคุณต่ำกว่า 15% (เช่น อยู่ในฐาน 0%–10%) การนำดอกเบี้ยไปยื่นภาษีปลายปีจะสามารถขอคืนภาษีส่วนต่างได้"
            relatedTermId="bond-withholding-tax"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ยอดเงินลงทุนในหุ้นกู้/พันธบัตร</label>
            <div className="relative">
              <Input
                value={bondInvestment}
                onChange={(e) => setBondInvestment(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">อัตราดอกเบี้ยหน้าตั๋ว (%/ปี)</label>
            <div className="relative">
              <Input
                value={scheduleCouponRate}
                onChange={(e) => setScheduleCouponRate(formatDecimalInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5">ความถี่ในการจ่ายดอกเบี้ย</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'annually', label: 'ปีละ 1 ครั้ง (รายปี)' },
              { id: 'semi-annually', label: 'ปีละ 2 ครั้ง (ทุก 6 เดือน)' },
              { id: 'quarterly', label: 'ปีละ 4 ครั้ง (ทุก 3 เดือน)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFrequency(item.id as typeof frequency)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                  frequency === item.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CalculatorCard>

      {/* 3. Clean Price vs Dirty Price Calculator */}
      <CalculatorCard
        id="calc-clean-dirty-price"
        title="เครื่องคำนวณราคาซื้อขายตราสารหนี้ (Clean Price vs Dirty Price)"
        subtitle="คำนวณดอกเบี้ยค้างรับ (Accrued Interest) ตามจำนวนวันที่ถือครองจริง"
        badge="การซื้อขายในตลาดรอง"
        onReset={() => {
          setCleanPrice('1,020');
          setCleanPar('1,000');
          setCleanCouponRate('5.0');
          setDaysElapsed('85');
        }}
        onOpenHelp={() => onOpenGlossary?.('clean-dirty-price')}
        resultNode={
          <ResultDisplay
            badgeText="ราคาชำระจริงในตลาด (Dirty Price)"
            primaryLabel="ราคาซื้อขายจริงต่อหน่วย (Dirty Price)"
            primaryValue={cleanDirtyResult.dirtyPrice}
            primaryUnit="บาท"
            secondaryNote={`รวมดอกเบี้ยค้างรับ ${cleanDirtyResult.accruedInterest} บาท (ผ่านไปแล้ว ${daysElapsed} วัน)`}
            metrics={[
              { label: 'Clean Price เสนอซื้อ', value: cleanPrice, unit: 'บาท' },
              { label: 'ดอกเบี้ยค้างรับ (AI)', value: cleanDirtyResult.accruedInterest, unit: 'บาท', highlight: true },
              { label: 'ดอกเบี้ยสะสมเทียบพาร์', value: `${cleanDirtyResult.accruedInterestPercentOfPar}%` },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Clean Price vs Dirty Price"
            formula="Dirty Price = Clean Price + Accrued Interest (AI = Par × Coupon% × วันที่ผ่านไป / 365)"
            explanation="เมื่อซื้อขายหุ้นกู้ระหว่างงวด ผู้ซื้อจะต้องจ่ายเงินชดเชยดอกเบี้ยสะสมตั้งแต่วันจ่ายงวดล่าสุดจนถึงวันส่งมอบให้แก่ผู้ขายคนเดิม (เรียกว่า Accrued Interest) และผู้ซื้อจะได้รับดอกเบี้ยเต็มนวดในวันจ่ายคูปองถัดไป"
            tips="ราคาที่แสดงในกระดานเสนอราคาของสมาคมตลาดตราสารหนี้ไทย (ThaiBMA) มักเป็น Clean Price แต่เมื่อทำการชำระเงินจริงจะต้องจ่ายตาม Dirty Price"
            relatedTermId="clean-dirty-price"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ราคา Clean Price เสนอซื้อต่อหน่วย</label>
            <Input value={cleanPrice} onChange={(e) => setCleanPrice(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">ราคาพาร์ (Par Value)</label>
            <Input value={cleanPar} onChange={(e) => setCleanPar(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">อัตราดอกเบี้ยหน้าตั๋ว (%/ปี)</label>
            <Input value={cleanCouponRate} onChange={(e) => setCleanCouponRate(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">จำนวนวันนับจากงวดดอกเบี้ยล่าสุด (วัน)</label>
            <Input value={daysElapsed} onChange={(e) => setDaysElapsed(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
