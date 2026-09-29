// 1. DCA Fund Simulator (การลงทุนแบบถัวเฉลี่ยต้นทุน)
export type DcaFrequency = 'monthly' | 'yearly';
export type DcaDurationUnit = 'years' | 'months';
export type DcaTiming = 'start' | 'end';

export const DCA_MAX_MONTHS = 60 * 12;

export interface DcaFundInput {
  initialLumpSum?: number; // เงินก้อนเริ่มต้น (ถ้ามี)
  contributionAmount: number; // เงินลงทุนต่องวด
  contributionFrequency: DcaFrequency; // ลงทุนทุกเดือน หรือ ทุกปี
  expectedAnnualReturnPercent: number; // ผลตอบแทนคาดหวังเฉลี่ยต่อปี %
  duration: number; // ระยะเวลาลงทุน
  durationUnit: DcaDurationUnit; // หน่วยของระยะเวลา (ปี / เดือน)
  contributionTiming?: DcaTiming; // ลงทุนต้นงวด หรือ ปลายงวด (ค่าเริ่มต้น: ปลายงวด)
  annualStepUpPercent?: number; // เพิ่มเงินลงทุนต่องวดทุกปี %
  inflationPercent?: number; // เงินเฟ้อต่อปี % (ใช้คิดมูลค่าเทียบเงินวันนี้)
}

export interface DcaDataPoint {
  month: number; // เดือนที่ (0 = วันเริ่มต้น)
  capital: number; // เงินต้นสะสม
  profit: number; // กำไรสะสม (ติดลบได้)
  value: number; // มูลค่าพอร์ต
}

export interface DcaFundResult {
  totalMonths: number;
  totalInvestedCapital: number;
  totalProfit: number;
  portfolioValue: number;
  profitPercentage: number;
  valueMultiple: number; // มูลค่าพอร์ต / เงินต้น
  realPortfolioValue: number; // มูลค่าพอร์ตเทียบเงินวันนี้ (หักเงินเฟ้อ)
  contributionCount: number;
  lastContribution: number; // เงินลงทุนงวดสุดท้าย (หลังปรับเพิ่มรายปี)
  monthlyData: DcaDataPoint[]; // จุดข้อมูลทุกเดือน (รวมเดือนที่ 0)
}

export function calculateDcaFund(input: DcaFundInput): DcaFundResult {
  const initial = Math.max(0, input.initialLumpSum || 0);
  const baseAmount = Math.max(0, input.contributionAmount);
  const r = Math.max(-99, Math.min(100, input.expectedAnnualReturnPercent)) / 100 / 12;
  const stepUp = Math.max(0, Math.min(100, input.annualStepUpPercent || 0)) / 100;
  const inflation = Math.max(0, Math.min(50, input.inflationPercent || 0)) / 100;
  const timing = input.contributionTiming ?? 'end';

  const rawMonths = input.durationUnit === 'years' ? input.duration * 12 : input.duration;
  const totalMonths = Math.max(1, Math.min(DCA_MAX_MONTHS, Math.round(rawMonths) || 1));

  let value = initial;
  let capital = initial;
  let contributionCount = 0;
  let lastContribution = 0;

  const toPoint = (month: number): DcaDataPoint => ({
    month,
    capital: Math.round(capital),
    profit: Math.round(value - capital),
    value: Math.round(value),
  });

  const monthlyData: DcaDataPoint[] = [toPoint(0)];

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const amount = baseAmount * Math.pow(1 + stepUp, yearIndex);

    // ลงทุนรายปี: ต้นงวด = เดือนแรกของปี, ปลายงวด = เดือนสุดท้ายของปี
    const investsThisMonth =
      input.contributionFrequency === 'monthly' ||
      (timing === 'start' ? (m - 1) % 12 === 0 : m % 12 === 0);
    const contribution = investsThisMonth ? amount : 0;

    if (timing === 'start') {
      value = (value + contribution) * (1 + r);
    } else {
      value = value * (1 + r) + contribution;
    }
    capital += contribution;

    if (contribution > 0) {
      contributionCount++;
      lastContribution = contribution;
    }

    monthlyData.push(toPoint(m));
  }

  const profit = value - capital;
  const profitPct = capital > 0 ? (profit / capital) * 100 : 0;
  const realValue = value / Math.pow(1 + inflation, totalMonths / 12);

  return {
    totalMonths,
    totalInvestedCapital: Math.round(capital),
    totalProfit: Math.round(profit),
    portfolioValue: Math.round(value),
    profitPercentage: Number(profitPct.toFixed(1)),
    valueMultiple: capital > 0 ? Number((value / capital).toFixed(2)) : 0,
    realPortfolioValue: Math.round(realValue),
    contributionCount,
    lastContribution: Math.round(lastContribution),
    monthlyData,
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
  // มูลค่าพอร์ตแต่ละเดือนของทั้งสองกองทุน (เดือนที่ 0 = เริ่มต้น)
  monthlyData: Array<{ month: number; capital: number; lowFee: number; highFee: number }>;
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

  const lowPath = simulateGrowth(p, pmt, lowNetReturn, years);
  const highPath = simulateGrowth(p, pmt, highNetReturn, years);
  const lowSim = lowPath[lowPath.length - 1];
  const highSim = highPath[highPath.length - 1];

  const monthlyData = lowPath.map((low, month) => ({
    month,
    capital: Math.round(p + pmt * month),
    lowFee: Math.round(low),
    highFee: Math.round(highPath[month]),
  }));

  const lost = Math.max(0, lowSim - highSim);
  const lostPct = lowSim > 0 ? (lost / lowSim) * 100 : 0;

  return {
    lowFeeFinalValue: Math.round(lowSim),
    highFeeFinalValue: Math.round(highSim),
    wealthLostToFees: Math.round(lost),
    wealthLostPercentage: Number(lostPct.toFixed(1)),
    monthlyData,
  };
}

// คืนมูลค่าพอร์ตทุกเดือน (index 0 = เงินต้นเริ่มต้น)
function simulateGrowth(principal: number, monthly: number, annualRatePct: number, years: number): number[] {
  const r = annualRatePct / 100 / 12;
  const months = Math.round(years * 12);
  let val = principal;
  const path = [val];
  for (let i = 0; i < months; i++) {
    val = val * (1 + r) + monthly;
    path.push(val);
  }
  return path;
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
