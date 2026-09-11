'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateEmergencyFund,
  calculateCompoundInterest,
  calculateRetirement,
  calculateDebtPayoff,
} from '@/lib/calculations/financial-planning';

interface FinancialPlanningSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function FinancialPlanningSection({ onOpenGlossary }: FinancialPlanningSectionProps) {
  // 1. Emergency Fund State
  const [fixedExpense, setFixedExpense] = useState('20,000');
  const [variableExpense, setVariableExpense] = useState('15,000');
  const [monthsTarget, setMonthsTarget] = useState(6);
  const [currentSavings, setCurrentSavings] = useState('50,000');

  const emergencyResult = calculateEmergencyFund({
    monthlyFixedExpense: parseNumber(fixedExpense),
    monthlyVariableExpense: parseNumber(variableExpense),
    jobSecurityMonths: monthsTarget,
    currentSavings: parseNumber(currentSavings),
  });

  // 2. Compound Interest State
  const [initialPrincipal, setInitialPrincipal] = useState('100,000');
  const [monthlyContribution, setMonthlyContribution] = useState('5,000');
  const [annualRate, setAnnualRate] = useState('7');
  const [investYears, setInvestYears] = useState('15');

  const compoundResult = calculateCompoundInterest({
    initialPrincipal: parseNumber(initialPrincipal),
    monthlyContribution: parseNumber(monthlyContribution),
    annualRatePercent: parseNumber(annualRate),
    years: parseNumber(investYears),
  });

  // 3. Retirement Planner State
  const [currentAge, setCurrentAge] = useState('30');
  const [retireAge, setRetireAge] = useState('60');
  const [lifeExpectancy, setLifeExpectancy] = useState('85');
  const [monthlyExpenseToday, setMonthlyExpenseToday] = useState('30,000');
  const [inflationRate, setInflationRate] = useState('2.5');
  const [postRetireReturn, setPostRetireReturn] = useState('4');
  const [currentRetireFund, setCurrentRetireFund] = useState('200,000');

  const retireResult = calculateRetirement({
    currentAge: parseNumber(currentAge),
    retireAge: parseNumber(retireAge),
    lifeExpectancyAge: parseNumber(lifeExpectancy),
    monthlyExpenseToday: parseNumber(monthlyExpenseToday),
    inflationRatePercent: parseNumber(inflationRate),
    postRetireReturnPercent: parseNumber(postRetireReturn),
    currentRetirementSavings: parseNumber(currentRetireFund),
  });

  // 4. Debt Payoff State
  const [creditCardBal, setCreditCardBal] = useState('40,000');
  const [personalLoanBal, setPersonalLoanBal] = useState('100,000');
  const [extraPayment, setExtraPayment] = useState('3,000');

  const debtsList = [
    { id: '1', name: 'หนี้บัตรเครดิต', balance: parseNumber(creditCardBal), interestRatePercent: 16, minPayment: Math.max(500, parseNumber(creditCardBal) * 0.08) },
    { id: '2', name: 'สินเชื่อส่วนบุคคล', balance: parseNumber(personalLoanBal), interestRatePercent: 20, minPayment: Math.max(1000, parseNumber(personalLoanBal) * 0.05) },
  ];

  const debtResult = calculateDebtPayoff(debtsList, parseNumber(extraPayment));

