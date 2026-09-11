'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateCagr,
  calculateRuleOf72,
  calculateInflation,
  calculateAssetAllocation,
  type AssetItem,
} from '@/lib/calculations/investment-principles';

interface InvestmentPrinciplesSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function InvestmentPrinciplesSection({ onOpenGlossary }: InvestmentPrinciplesSectionProps) {
  // 1. CAGR State
  const [cagrInitial, setCagrInitial] = useState('100,000');
  const [cagrFinal, setCagrFinal] = useState('250,000');
  const [cagrYears, setCagrYears] = useState('5');

  const cagrResult = calculateCagr({
    initialValue: parseNumber(cagrInitial),
    finalValue: parseNumber(cagrFinal),
    years: parseNumber(cagrYears),
  });

  // 2. Rule of 72 State
  const [ruleRate, setRuleRate] = useState('8');
  const [rulePrincipal, setRulePrincipal] = useState('100,000');

  const ruleResult = calculateRuleOf72({
    annualRatePercent: parseNumber(ruleRate),
    currentPrincipal: parseNumber(rulePrincipal),
  });

  // 3. Inflation State
  const [nominalReturn, setNominalReturn] = useState('5');
  const [inflationRate, setInflationRate] = useState('3');
  const [currentCash, setCurrentCash] = useState('1,000,000');
  const [futureYears, setFutureYears] = useState('10');

  const inflationResult = calculateInflation({
    nominalReturnPercent: parseNumber(nominalReturn),
    inflationRatePercent: parseNumber(inflationRate),
    currentCashValue: parseNumber(currentCash),
    futureYears: parseNumber(futureYears),
  });

  // 4. Asset Allocation State
  const [stockWeight, setStockWeight] = useState(50);
  const [bondWeight, setBondWeight] = useState(30);
  const [goldWeight, setGoldWeight] = useState(10);
  const [cashWeight, setCashWeight] = useState(10);

  const assets: AssetItem[] = [
    { id: '1', nameTh: 'หุ้น (Equities)', weightPercent: stockWeight, expectedReturnPercent: 9.0, color: '#3b82f6' },
    { id: '2', nameTh: 'ตราสารหนี้/พันธบัตร', weightPercent: bondWeight, expectedReturnPercent: 3.5, color: '#10b981' },
    { id: '3', nameTh: 'ทองคำ (Gold)', weightPercent: goldWeight, expectedReturnPercent: 5.0, color: '#f59e0b' },
    { id: '4', nameTh: 'เงินสด/ตลาดเงิน', weightPercent: cashWeight, expectedReturnPercent: 1.5, color: '#6b7280' },
  ];

  const allocationResult = calculateAssetAllocation(assets);

