'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateDcaFund,
  calculateExpenseRatioImpact,
  calculateTaxFund,
} from '@/lib/calculations/mutual-funds';

interface MutualFundsSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function MutualFundsSection({ onOpenGlossary }: MutualFundsSectionProps) {
  // 1. DCA Fund State
  const [dcaMonthly, setDcaMonthly] = useState('5,000');
  const [dcaReturn, setDcaReturn] = useState('8.0');
  const [dcaYears, setDcaYears] = useState('10');
  const [dcaInitial, setDcaInitial] = useState('0');

  const dcaResult = calculateDcaFund({
    monthlyInvestment: parseNumber(dcaMonthly),
    expectedAnnualReturnPercent: parseNumber(dcaReturn),
    investmentYears: parseNumber(dcaYears),
    initialLumpSum: parseNumber(dcaInitial),
  });

  // 2. Expense Ratio State
  const [feePrincipal, setFeePrincipal] = useState('100,000');
  const [feeMonthly, setFeeMonthly] = useState('5,000');
  const [feeGrossReturn, setFeeGrossReturn] = useState('8.0');
  const [lowFee, setLowFee] = useState('0.40');
  const [highFee, setHighFee] = useState('1.80');
  const [feeYears, setFeeYears] = useState('20');

  const expenseResult = calculateExpenseRatioImpact({
    initialInvestment: parseNumber(feePrincipal),
    monthlyAddition: parseNumber(feeMonthly),
    grossAnnualReturnPercent: parseNumber(feeGrossReturn),
    lowFeePercent: parseNumber(lowFee),
    highFeePercent: parseNumber(highFee),
    years: parseNumber(feeYears),
  });

  // 3. Tax Deductible Funds State
  const [annualIncome, setAnnualIncome] = useState('1,200,000');
  const [taxBracket, setTaxBracket] = useState('20');
  const [thaiEsgBuy, setThaiEsgBuy] = useState('300,000');
  const [rmfBuy, setRmfBuy] = useState('100,000');

  const taxFundResult = calculateTaxFund({
    annualIncome: parseNumber(annualIncome),
    taxBracketPercent: parseNumber(taxBracket),
    thaiEsgAmount: parseNumber(thaiEsgBuy),
    rmfAmount: parseNumber(rmfBuy),
  });