  return (
    <div className="space-y-8">
      {/* 1. Emergency Fund Calculator */}
      <CalculatorCard
        id="calc-emergency-fund"
        title="เครื่องคำนวณเงินสำรองฉุกเฉิน (Emergency Fund)"
        subtitle="ประเมินเงินสำรองสภาพคล่องที่เหมาะสมตามความจำเป็นของชีวิต"
        badge="พื้นฐานการเงิน"
        onReset={() => {
          setFixedExpense('20,000');
          setVariableExpense('15,000');
          setMonthsTarget(6);
          setCurrentSavings('50,000');
        }}
        onOpenHelp={() => onOpenGlossary?.('emergency-fund')}
        resultNode={
          <ResultDisplay
            badgeText="เป้าหมายเงินสำรองฉุกเฉิน"
            primaryLabel="เงินสำรองที่ควรมีทั้งหมด"
            primaryValue={formatMoney(emergencyResult.targetFund)}
            primaryUnit="บาท"
            secondaryNote={`ขาดอีก ${formatMoney(emergencyResult.gapAmount)} บาท จะครบตามเป้าหมาย`}
            progressPercent={emergencyResult.progressPercent}
            progressLabel={`มีแล้ว ${emergencyResult.monthsCoveredCurrent.toFixed(1)} / ${monthsTarget} เดือน`}
            statusMessage={{
              text: emergencyResult.recommendationTh,
              variant: emergencyResult.monthsCoveredCurrent >= monthsTarget ? 'safe' : emergencyResult.monthsCoveredCurrent >= 3 ? 'warning' : 'danger',
            }}
            metrics={[
              { label: 'รายจ่ายรวม/เดือน', value: formatMoney(emergencyResult.totalMonthlyExpense), unit: 'บาท' },
              { label: 'เงินเก็บปัจจุบัน', value: formatMoney(emergencyResult.currentSavings), unit: 'บาท' },
              { label: 'ความคืบหน้า', value: `${Math.round(emergencyResult.progressPercent)}%`, highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="เงินสำรองฉุกเฉิน"
            formula="เป้าหมายเงินสำรอง = (รายจ่ายคงที่ + รายจ่ายผันแปรต่อเดือน) × จำนวนเดือนที่ต้องการสำรอง"
            explanation="พนักงานประจำที่มีความมั่นคงแนะนำสำรอง 3–6 เดือน ส่วนฟรีแลนซ์ เจ้าของกิจการ หรือผู้มีภาระหนี้สูงควรสำรอง 6–12 เดือน เพื่อรองรับความผันผวนของรายได้"
            tips="ควรเก็บเงินก้อนนี้ไว้ในที่ที่ปลอดภัยและถอนได้รวดเร็ว เช่น บัญชีออมทรัพย์ดอกเบี้ยสูง หรือกองทุนรวมตลาดเงิน (Money Market Fund)"
            relatedTermId="emergency-fund"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div>
          <label className="block text-sm font-bold mb-1">รายจ่ายคงที่ต่อเดือน (ค่าบ้าน ค่ารถ ประกัน)</label>
          <div className="relative">
            <Input
              value={fixedExpense}
              onChange={(e) => setFixedExpense(formatNumberInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">รายจ่ายผันแปรต่อเดือน (ค่ากิน เที่ยว เดินทาง)</label>
          <div className="relative">
            <Input
              value={variableExpense}
              onChange={(e) => setVariableExpense(formatNumberInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">จำนวนเดือนที่ต้องการสำรอง</label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 9, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonthsTarget(m)}
                className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                  monthsTarget === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-input'
                }`}
              >
                {m} เดือน
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">เงินสำรองที่มีอยู่แล้วในปัจจุบัน</label>
          <div className="relative">
            <Input
              value={currentSavings}
              onChange={(e) => setCurrentSavings(formatNumberInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
        </div>
      </CalculatorCard>

      {/* 2. Compound Interest Calculator */}
      <CalculatorCard
        id="calc-compound-interest"
        title="เครื่องคำนวณดอกเบี้ยทบต้น (Compound Interest & Future Value)"
        subtitle="จำลองการเติบโตของเงินออมและพลังของผลตอบแทนทบต้นตามระยะเวลา"
        badge="ทวีคูณความมั่งคั่ง"
        onReset={() => {
          setInitialPrincipal('100,000');
          setMonthlyContribution('5,000');
          setAnnualRate('7');
          setInvestYears('15');
        }}
        onOpenHelp={() => onOpenGlossary?.('compound-interest')}
        resultNode={
          <ResultDisplay
            badgeText="มูลค่าพอร์ตในอนาคต (FV)"
            primaryLabel="เงินรวมที่ได้เมื่อสิ้นสุดระยะเวลา"
            primaryValue={formatMoney(compoundResult.futureValue)}
            primaryUnit="บาท"
            secondaryNote={`กำไรจากดอกเบี้ย/ผลตอบแทนทบต้น ${formatMoney(compoundResult.totalInterest)} บาท`}
            metrics={[
              { label: 'เงินต้นสะสมทั้งหมด', value: formatMoney(compoundResult.totalPrincipal), unit: 'บาท' },
              { label: 'ดอกเบี้ย/กำไรทบต้น', value: formatMoney(compoundResult.totalInterest), unit: 'บาท', highlight: true },
              {
                label: 'สัดส่วนกำไรต่อเงินต้น',
                value: `${compoundResult.totalPrincipal > 0 ? Math.round((compoundResult.totalInterest / compoundResult.totalPrincipal) * 100) : 0}%`,
              },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="ดอกเบี้ยทบต้น (Future Value)"
            formula="FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]"
            explanation="ผลตอบแทนที่ได้จะถูกนำกลับไปคำนวณเป็นเงินต้นใหม่ในงวดถัดไป ทำให้ยิ่งถือนาน ความเร็วในการงอกเงยของเงินจะยิ่งสูงขึ้นแบบก้าวกระโดด"
            tips="การเพิ่มเงินออมต่อเดือนเพียงเล็กน้อย หรือการยืดระยะเวลาลงทุนออกไปอีก 5 ปี สามารถเพิ่มมูลค่าเงินปลายทางได้เกือบเท่าตัว"
            relatedTermId="compound-interest"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">เงินลงทุนเริ่มต้น (ก้อนแรก)</label>
            <div className="relative">
              <Input
                value={initialPrincipal}
                onChange={(e) => setInitialPrincipal(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ออมเพิ่มสม่ำเสมอต่อเดือน</label>
            <div className="relative">
              <Input
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ผลตอบแทนเฉลี่ยต่อปี (%)</label>
            <div className="relative">
              <Input
                value={annualRate}
                onChange={(e) => setAnnualRate(formatDecimalInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ระยะเวลาลงทุน (ปี)</label>
            <div className="relative">
              <Input
                value={investYears}
                onChange={(e) => setInvestYears(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-8"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">ปี</span>
            </div>
          </div>
        </div>

        {/* Quick Return Presets */}
        <div>
          <span className="text-xs text-muted-foreground font-bold block mb-1.5">ผลตอบแทนอ้างอิงทั่วไป:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => setAnnualRate('2.5')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-semibold">
              เงินฝากดิจิทัล (2.5%)
            </button>
            <button type="button" onClick={() => setAnnualRate('4.5')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-semibold">
              หุ้นกู้/ตราสารหนี้ (4.5%)
            </button>
            <button type="button" onClick={() => setAnnualRate('8.0')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-semibold">
              กองทุนดัชนีหุ้นโลก (8.0%)
            </button>
            <button type="button" onClick={() => setAnnualRate('10.0')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-semibold">
              หุ้นเติบโต/S&P500 (10.0%)
            </button>
          </div>
        </div>
      </CalculatorCard>

      {/* 3. Retirement Planner Calculator */}
      <CalculatorCard
        id="calc-retirement"
        title="เครื่องคำนวณวางแผนเกษียณอายุ (Retirement Planner)"
        subtitle="คำนวณเงินก้อนที่ต้องเตรียมก่อนหยุดทำงาน โดยปรับตามอัตราเงินเฟ้อ"
        badge="เกษียณสุขใจ"
        onReset={() => {
          setCurrentAge('30');
          setRetireAge('60');
          setLifeExpectancy('85');
          setMonthlyExpenseToday('30,000');
          setInflationRate('2.5');
          setPostRetireReturn('4');
          setCurrentRetireFund('200,000');
        }}
        onOpenHelp={() => onOpenGlossary?.('retirement-nest-egg')}
        resultNode={
          <ResultDisplay
            badgeText="เงินก้อนเกษียณเป้าหมาย (Nest Egg)"
            primaryLabel="เงินก้อนที่ต้องมี ณ วันเกษียณ"
            primaryValue={formatMoney(retireResult.totalNestEggRequired)}
            primaryUnit="บาท"
            secondaryNote={`ต้องออมเพิ่มเดือนละ ${formatMoney(retireResult.requiredMonthlySavings)} บาท (${retireResult.yearsToRetire} ปีจนเกษียณ)`}
            metrics={[
              { label: 'ค่าใช้จ่าย/เดือน ณ วันเกษียณ', value: formatMoney(retireResult.futureMonthlyExpenseAtRetire), unit: 'บาท' },
              { label: 'ระยะเวลาใช้ชีวิตหลังเกษียณ', value: retireResult.yearsInRetirement, unit: 'ปี' },
              { label: 'ส่วนต่างเงินที่ยังขาด', value: formatMoney(retireResult.gapAmount), unit: 'บาท', highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="เงินก้อนเกษียณอายุ"
            formula="FV_expense = PV × (1+i)^n | Total_Nest_Egg = PV_annuity(r_real, n_retire, Annual_Expense)"
            explanation="ค่าใช้จ่ายในอนาคตจะเพิ่มขึ้นตามเงินเฟ้อ เมื่อคำนวณเงินก้อนเกษียณ จะคิดลดด้วยอัตราผลตอบแทนจริง (Real Rate) หลังหักเงินเฟ้อตลอดระยะเวลาใช้ชีวิตหลังเกษียณ"
            tips="อย่าลืมรวมค่าใช้จ่ายด้านประกันสุขภาพหรือการรักษาพยาบาล เพราะเป็นรายจ่ายที่มักเพิ่มขึ้นเร็วที่สุดในวัยเกษียณ"
            relatedTermId="retirement-nest-egg"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1">อายุปัจจุบัน</label>
            <Input value={currentAge} onChange={(e) => setCurrentAge(formatNumberInput(e.target.value))} className="font-numbers text-lg h-10" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">อายุเกษียณ</label>
            <Input value={retireAge} onChange={(e) => setRetireAge(formatNumberInput(e.target.value))} className="font-numbers text-lg h-10" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">อายุขัยคาดการณ์</label>
            <Input value={lifeExpectancy} onChange={(e) => setLifeExpectancy(formatNumberInput(e.target.value))} className="font-numbers text-lg h-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ค่าใช้จ่ายต่อเดือนในปัจจุบัน (มูลค่าเงินวันนี้)</label>
            <div className="relative">
              <Input
                value={monthlyExpenseToday}
                onChange={(e) => setMonthlyExpenseToday(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">เงินเก็บเพื่อเกษียณปัจจุบัน</label>
            <div className="relative">
              <Input
                value={currentRetireFund}
                onChange={(e) => setCurrentRetireFund(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">เงินเฟ้อเฉลี่ย (%/ปี)</label>
            <div className="relative">
              <Input value={inflationRate} onChange={(e) => setInflationRate(formatDecimalInput(e.target.value))} className="font-numbers text-base h-10 pr-6" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">ผลตอบแทนพอร์ตหลังเกษียณ (%)</label>
            <div className="relative">
              <Input value={postRetireReturn} onChange={(e) => setPostRetireReturn(formatDecimalInput(e.target.value))} className="font-numbers text-base h-10 pr-6" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">%</span>
            </div>
          </div>
        </div>
      </CalculatorCard>

      {/* 4. Debt Payoff Strategy */}
      <CalculatorCard
        id="calc-debt-payoff"
        title="เครื่องคำนวณกลยุทธ์ปลดหนี้ (Debt Snowball vs Avalanche)"
        subtitle="เปรียบเทียบระหว่างการปิดหนี้ดอกเบี้ยสูงก่อน vs ปิดยอดหนี้เล็กก่อน"
        badge="จัดการหนี้สิน"
        onReset={() => {
          setCreditCardBal('40,000');
          setPersonalLoanBal('100,000');
          setExtraPayment('3,000');
        }}
        onOpenHelp={() => onOpenGlossary?.('debt-snowball-avalanche')}
        resultNode={
          <ResultDisplay
            badgeText="เปรียบเทียบผลลัพธ์การปลดหนี้"
            primaryLabel="ประหยัดดอกเบี้ยได้เมื่อใช้ Avalanche"
            primaryValue={formatMoney(debtResult.interestSavedWithAvalanche)}
            primaryUnit="บาท"
            secondaryNote={`หนี้รวม ${formatMoney(debtResult.totalDebt)} บาท หมดหนี้ใน ${debtResult.avalanche.monthsToPayoff} เดือน`}
            metrics={[
              { label: 'Avalanche (ด/บ รวม)', value: formatMoney(debtResult.avalanche.totalInterestPaid), unit: 'บาท', highlight: true },
              { label: 'Snowball (ด/บ รวม)', value: formatMoney(debtResult.snowball.totalInterestPaid), unit: 'บาท' },
              { label: 'จ่ายขั้นต่ำรวม/เดือน', value: formatMoney(debtResult.totalMinPayment), unit: 'บาท' },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="กลยุทธ์ปลดหนี้"
            formula="Debt Avalanche = เรียงจากดอกเบี้ยสูงที่สุดก่อน | Debt Snowball = เรียงจากยอดหนี้น้อยที่สุดก่อน"
            explanation="Avalanche ประหยัดเงินดอกเบี้ยได้มากที่สุดตามหลักคณิตศาสตร์ ส่วน Snowball เน้นสร้างกำลังใจด้วยการปิดหนี้ทีละก้อนอย่างรวดเร็ว"
            tips="ไม่ว่าจะใช้วิธีใด กฎสำคัญที่สุดคือห้ามก่อหนี้บริโภคใหม่เพิ่มระหว่างทาง"
            relatedTermId="debt-snowball-avalanche"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">หนี้บัตรเครดิต (ดอกเบี้ย 16%)</label>
            <div className="relative">
              <Input
                value={creditCardBal}
                onChange={(e) => setCreditCardBal(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">หนี้สินเชื่อส่วนบุคคล (ดอกเบี้ย 20%)</label>
            <div className="relative">
              <Input
                value={personalLoanBal}
                onChange={(e) => setPersonalLoanBal(formatNumberInput(e.target.value))}
                className="font-numbers text-xl h-11 pr-12"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">เงินพิเศษที่สามารถโปะเพิ่มได้ต่อเดือน (Extra Payment)</label>
          <div className="relative">
            <Input
              value={extraPayment}
              onChange={(e) => setExtraPayment(formatNumberInput(e.target.value))}
              className="font-numbers text-xl h-11 pr-12"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ยิ่งมีเงินโปะเพิ่มมากเท่าไร ระยะเวลาการเป็นหนี้จะยิ่งลดลงอย่างรวดเร็ว
          </p>
        </div>
      </CalculatorCard>
    </div>
  );
}