  return (
    <div className="space-y-8">
      {/* 1. CAGR Calculator */}
      <CalculatorCard
        id="calc-cagr"
        title="เครื่องคำนวณผลตอบแทนทบต้นเฉลี่ยต่อปี (CAGR)"
        subtitle="วัดอัตราการเติบโตแท้จริงของการลงทุนตลอดช่วงเวลาที่ถือครอง"
        badge="ผลตอบแทนที่แท้จริง"
        onReset={() => {
          setCagrInitial('100,000');
          setCagrFinal('250,000');
          setCagrYears('5');
        }}
        onOpenHelp={() => onOpenGlossary?.('cagr')}
        resultNode={
          <ResultDisplay
            badgeText="Compound Annual Growth Rate"
            primaryLabel="ผลตอบแทนทบต้นเฉลี่ยต่อปี (CAGR)"
            primaryValue={`${formatPercent(cagrResult.cagrPercent)}%`}
            primaryUnit="ต่อปี"
            secondaryNote={`กำไรรวม ${formatMoney(cagrResult.totalGainAmount)} บาท (+${formatPercent(cagrResult.totalGainPercent)}%)`}
            metrics={[
              { label: 'กำไรรวมสุทธิ', value: formatMoney(cagrResult.totalGainAmount), unit: 'บาท' },
              { label: 'ผลตอบแทนรวม', value: `+${formatPercent(cagrResult.totalGainPercent)}%` },
              { label: 'ค่าเฉลี่ยธรรมดา', value: `${formatPercent(cagrResult.simpleAverageReturnPercent)}%/ปี`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Compound Annual Growth Rate (CAGR)"
            formula="CAGR = (มูลค่าสิ้นสุด / มูลค่าเริ่มต้น)^(1 / จำนวนปี) - 1"
            explanation="CAGR ขจัดความบิดเบือนของความผันผวนในแต่ละปี ทำให้สามารถเปรียบเทียบผลการดำเนินงานของสินทรัพย์หรือกองทุนต่างชนิดกันได้อย่างเป็นธรรม"
            tips="อย่าสับสนกับผลตอบแทนเฉลี่ยธรรมดา (Simple Average) เช่น หากพอร์ต -50% ในปีแรก และ +50% ในปีที่สอง ค่าเฉลี่ยธรรมดาคือ 0% แต่เงินจริงของคุณจะหายไปถึง 25% (CAGR จะสะท้อนติดลบจริง)"
            relatedTermId="cagr"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div>
          <label className="block text-sm font-bold mb-1">มูลค่าเงินลงทุนเริ่มต้น</label>
          <div className="relative">
            <Input
              value={cagrInitial}
              onChange={(e) => setCagrInitial(formatNumberInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">มูลค่าเงินลงทุนสิ้นสุด (ปัจจุบัน)</label>
          <div className="relative">
            <Input
              value={cagrFinal}
              onChange={(e) => setCagrFinal(formatNumberInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">ระยะเวลาถือครอง (ปี)</label>
          <div className="relative">
            <Input
              value={cagrYears}
              onChange={(e) => setCagrYears(formatDecimalInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">ปี</span>
          </div>
        </div>
      </CalculatorCard>

      {/* 2. Rule of 72 Calculator */}
      <CalculatorCard
        id="calc-rule-of-72"
        title="เครื่องคำนวณกฎ 72 (Rule of 72)"
        subtitle="ประเมินระยะเวลาที่เงินจะเพิ่มเป็น 2 เท่า หรือดูผลกระทบของเงินเฟ้อ"
        badge="สูตรลัดการเงิน"
        onReset={() => {
          setRuleRate('8');
          setRulePrincipal('100,000');
        }}
        onOpenHelp={() => onOpenGlossary?.('rule-of-72')}
        resultNode={
          <ResultDisplay
            badgeText="ระยะเวลาเงินโตเป็นสองเท่า"
            primaryLabel="เงินจะเพิ่มเป็น 2 เท่าในเวลาประมาณ"
            primaryValue={ruleResult.yearsToDouble}
            primaryUnit="ปี"
            secondaryNote={`จากเงินต้น ${formatMoney(parseNumber(rulePrincipal))} บาท จะกลายเป็น ${formatMoney(ruleResult.doubledAmount)} บาท`}
            metrics={[
              { label: 'อัตราผลตอบแทน', value: `${ruleRate}%`, unit: '/ปี' },
              { label: 'เวลาคำนวณเป๊ะ', value: ruleResult.exactYearsToDouble, unit: 'ปี' },
              { label: 'เงินหลังทวีคูณ', value: formatMoney(ruleResult.doubledAmount), unit: 'บาท', highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="กฎของ 72"
            formula="จำนวนปีที่เงินจะโต 2 เท่า ≈ 72 ÷ อัตราผลตอบแทนต่อปี (%)"
            explanation="เป็นสูตรลัดทางคณิตศาสตร์การเงินที่มีความแม่นยำสูงเมื่อผลตอบแทนอยู่ในช่วง 5%–12% ช่วยให้นักลงทุนตัดสินใจได้อย่างรวดเร็วโดยไม่ต้องใช้เครื่องคิดเลขซับซ้อน"
            tips="หากต้องการให้เงินโต 2 เท่าใน 6 ปี คุณต้องหาการลงทุนที่ให้ผลตอบแทน 72 ÷ 6 = 12% ต่อปี"
            relatedTermId="rule-of-72"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div>
          <label className="block text-sm font-bold mb-1">ผลตอบแทนคาดหวังต่อปี (%)</label>
          <div className="relative">
            <Input
              value={ruleRate}
              onChange={(e) => setRuleRate(formatDecimalInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">เงินต้นสำหรับการคำนวณ</label>
          <div className="relative">
            <Input
              value={rulePrincipal}
              onChange={(e) => setRulePrincipal(formatNumberInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {[4, 6, 8, 10, 12, 15].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setRuleRate(rate.toString())}
              className={`px-3 py-1.5 rounded-lg border font-bold ${
                ruleRate === rate.toString() ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              }`}
            >
              {rate}% ({Math.round(72 / rate)} ปี)
            </button>
          ))}
        </div>
      </CalculatorCard>

      {/* 3. Inflation & Real Return Calculator */}
      <CalculatorCard
        id="calc-inflation"
        title="เครื่องคำนวณเงินเฟ้อและผลตอบแทนที่แท้จริง (Inflation & Real Return)"
        subtitle="ดูการสูญเสียอำนาจซื้อของเงินสด และผลตอบแทนหลังหักเงินเฟ้อ"
        badge="อำนาจซื้อที่แท้จริง"
        onReset={() => {
          setNominalReturn('5');
          setInflationRate('3');
          setCurrentCash('1,000,000');
          setFutureYears('10');
        }}
        onOpenHelp={() => onOpenGlossary?.('real-return-inflation')}
        resultNode={
          <ResultDisplay
            badgeText="ผลตอบแทนแท้จริง (Fisher Real Return)"
            primaryLabel="ผลตอบแทนที่แท้จริงต่อปี"
            primaryValue={`${formatPercent(inflationResult.exactFisherRealReturnPercent)}%`}
            primaryUnit="ต่อปี"
            secondaryNote={`เงินสด ${formatMoney(parseNumber(currentCash))} บาทในอีก ${futureYears} ปี จะมีอำนาจซื้อเทียบเท่าเพียง ${formatMoney(inflationResult.futurePurchasingPowerValue)} บาท (อำนาจซื้อหายไป ${formatPercent(inflationResult.purchasingPowerLossPercent)}%)`}
            metrics={[
              { label: 'ผลตอบแทนระบุ', value: `${nominalReturn}%`, unit: '/ปี' },
              { label: 'อัตราเงินเฟ้อ', value: `${inflationRate}%`, unit: '/ปี' },
              { label: 'อำนาจซื้อที่ลดลง', value: `-${formatPercent(inflationResult.purchasingPowerLossPercent)}%`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="สมการฟิชเชอร์ (Fisher Equation)"
            formula="(1 + r_real) = (1 + r_nominal) / (1 + inflation)  =>  r_real ≈ r_nominal - inflation"
            explanation="หากผลตอบแทนจากการลงทุนต่ำกว่าอัตราเงินเฟ้อ มูลค่าเงินแม้จะดูเพิ่มขึ้นเป็นตัวเลข แต่ความสามารถในการซื้อสินค้าและบริการจริงจะลดลงเรื่อยๆ"
            tips="การเก็บเงินสดไว้เฉยๆ หรือฝากบัญชีดอกเบี้ยต่ำในระยะยาว มีความเสี่ยงซ่อนเร้นคือ เงินเฟ้อกัดกินมูลค่าเงินอย่างต่อเนื่อง"
            relatedTermId="real-return-inflation"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ผลตอบแทนที่ได้จากการลงทุน (%/ปี)</label>
            <div className="relative">
              <Input
                value={nominalReturn}
                onChange={(e) => setNominalReturn(formatDecimalInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">อัตราเงินเฟ้อเฉลี่ย (%/ปี)</label>
            <div className="relative">
              <Input
                value={inflationRate}
                onChange={(e) => setInflationRate(formatDecimalInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">มูลค่าเงินสดปัจจุบัน</label>
            <div className="relative">
              <Input
                value={currentCash}
                onChange={(e) => setCurrentCash(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ระยะเวลาในอนาคต (ปี)</label>
            <div className="relative">
              <Input
                value={futureYears}
                onChange={(e) => setFutureYears(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">ปี</span>
            </div>
          </div>
        </div>
      </CalculatorCard>

      {/* 4. Asset Allocation Calculator */}
      <CalculatorCard
        id="calc-asset-allocation"
        title="เครื่องคำนวณการจัดพอร์ตและผลตอบแทนคาดหวัง (Asset Allocation)"
        subtitle="ปรับสัดส่วนสินทรัพย์เพื่อดูผลตอบแทนเฉลี่ยคาดหวังของพอร์ตลงทุนรวม"
        badge="จัดพอร์ตลงทุน"
        onReset={() => {
          setStockWeight(50);
          setBondWeight(30);
          setGoldWeight(10);
          setCashWeight(10);
        }}
        onOpenHelp={() => onOpenGlossary?.('asset-allocation')}
        resultNode={
          <ResultDisplay
            badgeText="ผลตอบแทนคาดหวังของพอร์ต"
            primaryLabel="Expected Return ของพอร์ตโฟลิโอ"
            primaryValue={`${allocationResult.portfolioExpectedReturnPercent}%`}
            primaryUnit="ต่อปี"
            secondaryNote={`พอร์ตขนาด 1,000,000 บาท คาดว่าจะสร้างผลตอบแทนเฉลี่ยประมาณ ${formatMoney(allocationResult.projectedAnnualIncomePerMillion)} บาท/ปี`}
            statusMessage={
              !allocationResult.isWeightValid
                ? { text: `สัดส่วนสินทรัพย์รวมเท่ากับ ${allocationResult.totalWeight}% (ควรปรับให้ครบ 100%)`, variant: 'warning' }
                : { text: 'สัดส่วนสินทรัพย์รวมครบ 100% สมบูรณ์', variant: 'safe' }
            }
            metrics={[
              { label: 'สัดส่วนรวม', value: `${allocationResult.totalWeight}%`, highlight: !allocationResult.isWeightValid },
              { label: 'กำไรต่อล้าน/ปี', value: formatMoney(allocationResult.projectedAnnualIncomePerMillion), unit: 'บาท' },
              { label: 'สัดส่วนหุ้น', value: `${stockWeight}%` },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Asset Allocation Expected Return"
            formula="E(R_portfolio) = w1 × E(R1) + w2 × E(R2) + ... + wn × E(Rn)"
            explanation="การกระจายการลงทุนในสินทรัพย์ที่มีความสัมพันธ์ของผลตอบแทนต่ำต่อกัน ช่วยลดความผันผวนของพอร์ตโดยรวมลง โดยที่ยังคงรักษาผลตอบแทนคาดหวังในระดับที่ดีได้"
            tips="ควรกำหนดนโยบายการปรับสมดุลพอร์ต (Rebalancing) ทุก 6 หรือ 12 เดือน เพื่อขายสินทรัพย์ที่ราคาขึ้นมาเยอะไปซื้อสินทรัพย์ที่ราคาลดลง"
            relatedTermId="asset-allocation"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>หุ้น (คาดหวัง 9.0%)</span>
              <span className="font-numbers">{stockWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stockWeight}
              onChange={(e) => setStockWeight(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>ตราสารหนี้ (คาดหวัง 3.5%)</span>
              <span className="font-numbers">{bondWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bondWeight}
              onChange={(e) => setBondWeight(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>ทองคำ (คาดหวัง 5.0%)</span>
              <span className="font-numbers">{goldWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={goldWeight}
              onChange={(e) => setGoldWeight(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>เงินสด/ตลาดเงิน (คาดหวัง 1.5%)</span>
              <span className="font-numbers">{cashWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={cashWeight}
              onChange={(e) => setCashWeight(Number(e.target.value))}
              className="w-full accent-gray-500"
            />
          </div>
        </div>

        {/* Allocation Presets */}
        <div className="pt-2">
          <span className="text-xs text-muted-foreground font-bold block mb-1.5">ตัวอย่างพอร์ตยอดนิยม:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setStockWeight(60); setBondWeight(40); setGoldWeight(0); setCashWeight(0); }}
              className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-bold"
            >
              คลาสสิก 60/40
            </button>
            <button
              type="button"
              onClick={() => { setStockWeight(80); setBondWeight(15); setGoldWeight(0); setCashWeight(5); }}
              className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-bold"
            >
              เติบโตสูง 80/20
            </button>
            <button
              type="button"
              onClick={() => { setStockWeight(30); setBondWeight(40); setGoldWeight(15); setCashWeight(15); }}
              className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-bold"
            >
              ระมัดระวัง (All Weather)
            </button>
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
