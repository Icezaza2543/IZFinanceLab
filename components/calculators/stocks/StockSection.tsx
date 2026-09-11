'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateDividend,
  calculateValuationRatios,
  calculateStockTrade,
  calculateFairValue,
} from '@/lib/calculations/stocks';

interface StockSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function StockSection({ onOpenGlossary }: StockSectionProps) {
  // 1. Dividend Calculator State
  const [portfolio, setPortfolio] = useState('2,000,000');
  const [dividendYield, setDividendYield] = useState('5');
  const [taxRate, setTaxRate] = useState('10');

  const dividendResult = calculateDividend({
    portfolioValue: parseNumber(portfolio),
    dividendYieldPercent: parseNumber(dividendYield),
    taxRatePercent: parseNumber(taxRate),
  });

  // 2. Valuation Ratios State
  const [stockPrice, setStockPrice] = useState('45');
  const [eps, setEps] = useState('3.0');
  const [bvps, setBvps] = useState('25.0');
  const [growthRate, setGrowthRate] = useState('15');
  const [dps, setDps] = useState('2.0');

  const valuationResult = calculateValuationRatios({
    stockPrice: parseNumber(stockPrice),
    eps: parseNumber(eps),
    bookValuePerShare: parseNumber(bvps),
    earningsGrowthRatePercent: parseNumber(growthRate),
    dividendPerShare: parseNumber(dps),
  });

  // 3. Stock Trade PnL State
  const [buyPrice, setBuyPrice] = useState('12.50');
  const [sellPrice, setSellPrice] = useState('14.20');
  const [shares, setShares] = useState('10,000');
  const [commissionRate, setCommissionRate] = useState('0.157');

  const tradeResult = calculateStockTrade({
    buyPrice: parseNumber(buyPrice),
    sellPrice: parseNumber(sellPrice),
    shares: parseNumber(shares),
    commissionRatePercent: parseNumber(commissionRate),
    includeVat: true,
  });

  // 4. Fair Value State
  const [currentD0, setCurrentD0] = useState('2.50');
  const [expectedGrowthG, setExpectedGrowthG] = useState('4');
  const [requiredReturnK, setRequiredReturnK] = useState('8');
  const [forwardEps, setForwardEps] = useState('3.20');
  const [targetPe, setTargetPe] = useState('18');

  const fairValueResult = calculateFairValue({
    currentDividend: parseNumber(currentD0),
    expectedDividendGrowthPercent: parseNumber(expectedGrowthG),
    requiredReturnPercent: parseNumber(requiredReturnK),
    forwardEps: parseNumber(forwardEps),
    targetPeRatio: parseNumber(targetPe),
  });

