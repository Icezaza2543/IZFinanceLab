// 1. CAGR Calculator (Compound Annual Growth Rate)
export interface CagrInput {
  initialValue: number; // มูลค่าเริ่มต้น
  finalValue: number; // มูลค่าสุดท้าย
  years: number; // จำนวนปีที่ถือครอง
}

export interface CagrResult {
  cagrPercent: number;
  totalGainAmount: number;
  totalGainPercent: number;
  simpleAverageReturnPercent: number;
}

export function calculateCagr(input: CagrInput): CagrResult {
  const initial = Math.max(0, input.initialValue);
  const finalVal = Math.max(0, input.finalValue);
  const years = Math.max(0.01, input.years);

  const totalGain = finalVal - initial;
  const totalGainPct = initial > 0 ? (totalGain / initial) * 100 : 0;
  const simpleAverage = years > 0 ? totalGainPct / years : 0;

  let cagr = 0;
  if (initial > 0 && finalVal > 0 && years > 0) {
    cagr = (Math.pow(finalVal / initial, 1 / years) - 1) * 100;
  }

  return {
    cagrPercent: cagr,
    totalGainAmount: Math.round(totalGain),
    totalGainPercent: totalGainPct,
    simpleAverageReturnPercent: simpleAverage,
  };
}

// 2. Rule of 72 Calculator
export interface RuleOf72Input {
  annualRatePercent: number; // อัตราผลตอบแทนต่อปี %
  currentPrincipal: number; // เงินต้น
}

export interface RuleOf72Result {
  yearsToDouble: number;
  doubledAmount: number;
  exactYearsToDouble: number;
}

export function calculateRuleOf72(input: RuleOf72Input): RuleOf72Result {
  const rate = Math.max(0.1, input.annualRatePercent);
  const principal = Math.max(0, input.currentPrincipal);

  const yearsToDouble = 72 / rate;
  // สูตรเป๊ะ: ln(2) / ln(1 + r)
  const rDecimal = rate / 100;
  const exactYears = Math.log(2) / Math.log(1 + rDecimal);

  return {
    yearsToDouble: Number(yearsToDouble.toFixed(1)),
    doubledAmount: principal * 2,
    exactYearsToDouble: Number(exactYears.toFixed(2)),
  };
}

// 3. Inflation & Real Return Calculator
export interface InflationInput {
  nominalReturnPercent: number; // อัตราผลตอบแทนที่ระบุ %
  inflationRatePercent: number; // อัตราเงินเฟ้อเฉลี่ยต่อปี %
  currentCashValue: number; // มูลค่าเงินปัจจุบัน
  futureYears: number; // ระยะเวลาปี
}

export interface InflationResult {
  approxRealReturnPercent: number;
  exactFisherRealReturnPercent: number;
  futurePurchasingPowerValue: number; // อำนาจซื้อเทียบเท่าในอนาคต
  purchasingPowerLossPercent: number;
}

export function calculateInflation(input: InflationInput): InflationResult {
  const nominal = input.nominalReturnPercent;
  const inflation = Math.max(0, input.inflationRatePercent);
  const cash = Math.max(0, input.currentCashValue);
  const years = Math.max(1, input.futureYears);

  const approxReal = nominal - inflation;
  const nominalDec = nominal / 100;
  const inflationDec = inflation / 100;
  // Fisher Equation: (1 + r) = (1 + n) / (1 + i)  => r = ((1 + n) / (1 + i)) - 1
  const exactReal = ((1 + nominalDec) / (1 + inflationDec) - 1) * 100;

  // มูลค่าอำนาจซื้อของเงินก้อนนี้ในอีก n ปีข้างหน้าถ้าไม่นำไปลงทุน: Cash / (1+i)^n
  const futurePower = cash / Math.pow(1 + inflationDec, years);
  const lossPct = cash > 0 ? ((cash - futurePower) / cash) * 100 : 0;

  return {
    approxRealReturnPercent: approxReal,
    exactFisherRealReturnPercent: exactReal,
    futurePurchasingPowerValue: Math.round(futurePurchasingPowerValue(cash, inflationDec, years)),
    purchasingPowerLossPercent: lossPct,
  };
}

function futurePurchasingPowerValue(cash: number, inflationRateDec: number, years: number): number {
  return cash / Math.pow(1 + inflationRateDec, years);
}

// 4. Asset Allocation & Portfolio Expected Return
export interface AssetItem {
  id: string;
  nameTh: string;
  weightPercent: number;
  expectedReturnPercent: number;
  color: string;
}

export interface AssetAllocationResult {
  totalWeight: number;
  portfolioExpectedReturnPercent: number;
  projectedAnnualIncomePerMillion: number;
  isWeightValid: boolean;
}

export function calculateAssetAllocation(assets: AssetItem[]): AssetAllocationResult {
  const totalWeight = assets.reduce((sum, a) => sum + Math.max(0, a.weightPercent), 0);
  let weightedReturn = 0;

  for (const a of assets) {
    weightedReturn += (Math.max(0, a.weightPercent) / 100) * a.expectedReturnPercent;
  }

  // หากน้ำหนักรวมไม่เท่ากับ 100 จะ Normalize ให้เห็นภาพผลตอบแทนจริง
  const normalizedReturn = totalWeight > 0 ? (weightedReturn / (totalWeight / 100)) : 0;
  const incomePerMillion = 1000000 * (normalizedReturn / 100);

  return {
    totalWeight: Number(totalWeight.toFixed(1)),
    portfolioExpectedReturnPercent: Number(normalizedReturn.toFixed(2)),
    projectedAnnualIncomePerMillion: Math.round(incomePerMillion),
    isWeightValid: Math.abs(totalWeight - 100) < 0.1,
  };
}