  return (
    <div className="space-y-8">
      {/* 1. DCA Fund Simulator */}
      <CalculatorCard
        id="calc-dca-simulator"
        title="เครื่องจำลองการลงทุนแบบ DCA (Dollar-Cost Averaging)"
        subtitle="จำลองการออมรายเดือนในกองทุนรวม พร้อมดูการเติบโตและสัดส่วนกำไรสะสม"
        badge="วินัยการลงทุน"
        onReset={() => {
          setDcaMonthly('5,000');
          setDcaReturn('8.0');
          setDcaYears('10');
          setDcaInitial('0');
        }}
        onOpenHelp={() => onOpenGlossary?.('dca')}
        resultNode={
          <ResultDisplay
            badgeText="ผลลัพธ์การออม DCA"
            primaryLabel="มูลค่าพอร์ตปลายทาง"
            primaryValue={formatMoney(dcaResult.portfolioValue)}
            primaryUnit="บาท"
            secondaryNote={`เงินต้นรวม ${formatMoney(dcaResult.totalInvestedCapital)} บาท | กำไรสุทธิ ${formatMoney(dcaResult.totalProfit)} บาท (+${dcaResult.profitPercentage}%)`}
            metrics={[
              { label: 'เงินต้นสะสม', value: formatMoney(dcaResult.totalInvestedCapital), unit: 'บาท' },
              { label: 'กำไรสะสม', value: formatMoney(dcaResult.totalProfit), unit: 'บาท', highlight: true },
              { label: 'สัดส่วนกำไร', value: `+${dcaResult.profitPercentage}%` },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Dollar-Cost Averaging (DCA)"
            formula="FV_dca = PMT × [ ((1 + r/12)^(12×t) - 1) / (r/12) ]"
            explanation="การลงทุนถัวเฉลี่ยรายเดือนช่วยลดความเสี่ยงจากการจับจังหวะตลาดผิดเวลา ทำให้ได้หน่วยลงทุนมากขึ้นในจังหวะที่ตลาดปรับฐาน และสะสมความมั่งคั่งอย่างต่อเนื่อง"
            tips="DCA มีประสิทธิภาพสูงสุดกับกองทุนดัชนีที่มีการกระจายความเสี่ยงสูง เช่น กองทุนหุ้นทั่วโลก หรือ S&P 500"
            relatedTermId="dca"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ลงทุนสม่ำเสมอต่อเดือน</label>
            <div className="relative">
              <Input
                value={dcaMonthly}
                onChange={(e) => setDcaMonthly(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ผลตอบแทนคาดหวังเฉลี่ย (%/ปี)</label>
            <div className="relative">
              <Input
                value={dcaReturn}
                onChange={(e) => setDcaReturn(formatDecimalInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ระยะเวลาลงทุน (ปี)</label>
            <div className="relative">
              <Input
                value={dcaYears}
                onChange={(e) => setDcaYears(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">ปี</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">เงินก้อนแรกเริ่ม (ถ้ามี)</label>
            <div className="relative">
              <Input
                value={dcaInitial}
                onChange={(e) => setDcaInitial(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>
      </CalculatorCard>

      {/* 2. Fund Expense Ratio Impact Calculator */}
      <CalculatorCard
        id="calc-expense-ratio"
        title="เครื่องคำนวณผลกระทบค่าธรรมเนียมกองทุน (Expense Ratio Impact)"
        subtitle="เปรียบเทียบความมั่งคั่งระยะยาวระหว่างกองทุนค่าธรรมเนียมต่ำ vs สูง"
        badge="ต้นทุนแฝงกองทุน"
        onReset={() => {
          setFeePrincipal('100,000');
          setFeeMonthly('5,000');
          setFeeGrossReturn('8.0');
          setLowFee('0.40');
          setHighFee('1.80');
          setFeeYears('20');
        }}
        onOpenHelp={() => onOpenGlossary?.('expense-ratio')}
        resultNode={
          <ResultDisplay
            badgeText="ส่วนต่างค่าธรรมเนียมที่สูญเสีย"
            primaryLabel="เงินที่หายไปกับค่าธรรมเนียมสูง"
            primaryValue={formatMoney(expenseResult.wealthLostToFees)}
            primaryUnit="บาท"
            secondaryNote={`คิดเป็น ${expenseResult.wealthLostPercentage}% ของพอร์ตที่ควรจะมีในอีก ${feeYears} ปี`}
            metrics={[
              { label: `กองทุนค่าธรรมเนียมต่ำ (${lowFee}%)`, value: formatMoney(expenseResult.lowFeeFinalValue), unit: 'บาท' },
              { label: `กองทุนค่าธรรมเนียมสูง (${highFee}%)`, value: formatMoney(expenseResult.highFeeFinalValue), unit: 'บาท' },
              { label: 'ความต่างของมูลค่า', value: `-${expenseResult.wealthLostPercentage}%`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Total Expense Ratio (TER)"
            formula="Net Return = Gross Return - Total Expense Ratio (TER)"
            explanation="ค่าธรรมเนียมกองทุนถูกหักออกจากมูลค่าทรัพย์สินสุทธิ (NAV) ในทุกๆ วันทำการ เมื่อคิดรวมเป็นเวลานาน 20–30 ปี ส่วนต่างเพียง 1.0%–1.4% จะทวีคูณเป็นเงินหลักล้านบาท"
            tips="สำหรับกองทุนดัชนี (Passive Index Fund) ควรมองหากองทุนที่มี TER ต่ำกว่า 0.5% เสมอ"
            relatedTermId="expense-ratio"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ผลตอบแทนกองทุนก่อนหักค่าธรรมเนียม (%/ปี)</label>
            <Input value={feeGrossReturn} onChange={(e) => setFeeGrossReturn(formatDecimalInput(e.target.value))} className="font-numbers text-lg h-11" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">ระยะเวลาถือครอง (ปี)</label>
            <Input value={feeYears} onChange={(e) => setFeeYears(formatNumberInput(e.target.value))} className="font-numbers text-lg h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">กองทุนแรก (เช่น กองดัชนี: ค่าธรรมเนียม %)</label>
            <Input value={lowFee} onChange={(e) => setLowFee(formatDecimalInput(e.target.value))} className="font-numbers text-lg h-11" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">กองทุนสอง (เช่น กอง Active: ค่าธรรมเนียม %)</label>
            <Input value={highFee} onChange={(e) => setHighFee(formatDecimalInput(e.target.value))} className="font-numbers text-lg h-11" />
          </div>
        </div>
      </CalculatorCard>

      {/* 3. Tax Saving Funds Calculator */}
      <CalculatorCard
        id="calc-tax-funds"
        title="เครื่องคำนวณกองทุนลดหย่อนภาษี (Thai ESG / RMF / SSF)"
        subtitle="ตรวจสอบเพดานการซื้อสูงสุดตามรายได้ และเงินภาษีที่ประหยัดได้ทันที"
        badge="วางแผนภาษี"
        onReset={() => {
          setAnnualIncome('1,200,000');
          setTaxBracket('20');
          setThaiEsgBuy('300,000');
          setRmfBuy('100,000');
        }}
        onOpenHelp={() => onOpenGlossary?.('tax-saving-funds')}
        resultNode={
          <ResultDisplay
            badgeText="ภาษีที่ประหยัดได้"
            primaryLabel="เงินคืนภาษีที่จะประหยัดได้"
            primaryValue={formatMoney(taxFundResult.estimatedTaxSaved)}
            primaryUnit="บาท"
            secondaryNote={`จากยอดซื้อกองทุนรวม ${formatMoney(taxFundResult.totalDeduction)} บาท (ฐานภาษี ${taxBracket}%)`}
            metrics={[
              { label: 'สิทธิ์ Thai ESG สูงสุด', value: formatMoney(taxFundResult.maxThaiEsgLimit), unit: 'บาท' },
              { label: 'สิทธิ์ RMF สูงสุด', value: formatMoney(taxFundResult.maxRmfLimit), unit: 'บาท' },
              { label: 'ผลตอบแทนทางภาษีทันที', value: `${taxBracket}%`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="สิทธิลดหย่อนภาษีกองทุน"
            formula="ภาษีที่ประหยัดได้ = ยอดซื้อกองทุนที่ใช้สิทธิ์ได้ × ฐานภาษีสูงสุด (%)"
            explanation="Thai ESG (เกณฑ์ใหม่ปี 2567-2569) ซื้อได้สูงสุด 30% ของรายได้ ไม่เกิน 300,000 บาท ถือครอง 5 ปีวันชนวัน ส่วน RMF ซื้อได้สูงสุด 30% ไม่เกิน 500,000 บาท (เมื่อรวมกับกองทุนเพื่อการเกษียณอื่นๆ) ถือจนอายุ 55 ปี"
            tips="การลงทุนในกองทุนลดหย่อนภาษีเปรียบเสมือนการได้ผลตอบแทนการันตีทันทีเท่ากับฐานภาษีของคุณตั้งแต่ปีแรกที่ซื้อ"
            relatedTermId="tax-saving-funds"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">รายได้พึงประเมินทั้งปี (บาท)</label>
            <div className="relative">
              <Input
                value={annualIncome}
                onChange={(e) => setAnnualIncome(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ฐานภาษีเงินได้บุคคลธรรมดาสูงสุด</label>
            <select
              value={taxBracket}
              onChange={(e) => setTaxBracket(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-card px-3 font-bold text-sm"
            >
              <option value="5">5% (สุทธิ 150,001 - 300,000)</option>
              <option value="10">10% (สุทธิ 300,001 - 500,000)</option>
              <option value="15">15% (สุทธิ 500,001 - 750,000)</option>
              <option value="20">20% (สุทธิ 750,001 - 1,000,000)</option>
              <option value="25">25% (สุทธิ 1,000,001 - 2,000,000)</option>
              <option value="30">30% (สุทธิ 2,000,001 - 5,000,000)</option>
              <option value="35">35% (สุทธิ 5,000,000 ขึ้นไป)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ยอดซื้อกองทุน Thai ESG (ถือ 5 ปี)</label>
            <div className="relative">
              <Input
                value={thaiEsgBuy}
                onChange={(e) => setThaiEsgBuy(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ยอดซื้อกองทุน RMF (เพื่อเกษียณ)</label>
            <div className="relative">
              <Input
                value={rmfBuy}
                onChange={(e) => setRmfBuy(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