  return (
    <div className="space-y-8">
      {/* 1. Dividend Calculator */}
      <CalculatorCard
        id="calc-dividend-yield"
        title="เครื่องคิดเงินปันผลสุทธิหลังหักภาษี (Dividend Income Planner)"
        subtitle="คำนวณรายรับปันผลสุทธิต่อเดือนและต่อปีหลังหักภาษี ณ ที่จ่าย"
        badge="DIVIDEND INCOME"
        onReset={() => {
          setPortfolio('2,000,000');
          setDividendYield('5');
          setTaxRate('10');
        }}
        onOpenHelp={() => onOpenGlossary?.('dividend-yield')}
        resultNode={
          <ResultDisplay
            badgeText="DIVIDEND ANALYSIS"
            primaryLabel="เงินปันผลสุทธิต่อเดือน"
            primaryValue={formatMoney(dividendResult.netMonthly)}
            primaryUnit="บาท"
            secondaryNote={`หรือ ${formatMoney(dividendResult.netAnnual)} บาทต่อปี (ปันผลสุทธิ ${dividendResult.netYieldPercent}%)`}
            metrics={[
              { label: 'ก่อนหักภาษี/ปี', value: formatMoney(dividendResult.grossAnnual), unit: 'บาท' },
              { label: 'ภาษีหัก ณ ที่จ่าย (10%)', value: formatMoney(dividendResult.taxAnnual), unit: 'บาท' },
              { label: 'ปันผลสุทธิเฉลี่ย/วัน', value: formatMoney(dividendResult.netDaily), unit: 'บาท', highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="เงินปันผลสุทธิหลังหักภาษี"
            formula="ปันผลสุทธิ/ปี = พอร์ตลงทุน × (Yield / 100) × (1 - Tax / 100) | ปันผลต่อเดือน = ปันผลสุทธิ ÷ 12"
            explanation="ในประเทศไทย เงินปันผลจากหุ้นจะถูกหักภาษี ณ ที่จ่าย 10% เสมอ ผู้ลงทุนสามารถเลือกที่จะไม่นำไปยื่นภาษีปลายปี (Final Tax) หรือนำไปยื่นเพื่อขอเครดิตภาษีเงินปันผลคืนได้หากฐานภาษีต่ำกว่าอัตราภาษีนิติบุคคลของบริษัท"
            tips="สามารถคลิกลิงก์ด้านล่างเพื่อตรวจสอบสิทธิการเครดิตภาษีเงินปันผลตามมาตรา 47 ทวิ ของประมวลรัษฎากร"
            relatedTermId="dividend-yield"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">มูลค่าพอร์ตลงทุน</label>
          <div className="relative">
            <Input
              value={portfolio}
              onChange={(e) => setPortfolio(formatNumberInput(e.target.value))}
              className="font-numeric text-xl h-12 pr-16"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">บาท</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">อัตราปันผลต่อปี (Yield %)</label>
            <div className="relative">
              <Input
                value={dividendYield}
                onChange={(e) => setDividendYield(formatDecimalInput(e.target.value))}
                className="font-numeric text-xl h-12 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">ภาษีที่หัก ณ ที่จ่าย (%)</label>
            <div className="relative">
              <Input
                value={taxRate}
                onChange={(e) => setTaxRate(formatDecimalInput(e.target.value))}
                className="font-numeric text-xl h-12 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[#68655D] font-medium self-center font-ui">พอร์ตตัวอย่าง:</span>
          {['500,000', '1,000,000', '2,000,000', '5,000,000', '10,000,000'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setPortfolio(val)}
              className="px-2.5 py-1 rounded-lg border border-[#D5D0C5] bg-[#FBFAF7] hover:bg-[#EEEAE1] font-numeric text-xs text-[#181A18] transition-colors"
            >
              {val}
            </button>
          ))}
        </div>
      </CalculatorCard>

      {/* 2. Valuation Ratios Calculator */}
      <CalculatorCard
        id="calc-valuation-ratios"
        title="เครื่องคำนวณอัตราส่วนการประเมินมูลค่า (P/E, P/BV, PEG, ROE)"
        subtitle="วัดระดับความถูก-แพงของหุ้นเทียบกับกำไร ทรัพย์สิน และการเติบโต"
        badge="VALUATION METRICS"
        onReset={() => {
          setStockPrice('45');
          setEps('3.0');
          setBvps('25.0');
          setGrowthRate('15');
          setDps('2.0');
        }}
        onOpenHelp={() => onOpenGlossary?.('pe-ratio')}
        resultNode={
          <ResultDisplay
            badgeText="VALUATION RATIOS"
            primaryLabel="P/E Ratio (ราคาต่อกำไร)"
            primaryValue={`${valuationResult.peRatio}`}
            primaryUnit="เท่า"
            secondaryNote={`PEG Ratio: ${valuationResult.pegRatio} เท่า | P/BV: ${valuationResult.pbvRatio} เท่า`}
            statusMessage={{
              text: valuationResult.valuationSummaryTh,
              variant: valuationResult.pegRatio > 0 && valuationResult.pegRatio <= 1.0 ? 'safe' : 'info',
            }}
            metrics={[
              { label: 'P/BV Ratio', value: `${valuationResult.pbvRatio}x` },
              { label: 'PEG Ratio', value: `${valuationResult.pegRatio}x`, highlight: true },
              { label: 'ROE โดยประมาณ', value: `${valuationResult.roeEstimatePercent}%` },
              { label: 'Dividend Yield', value: `${valuationResult.dividendYieldPercent}%` },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="P/E, P/BV และ PEG"
            formula="P/E = Price ÷ EPS | P/BV = Price ÷ BVPS | PEG = P/E ÷ Earnings Growth (%)"
            explanation="P/E บอกว่ากี่ปีคืนทุน ส่วน PEG ปรับด้วยอัตราการเติบโต หาก PEG ต่ำกว่า 1 เท่า ถือว่าหุ้นตัวนั้นราคาไม่แพงเมื่อเทียบกับความสามารถในการเติบโตของกำไร"
            tips="ควรนำค่า P/E ไปเปรียบเทียบกับค่าเฉลี่ยในอดีต 5 ปีของตัวหุ้นเอง และเปรียบเทียบกับคู่แข่งในกลุ่มอุตสาหกรรมเดียวกัน"
            relatedTermId="pe-ratio"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">ราคาหุ้นปัจจุบัน (Price)</label>
            <div className="relative">
              <Input
                value={stockPrice}
                onChange={(e) => setStockPrice(formatDecimalInput(e.target.value))}
                className="font-numeric text-xl h-12 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#181A18] font-ui">กำไรต่อหุ้น (EPS)</label>
            <div className="relative">
              <Input
                value={eps}
                onChange={(e) => setEps(formatDecimalInput(e.target.value))}
                className="font-numeric text-xl h-12 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#68655D] font-medium font-ui">บาท</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#68655D] font-ui">มูลค่าทางบัญชี (BVPS)</label>
            <Input value={bvps} onChange={(e) => setBvps(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#68655D] font-ui">คาดการณ์กำไรโต (%/ปี)</label>
            <Input value={growthRate} onChange={(e) => setGrowthRate(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#68655D] font-ui">ปันผลต่อหุ้น (DPS)</label>
            <Input value={dps} onChange={(e) => setDps(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
        </div>
      </CalculatorCard>

      {/* 3. Stock Trade PnL & Break-even Calculator */}
      <CalculatorCard
        id="calc-stock-pnl"
        title="เครื่องคำนวณจุดคุ้มทุนและกำไร-ขาดทุนหุ้น (Stock Trade PnL)"
        subtitle="คำนวณต้นทุนรวมและจุดคุ้มทุนหลังหักค่าคอมมิชชันและภาษี VAT 7% ทั้ง 2 ขา"
        badge="TRADE EXECUTION"
        onReset={() => {
          setBuyPrice('12.50');
          setSellPrice('14.20');
          setShares('10,000');
          setCommissionRate('0.157');
        }}
        onOpenHelp={() => onOpenGlossary?.('stock-breakeven-pnl')}
        resultNode={
          <ResultDisplay
            badgeText="NET PROCEEDS"
            primaryLabel="กำไร / ขาดทุน สุทธิ"
            primaryValue={formatMoney(tradeResult.netProfitAmount)}
            primaryUnit="บาท"
            secondaryNote={`อัตราผลตอบแทนสุทธิ ${tradeResult.netProfitPercent}% | จุดคุ้มทุนต้องขายที่ ${tradeResult.breakEvenSellPrice} บาท`}
            statusMessage={{
              text: tradeResult.netProfitAmount >= 0 ? 'รายการนี้ได้กำไรสุทธิหลังหักค่าคอมมิชชัน' : 'รายการนี้ขาดทุนสุทธิ',
              variant: tradeResult.netProfitAmount >= 0 ? 'safe' : 'danger',
            }}
            metrics={[
              { label: 'ราคาขายเท่าทุน (Break-even)', value: tradeResult.breakEvenSellPrice, unit: 'บาท', highlight: true },
              { label: 'ต้นทุนรวมขาซื้อ', value: formatMoney(tradeResult.totalCost), unit: 'บาท' },
              { label: 'ค่าคอม + VAT รวม 2 ขา', value: formatMoney(tradeResult.totalFeesPaid), unit: 'บาท' },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="จุดคุ้มทุนซื้อขายหุ้น"
            formula="Break-even Price = ต้นทุนรวมขาซื้อ ÷ [จำนวนหุ้น × (1 - CommissionRate × 1.07)]"
            explanation="การเทรดหุ้นในไทยมีค่าคอมมิชชั่นทั้งขาซื้อและขาขาย และมีภาษีมูลค่าเพิ่ม (VAT 7%) บนค่าคอมมิชชันนั้น ทำให้ราคาขายต้องสูงกว่าราคาซื้อเล็กน้อยจึงจะเท่าทุนพอดี"
            tips="บัญชี Cash Balance ผ่านอินเทอร์เน็ตมักมีค่าคอมประมาณ 0.157% หากเป็นบัญชี Cash Account หรือผ่านมาร์เก็ตติ้งค่าคอมจะอยู่ที่ประมาณ 0.20%–0.25%"
            relatedTermId="stock-breakeven-pnl"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ราคาซื้อต่อหุ้น</label>
            <Input value={buyPrice} onChange={(e) => setBuyPrice(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ราคาขายต่อหุ้น</label>
            <Input value={sellPrice} onChange={(e) => setSellPrice(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">จำนวนหุ้น</label>
            <Input value={shares} onChange={(e) => setShares(formatNumberInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">อัตราค่าคอมมิชชันโบรกเกอร์ (%)</label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={commissionRate}
              onChange={(e) => setCommissionRate(formatDecimalInput(e.target.value, 3))}
              className="font-numeric text-base h-11 max-w-[140px]"
            />
            <button
              type="button"
              onClick={() => setCommissionRate('0.157')}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-[#D5D0C5] bg-[#FBFAF7] hover:bg-[#EEEAE1] text-[#181A18] font-ui transition-colors"
            >
              Cash Balance (0.157%)
            </button>
            <button
              type="button"
              onClick={() => setCommissionRate('0.200')}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-[#D5D0C5] bg-[#FBFAF7] hover:bg-[#EEEAE1] text-[#181A18] font-ui transition-colors"
            >
              Cash (0.20%)
            </button>
          </div>
        </div>
      </CalculatorCard>

      {/* 4. Fair Value Calculator */}
      <CalculatorCard
        id="calc-fair-value"
        title="เครื่องประเมินราคาเหมาะสมของหุ้น (Fair Value - DDM & Target P/E)"
        subtitle="คำนวณราคาที่ควรจะเป็นตามทฤษฎีคิดลดปันผลและค่า P/E เป้าหมาย"
        badge="VALUATION MODEL"
        onReset={() => {
          setCurrentD0('2.50');
          setExpectedGrowthG('4');
          setRequiredReturnK('8');
          setForwardEps('3.20');
          setTargetPe('18');
        }}
        onOpenHelp={() => onOpenGlossary?.('gordon-growth-model')}
        resultNode={
          <ResultDisplay
            badgeText="INTRINSIC VALUE"
            primaryLabel="ราคาเหมาะสมเฉลี่ย (Fair Value)"
            primaryValue={fairValueResult.averageFairValue}
            primaryUnit="บาท"
            secondaryNote={`ราคาเผื่อส่วนเผื่อความปลอดภัย 20% (Margin of Safety): ${fairValueResult.marginOfSafety20Percent} บาท`}
            statusMessage={{
              text: fairValueResult.notesTh,
              variant: fairValueResult.isDdmValid ? 'safe' : 'warning',
            }}
            metrics={[
              { label: 'มูลค่าตาม DDM', value: fairValueResult.ddmFairValue, unit: 'บาท' },
              { label: 'มูลค่าตาม Target P/E', value: fairValueResult.peFairValue, unit: 'บาท' },
              { label: 'MOS 20% ซื้อปลอดภัย', value: fairValueResult.marginOfSafety20Percent, unit: 'บาท', highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Gordon Growth Model (DDM)"
            formula="Fair Value = [D0 × (1 + g)] ÷ (k - g) | Target P/E Fair Value = Forward EPS × Target P/E"
            explanation="แบบจำลอง Gordon Growth เหมาะสมอย่างยิ่งสำหรับหุ้นเชิงรับ (Defensive Stocks) หรือหุ้นโครงสร้างพื้นฐานที่มีกระแสเงินสดและเงินปันผลเติบโตสม่ำเสมอ"
            tips="Benjamin Graham แนะนำให้นักลงทุนเผื่อ Margin of Safety อย่างน้อย 15%–25% จากราคาเหมาะสมเสมอ เพื่อป้องกันข้อผิดพลาดจากการคาดการณ์"
            relatedTermId="gordon-growth-model"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ปันผลต่อหุ้นปัจจุบัน (D0)</label>
            <Input value={currentD0} onChange={(e) => setCurrentD0(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ปันผลโตเฉลี่ย (%/ปี: g)</label>
            <Input value={expectedGrowthG} onChange={(e) => setExpectedGrowthG(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">ผลตอบแทนที่ต้องการ (%: k)</label>
            <Input value={requiredReturnK} onChange={(e) => setRequiredReturnK(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">กำไรต่อหุ้นคาดการณ์ปีหน้า (Forward EPS)</label>
            <Input value={forwardEps} onChange={(e) => setForwardEps(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[#181A18] font-ui">P/E เป้าหมายที่เหมาะสม (เท่า)</label>
            <Input value={targetPe} onChange={(e) => setTargetPe(formatDecimalInput(e.target.value))} className="font-numeric text-base h-11" />
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
