// 1. Bond Yield Calculator (Current Yield & YTM Approximation)
export interface BondYieldInput {
  faceValue: number; // ราคาพาร์ (Par Value เช่น 1,000 บาท)
  marketPrice: number; // ราคาซื้อขายปัจจุบัน (เช่น 960 บาท)
  annualCouponRatePercent: number; // อัตราดอกเบี้ยหน้าตั๋ว % ต่อปี
  yearsToMaturity: number; // จำนวนปีคงเหลือจนครบกำหนด
  couponFrequencyPerYear: number; // จ่ายดอกเบี้ยกี่ครั้งต่อปี (1, 2 หรือ 4 ครั้ง)
}

export interface BondYieldResult {
  annualCouponAmount: number;
  currentYieldPercent: number;
  approxYtmPercent: number;
  totalCashflowExpected: number;
  capitalGainLossAtMaturity: number;
}

export function calculateBondYield(input: BondYieldInput): BondYieldResult {
  const par = Math.max(1, input.faceValue);
  const price = Math.max(1, input.marketPrice);
  const couponRate = Math.max(0, input.annualCouponRatePercent) / 100;
  const n = Math.max(0.1, input.yearsToMaturity);

  const annualCoupon = par * couponRate;
  const currentYield = (annualCoupon / price) * 100;

  // YTM Approximation formula:
  // YTM = [C + (F - P) / n] / [(F + P) / 2]
  const numerator = annualCoupon + (par - price) / n;
  const denominator = (par + price) / 2;
  const approxYtm = denominator > 0 ? (numerator / denominator) * 100 : 0;

  const totalCoupons = annualCoupon * n;
  const capitalGain = par - price;
  const totalCashflow = totalCoupons + capitalGain;

  return {
    annualCouponAmount: Math.round(annualCoupon),
    currentYieldPercent: Number(currentYield.toFixed(2)),
    approxYtmPercent: Number(approxYtm.toFixed(2)),
    totalCashflowExpected: Math.round(totalCashflow),
    capitalGainLossAtMaturity: Math.round(capitalGain),
  };
}

// 2. Bond Coupon Payment Schedule & 15% Tax
export interface BondCouponInput {
  totalInvestmentValue: number; // มูลค่าลงทุนรวม (บาท)
  annualCouponRatePercent: number; // ดอกเบี้ยหน้าตั๋ว %
  paymentFrequency: 'annually' | 'semi-annually' | 'quarterly';
  withholdingTaxPercent: number; // ภาษีหัก ณ ที่จ่าย (ปกติ 15%)
}

export interface BondCouponResult {
  grossAnnualInterest: number;
  taxAnnual: number;
  netAnnualInterest: number;
  paymentPerPeriodNet: number;
  numberOfPaymentsPerYear: number;
  effectiveNetYieldPercent: number;
}

export function calculateBondCoupon(input: BondCouponInput): BondCouponResult {
  const principal = Math.max(0, input.totalInvestmentValue);
  const rate = Math.max(0, input.annualCouponRatePercent) / 100;
  const taxRate = Math.max(0, Math.min(100, input.withholdingTaxPercent)) / 100;

  const grossAnnual = principal * rate;
  const taxAnnual = grossAnnual * taxRate;
  const netAnnual = grossAnnual - taxAnnual;

  let periods = 1;
  if (input.paymentFrequency === 'semi-annually') periods = 2;
  if (input.paymentFrequency === 'quarterly') periods = 4;

  const paymentPerPeriod = netAnnual / periods;
  const netYield = input.annualCouponRatePercent * (1 - taxRate);

  return {
    grossAnnualInterest: Math.round(grossAnnual),
    taxAnnual: Math.round(taxAnnual),
    netAnnualInterest: Math.round(netAnnual),
    paymentPerPeriodNet: Math.round(paymentPerPeriod),
    numberOfPaymentsPerYear: periods,
    effectiveNetYieldPercent: Number(netYield.toFixed(2)),
  };
}

// 3. Clean Price vs Dirty Price (Accrued Interest)
export interface CleanDirtyPriceInput {
  cleanPrice: number; // ราคา Clean Price (บาทต่อหน่วย)
  faceValue: number; // ราคาพาร์ (บาท)
  annualCouponRatePercent: number; // ดอกเบี้ยหน้าตั๋ว %
  daysSinceLastCoupon: number; // จำนวนวันนับจากวันจ่ายดอกเบี้ยงวดล่าสุด
  daysInCouponPeriod: number; // จำนวนวันรวมในรอบคูปอง (เช่น 180 หรือ 365 วัน)
}

export interface CleanDirtyPriceResult {
  accruedInterest: number; // ดอกเบี้ยค้างรับต่อหน่วย
  dirtyPrice: number; // ราคา Dirty Price ที่ต้องชำระจริงต่อหน่วย
  accruedInterestPercentOfPar: number;
}

export function calculateCleanDirtyPrice(input: CleanDirtyPriceInput): CleanDirtyPriceResult {
  const clean = Math.max(0, input.cleanPrice);
  const par = Math.max(1, input.faceValue);
  const couponRate = Math.max(0, input.annualCouponRatePercent) / 100;
  const daysElapsed = Math.max(0, input.daysSinceLastCoupon);
  const totalDays = Math.max(1, input.daysInCouponPeriod);

  // ดอกเบี้ยทั้งปีตามพาร์
  const annualCoupon = par * couponRate;
  // ดอกเบี้ยค้างรับ = Annual Coupon * (daysElapsed / 365) หรือตามงวด
  const accruedInterest = annualCoupon * (daysElapsed / 365);
  const dirtyPrice = clean + accruedInterest;

  return {
    accruedInterest: Number(accruedInterest.toFixed(3)),
    dirtyPrice: Number(dirtyPrice.toFixed(3)),
    accruedInterestPercentOfPar: Number(((accruedInterest / par) * 100).toFixed(3)),
  };
}
