'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateFxImpact,
  calculateForeignTax,
  calculateUsStockFee,
} from '@/lib/calculations/foreign';

interface ForeignSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function ForeignSection({ onOpenGlossary }: ForeignSectionProps) {
  // 1. FX Impact State
  const [initialThb, setInitialThb] = useState('350,000');
  const [fxBuy, setFxBuy] = useState('35.00');
  const [fxSell, setFxSell] = useState('33.50');
  const [assetReturn, setAssetReturn] = useState('15.0');

  const fxResult = calculateFxImpact({
    initialInvestmentThb: parseNumber(initialThb),
    exchangeRateBuy: parseNumber(fxBuy),
    exchangeRateSell: parseNumber(fxSell),
    foreignAssetReturnPercent: parseNumber(assetReturn),
  });

  // 2. Foreign Tax State
  const [foreignProfit, setForeignProfit] = useState('500,000');
  const [thaiIncome, setThaiIncome] = useState('800,000');
  const [foreignTaxPaid, setForeignTaxPaid] = useState('0');

  const taxResult = calculateForeignTax({
    foreignProfitBroughtToThai: parseNumber(foreignProfit),
    otherThaiTaxableIncome: parseNumber(thaiIncome),
    foreignTaxPaidAlready: parseNumber(foreignTaxPaid),
  });

  // 3. US Stock Trade & W-8BEN State
  const [usInvestment, setUsInvestment] = useState('10,000');
  const [usDivYield, setUsDivYield] = useState('3.5');
  const [usCommission, setUsCommission] = useState('1.5');
  const [usWithholdingRate, setUsWithholdingRate] = useState('15');

  const usFeeResult = calculateUsStockFee({
    investmentUsd: parseNumber(usInvestment),
    annualDividendYieldPercent: parseNumber(usDivYield),
    tradeCommissionPerOrderUsd: parseNumber(usCommission),
    withholdingTaxRatePercent: parseNumber(usWithholdingRate),
  });

