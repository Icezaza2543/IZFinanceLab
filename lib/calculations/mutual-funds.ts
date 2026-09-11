// 1. DCA Fund Simulator (การลงทุนแบบถัวเฉลี่ยต้นทุน)
export interface DcaFundInput {
  monthlyInvestment: number; // เงินลงทุนต่อเดือน
  expectedAnnualReturnPercent: number; // ผลตอบแทนคาดหวังเฉลี่ยต่อปี %
  investmentYears: number; // ระยะเวลาลงทุน (ปี)
  initialLumpSum?: number; // เงินก้อนเริ่มต้น (ถ้ามี)
}

export interface DcaFundResult {
  totalInvestedCapital: number;
  totalProfit: number;
  portfolioValue: number;
  profitPercentage: number;
  yearlyData: Array<{
    year: number;
    capital: number;
    value: number;
  }>;
}

export function calculateDcaFund(input: DcaFundInput): DcaFundResult {
  const pmt = Math.max(0, input.monthlyInvestment);
  const r = Math.max(0, input.expectedAnnualReturnPercent) / 100 / 12;
  const years = Math.max(1, Math.min(40, input.investmentYears));
  const initial = Math.max(0, input.initialLumpSum || 0);

  const totalMonths = years * 12;
  let currentValue = initial;
  let totalCapital = initial;
  const yearlyData: DcaFundResult['yearlyData'] = [];

  for (let m = 1; m <= totalMonths; m++) {
    currentValue = currentValue * (1 + r) + pmt;
    totalCapital += pmt;

    if (m % 12 === 0) {
      yearlyData.push({
        year: m / 12,
        capital: Math.round(totalCapital),
        value: Math.round(currentValue),
      });
    }
  }

  const profit = Math.max(0, currentValue - totalCapital);
  const profitPct = totalCapital > 0 ? (profit / totalCapital) * 100 : 0;

  return {
    totalInvestedCapital: Math.round(totalCapital),
    totalProfit: Math.round(profit),
    portfolioValue: Math.round(currentValue),
    profitPercentage: Number(profitPct.toFixed(1)),
    yearlyData,
  };
}

// 2. Fund Expense Ratio Impact (ผลกระทบค่าธรรมเนียมกองทุน)
export interface ExpenseRatioInput {
  initialInvestment: number; // เงินลงทุนเริ่มต้น
  monthlyAddition: number; // ออมเพิ่มต่อเดือน
  grossAnnualReturnPercent: number; // ผลตอบแทนกองทุนก่อนหักค่าธรรมเนียม %
  lowFeePercent: number; // กองทุนค่าธรรมเนียมต่ำ (เช่น กองดัชนี 0.4%)
  highFeePercent: number; // กองทุนค่าธรรมเนียมสูง (เช่น กอง Active 1.8%)
  years: number; // จำนวนปีที่ถือครอง
}

export interface ExpenseRatioResult {
  lowFeeFinalValue: number;
  highFeeFinalValue: number;
  wealthLostToFees: number; // ส่วนต่างของเงินที่หายไปกับค่าธรรมเนียม
  wealthLostPercentage: number;
}

export function calculateExpenseRatioImpact(input: ExpenseRatioInput): ExpenseRatioResult {
  const p = Math.max(0, input.initialInvestment);
  const pmt = Math.max(0, input.monthlyAddition);
  const gross = Math.max(0, input.grossAnnualReturnPercent);
  const lowFee = Math.max(0, input.lowFeePercent);
  const highFee = Math.max(0, input.highFeePercent);
  const years = Math.max(1, Math.min(40, input.years));

  const lowNetReturn = Math.max(0, gross - lowFee);
  const highNetReturn = Math.max(0, gross - highFee);

  const lowSim = simulateGrowth(p, pmt, lowNetReturn, years);
  const highSim = simulateGrowth(p, pmt, highNetReturn, years);

  const lost = Math.max(0, lowSim - highSim);
  const lostPct = lowSim > 0 ? (lost / lowSim) * 100 : 0;

  return {
    lowFeeFinalValue: Math.round(lowSim),
    highFeeFinalValue: Math.round(highSim),
    wealthLostToFees: Math.round(lost),
    wealthLostPercentage: Number(lostPct.toFixed(1)),
  };
}

function simulateGrowth(principal: number, monthly: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12;
  const months = years * 12;
  let val = principal;
  for (let i = 0; i < months; i++) {
    val = val * (1 + r) + monthly;
  }
  return val;
}

// 3. Tax Deductible Funds (Thai ESG, RMF, SSF)
export interface TaxFundInput {
  annualIncome: number; // รายได้ทั้งปี (บาท)
  taxBracketPercent: number; // ฐานภาษีสูงสุด (0%, 5%, 10%, 15%, 20%, 25%, 30%, 35%)
  thaiEsgAmount: number; // ซื้อ Thai ESG (สูงสุด 30% ของรายได้ ไม่เกิน 300,000 บาท)
  rmfAmount: number; // ซื้อ RMF (สูงสุด 30% ของรายได้ เมื่อรวมกองทุนเกษียณอื่นไม่เกิน 500,000 บาท)
}

export interface TaxFundResult {
  maxThaiEsgLimit: number;
  maxRmfLimit: number;
  allowedThaiEsg: number;
  allowedRmf: number;
  totalDeduction: number;
  estimatedTaxSaved: number;
  effectiveDiscountPercent: number;
}

export function calculateTaxFund(input: TaxFundInput): TaxFundResult {
  const income = Math.max(0, input.annualIncome);
  const taxRate = Math.max(0, Math.min(35, input.taxBracketPercent)) / 100;

  // เงื่อนไข Thai ESG 2024+: 30% ของรายได้ สูงสุด 300,000 บาท (ไม่รวมเพดาน 5 แสนของเกษียณ)
  const maxThaiEsg = Math.min(income * 0.3, 300000);
  // เงื่อนไข RMF: 30% ของรายได้ สูงสุด 500,000 บาท (รวมกลุ่มเกษียณ)
  const maxRmf = Math.min(income * 0.3, 500000);

  const allowedThaiEsg = Math.min(Math.max(0, input.thaiEsgAmount), maxThaiEsg);
  const allowedRmf = Math.min(Math.max(0, input.rmfAmount), maxRmf);

  const totalDeduction = allowedThaiEsg + allowedRmf;
  const taxSaved = totalDeduction * taxRate;

  return {
    maxThaiEsgLimit: Math.round(maxThaiEsg),
    maxRmfLimit: Math.round(maxRmf),
    allowedThaiEsg: Math.round(allowedThaiEsg),
    allowedRmf: Math.round(allowedRmf),
    totalDeduction: Math.round(totalDeduction),
    estimatedTaxSaved: Math.round(taxSaved),
    effectiveDiscountPercent: input.taxBracketPercent,
  };
}