  return (
    <div className="space-y-8">
      {/* 1. Currency FX Impact Calculator */}
      <CalculatorCard
        id="calc-foreign-fx"
        title="เครื่องคำนวณผลกระทบจากอัตราแลกเปลี่ยน (Currency FX Impact)"
        subtitle="แยกผลตอบแทนจากตัวสินทรัพย์และกำไร/ขาดทุนจากอัตราแลกเปลี่ยนเงินบาท"
        badge="ความเสี่ยงค่าเงิน"
        onReset={() => {
          setInitialThb('350,000');
          setFxBuy('35.00');
          setFxSell('33.50');
          setAssetReturn('15.0');
        }}
        onOpenHelp={() => onOpenGlossary?.('fx-impact')}
        resultNode={
          <ResultDisplay
            badgeText="ผลตอบแทนสุทธิในสกุลเงินบาท"
            primaryLabel="กำไร / ขาดทุนสุทธิ (THB)"
            primaryValue={formatMoney(fxResult.netProfitThb)}
            primaryUnit="บาท"
            secondaryNote={`ผลตอบแทนรวมสุทธิ ${fxResult.totalReturnThbPercent}% (กำไรจากหุ้น +${assetReturn}% แต่ค่าเงิน ${fxResult.fxReturnPercent}%)`}
            statusMessage={{
              text: fxResult.netProfitThb >= 0 ? 'ผลตอบแทนรวมในรูปเงินบาทยังคงเป็นบวก' : 'ขาดทุนในรูปเงินบาทเนื่องจากผลกระทบของค่าเงิน',
              variant: fxResult.netProfitThb >= 0 ? 'safe' : 'danger',
            }}
            metrics={[
              { label: 'กำไรเฉพาะจากสินทรัพย์', value: formatMoney(fxResult.assetGainContributionThb), unit: 'บาท' },
              { label: 'ผลกระทบจากค่าเงิน (FX)', value: formatMoney(fxResult.fxGainContributionThb), unit: 'บาท', highlight: true },
              { label: 'เงินบาทปลายทางรับสุทธิ', value: formatMoney(fxResult.finalThbProceeds), unit: 'บาท' },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="ผลตอบแทนรวมสกุลเงินท้องถิ่น"
            formula="Total Return (THB) = (1 + Asset Return) × (1 + FX Return) - 1"
            explanation="เมื่อลงทุนในสินทรัพย์ต่างประเทศ หากสินทรัพย์นั้นขึ้น 15% แต่เงินบาทแข็งค่าขึ้นเทียบกับสกุลนั้น (เช่น USD อ่อนค่าลง -4.29%) ผลตอบแทนสุทธิในรูปเงินบาทจะลดลงเหลือเพียงประมาณ 10.07%"
            tips="หากกังวลเรื่องความผันผวนของค่าเงิน สามารถเลือกลงทุนในกองทุนรวมต่างประเทศที่มีนโยบาย Hedged ค่าเงิน (ป้องกันความเสี่ยงอัตราแลกเปลี่ยน) ได้"
            relatedTermId="fx-impact"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div>
          <label className="block text-sm font-bold mb-1">เงินลงทุนเริ่มต้น (บาท)</label>
          <div className="relative">
            <Input value={initialThb} onChange={(e) => setInitialThb(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">อัตราแลกเปลี่ยนตอนซื้อ (THB/USD)</label>
            <Input value={fxBuy} onChange={(e) => setFxBuy(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">อัตราแลกเปลี่ยนตอนขาย (THB/USD)</label>
            <Input value={fxSell} onChange={(e) => setFxSell(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">ผลตอบแทนของสินทรัพย์ในสกุลเดิม (% เช่น หุ้นขึ้น +15%)</label>
          <div className="relative">
            <Input value={assetReturn} onChange={(e) => setAssetReturn(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11 pr-8" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
          </div>
        </div>
      </CalculatorCard>

      {/* 2. Foreign Sourced Income Tax Calculator */}
      <CalculatorCard
        id="calc-foreign-tax"
        title="เครื่องคำนวณภาษีเงินได้จากการลงทุนต่างประเทศ (เกณฑ์สรรพากร ป.161)"
        subtitle="ประเมินภาระภาษีเงินได้บุคคลธรรมดาเมื่อนำกำไรจากการลงทุนต่างประเทศกลับเข้าไทย"
        badge="ภาษี ป.161/2566"
        onReset={() => {
          setForeignProfit('500,000');
          setThaiIncome('800,000');
          setForeignTaxPaid('0');
        }}
        onOpenHelp={() => onOpenGlossary?.('foreign-tax-rule')}
        resultNode={
          <ResultDisplay
            badgeText="ภาษีส่วนเพิ่มที่ต้องชำระ"
            primaryLabel="ภาษีเงินได้ที่ต้องจ่ายเพิ่ม"
            primaryValue={formatMoney(taxResult.finalNetTaxToPay)}
            primaryUnit="บาท"
            secondaryNote={`จากกำไรต่างประเทศ ${formatMoney(parseNumber(foreignProfit))} บาท (อัตราภาษีแท้จริง ${taxResult.effectiveTaxRateOnForeignProfitPercent}%)`}
            statusMessage={{
              text: `ฐานภาษีสูงสุดแตะขั้น ${taxResult.taxBracketPercent}% ของบัญชีอัตราภาษีบุคคลธรรมดา`,
              variant: taxResult.taxBracketPercent > 20 ? 'warning' : 'info',
            }}
            metrics={[
              { label: 'ภาษีฐานเดิม (เฉพาะในไทย)', value: formatMoney(taxResult.taxWithoutForeignIncome), unit: 'บาท' },
              { label: 'ภาษีรวมเมื่อบวกกำไรนอก', value: formatMoney(taxResult.taxWithForeignIncome), unit: 'บาท' },
              { label: 'เครดิตภาษีต่างประเทศที่ใช้ได้', value: formatMoney(taxResult.taxCreditAllowed), unit: 'บาท', highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="คำสั่งกรมสรรพากรที่ ป.161/2566 และ ป.162/2566"
            formula="ภาษีส่วนเพิ่ม = ภาษีรวม(เงินได้ไทย + กำไรต่างประเทศ) - ภาษีเดิม(เฉพาะเงินได้ไทย) - เครดิตภาษีซ้ำซ้อน"
            explanation="บุคคลธรรมดาที่อาศัยอยู่ในไทยรวม 180 วันขึ้นไปในปีภาษี หากมีกำไรจากการลงทุนต่างประเทศที่เกิดขึ้นตั้งแต่ 1 ม.ค. 2567 และนำเงินนั้นเข้ามาในไทยในปีใด จะต้องนำมารวมคำนวณภาษีของปีนั้นตามฐานภาษีเงินได้บุคคลธรรมดา (5%–35%)"
            tips="หากยังไม่ได้นำเงินกลับเข้าประเทศไทย (ถือครองต่อในบัญชีต่างประเทศ) จะยังไม่มีภาระภาษีในไทยเกิดขึ้น"
            relatedTermId="foreign-tax-rule"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div>
          <label className="block text-sm font-bold mb-1">กำไรจากการลงทุนต่างประเทศที่นำกลับไทยในปีภาษี (บาท)</label>
          <div className="relative">
            <Input value={foreignProfit} onChange={(e) => setForeignProfit(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">เงินได้พึงประเมินอื่นๆ ในไทยตลอดปี</label>
            <div className="relative">
              <Input value={thaiIncome} onChange={(e) => setThaiIncome(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ภาษีที่จ่ายในต่างประเทศไปแล้ว (ถ้ามี)</label>
            <div className="relative">
              <Input value={foreignTaxPaid} onChange={(e) => setForeignTaxPaid(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>
      </CalculatorCard>

      {/* 3. US Stock Trade & W-8BEN Calculator */}
      <CalculatorCard
        id="calc-foreign-us-fees"
        title="เครื่องคำนวณหุ้นสหรัฐฯ และภาษีปันผล (US Stock & W-8BEN Tax)"
        subtitle="คำนวณภาษีหัก ณ ที่จ่าย 15% ตามอนุสัญญาภาษีซ้อน และค่าธรรมเนียมเทรด"
        badge="หุ้นสหรัฐฯ"
        onReset={() => {
          setUsInvestment('10,000');
          setUsDivYield('3.5');
          setUsCommission('1.5');
          setUsWithholdingRate('15');
        }}
        onOpenHelp={() => onOpenGlossary?.('w8ben-withholding')}
        resultNode={
          <ResultDisplay
            badgeText="ปันผลสุทธิหลังหักภาษีสหรัฐฯ"
            primaryLabel="เงินปันผลสุทธิที่ได้รับต่อปี"
            primaryValue={`$${usFeeResult.netAnnualDividendUsd}`}
            primaryUnit="USD"
            secondaryNote={`ภาษีหัก ณ ที่จ่าย ${usWithholdingRate}% = $${usFeeResult.withholdingTaxUsd} USD (Yield สุทธิ ${usFeeResult.effectiveNetDividendYieldPercent}%)`}
            metrics={[
              { label: 'ปันผลรวมก่อนหักภาษี', value: `$${usFeeResult.grossAnnualDividendUsd}` },
              { label: 'ภาษีหัก ณ ที่จ่ายสหรัฐฯ', value: `$${usFeeResult.withholdingTaxUsd}` },
              { label: 'ค่าคอมฯ ไป-กลับ (Round-trip)', value: `$${usFeeResult.roundTripTradeCommissionUsd}`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="แบบฟอร์ม W-8BEN และภาษีปันผลสหรัฐฯ"
            formula="Net Dividend = Gross Dividend × (1 - WithholdingTaxRate)"
            explanation="บุคคลธรรมดาสัญชาติไทยที่ยื่นแบบฟอร์ม W-8BEN กับโบรกเกอร์ จะได้รับการลดหย่อนภาษีหัก ณ ที่จ่ายของเงินปันผลจากอัตราปกติ 30% เหลือเพียง 15% ตามอนุสัญญาภาษีซ้อนระหว่างไทยและสหรัฐฯ ส่วนกำไรจากส่วนต่างราคาหุ้น (Capital Gain) ในสหรัฐฯ จะไม่ถูกหักภาษี"
            tips="ส่วนใหญ่โบรกเกอร์ไทยและแพลตฟอร์มเทรดหุ้นต่างประเทศจะให้กรอกแบบฟอร์ม W-8BEN อิเล็กทรอนิกส์โดยอัตโนมัติขณะเปิดบัญชี"
            relatedTermId="w8ben-withholding"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">มูลค่าพอร์ตหุ้นสหรัฐฯ (USD)</label>
            <div className="relative">
              <Input value={usInvestment} onChange={(e) => setUsInvestment(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">USD</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">อัตราเงินปันผลต่อปี (Yield %)</label>
            <div className="relative">
              <Input value={usDivYield} onChange={(e) => setUsDivYield(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11 pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">อัตราภาษีหัก ณ ที่จ่ายปันผล</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUsWithholdingRate('15')}
                className={`py-2 rounded-xl text-xs font-bold border ${
                  usWithholdingRate === '15' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                }`}
              >
                ยื่น W-8BEN (15%)
              </button>
              <button
                type="button"
                onClick={() => setUsWithholdingRate('30')}
                className={`py-2 rounded-xl text-xs font-bold border ${
                  usWithholdingRate === '30' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                }`}
              >
                ไม่ยื่น (30%)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ค่าคอมมิชชันต่อออเดอร์ (USD)</label>
            <div className="relative">
              <Input value={usCommission} onChange={(e) => setUsCommission(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">USD</span>
            </div>
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
