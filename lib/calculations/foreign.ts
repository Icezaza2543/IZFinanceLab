// 1. Currency FX Impact Calculator
export interface FxImpactInput {
  initialInvestmentThb: number; // เงินลงทุนเริ่มต้น (บาท)
  exchangeRateBuy: number; // อัตราแลกเปลี่ยน ณ วันซื้อ (เช่น 35.00 THB/USD)
  exchangeRateSell: number; // อัตราแลกเปลี่ยน ณ วันขาย (เช่น 33.50 หรือ 36.50 THB/USD)
  foreignAssetReturnPercent: number; // ผลตอบแทนของสินทรัพย์ต่างประเทศในสกุลเดิม % (เช่น หุ้นขึ้น +15%)
}

export interface FxImpactResult {
  initialForeignCurrency: number; // ยอดเงินสกุลต่างประเทศเริ่มต้น
  finalForeignCurrency: number; // ยอดเงินสกุลต่างประเทศปลายทาง
  finalThbProceeds: number; // เงินบาทที่ได้รับหลังแปลงกลับ
  netProfitThb: number; // กำไร/ขาดทุนสุทธิในเงินบาท
  totalReturnThbPercent: number; // ผลตอบแทนรวมสุทธิ %
  fxReturnPercent: number; // ผลตอบแทนเฉพาะค่าเงิน %
  assetGainContributionThb: number; // กำไรจากตัวหุ้น
  fxGainContributionThb: number; // กำไร/ขาดทุนจากค่าเงิน
}

export function calculateFxImpact(input: FxImpactInput): FxImpactResult {
  const initialThb = Math.max(0, input.initialInvestmentThb);
  const fxBuy = Math.max(0.1, input.exchangeRateBuy);
  const fxSell = Math.max(0.1, input.exchangeRateSell);
  const assetReturn = input.foreignAssetReturnPercent / 100;

  const initialForeign = initialThb / fxBuy;
  const finalForeign = initialForeign * (1 + assetReturn);
  const finalThb = finalForeign * fxSell;

  const netProfitThb = finalThb - initialThb;
  const totalReturnPct = initialThb > 0 ? (netProfitThb / initialThb) * 100 : 0;
  const fxReturnPct = ((fxSell - fxBuy) / fxBuy) * 100;

  // แยกส่วน: กำไรจากหุ้นเพียวๆ แปลงด้วยเรทซื้อ
  const pureAssetProfitThb = (finalForeign - initialForeign) * fxBuy;
  // ส่วนที่มาจากค่าเงิน
  const fxContribution = netProfitThb - pureAssetProfitThb;

  return {
    initialForeignCurrency: Number(initialForeign.toFixed(2)),
    finalForeignCurrency: Number(finalForeign.toFixed(2)),
    finalThbProceeds: Math.round(finalThb),
    netProfitThb: Math.round(netProfitThb),
    totalReturnThbPercent: Number(totalReturnPct.toFixed(2)),
    fxReturnPercent: Number(fxReturnPct.toFixed(2)),
    assetGainContributionThb: Math.round(pureAssetProfitThb),
    fxGainContributionThb: Math.round(fxContribution),
  };
}

// 2. Foreign-Sourced Income Tax (เกณฑ์ภาษีสรรพากรนำเงินกลับไทย ป.161/2566)
export interface ForeignTaxInput {
  foreignProfitBroughtToThai: number; // กำไรจากการลงทุนต่างประเทศที่นำกลับเข้าไทยในปีภาษี (บาท)
  otherThaiTaxableIncome: number; // เงินได้พึงประเมินในไทยอื่นๆ ทั้งปี (บาท)
  foreignTaxPaidAlready: number; // ภาษีที่จ่ายในต่างประเทศไปแล้ว (สำหรับเครดิตภาษีซ้ำซ้อน)
}

export interface ForeignTaxResult {
  taxBracketPercent: number;
  taxWithoutForeignIncome: number;
  taxWithForeignIncome: number;
  additionalTaxPayable: number;
  taxCreditAllowed: number;
  finalNetTaxToPay: number;
  effectiveTaxRateOnForeignProfitPercent: number;
}

// ตารางภาษีเงินได้บุคคลธรรมดาไทย 2567+
const THAI_TAX_BRACKETS = [
  { min: 0, max: 150000, rate: 0 },
  { min: 150000, max: 300000, rate: 0.05 },
  { min: 300000, max: 500000, rate: 0.10 },
  { min: 500000, max: 750000, rate: 0.15 },
  { min: 750000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: 2000000, rate: 0.25 },
  { min: 2000000, max: 5000000, rate: 0.30 },
  { min: 5000000, max: Infinity, rate: 0.35 },
];

function computePersonalIncomeTax(taxableIncome: number): number {
  let tax = 0;
  for (const bracket of THAI_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
  }
  return tax;
}

export function calculateForeignTax(input: ForeignTaxInput): ForeignTaxResult {
  const foreignProfit = Math.max(0, input.foreignProfitBroughtToThai);
  const otherIncome = Math.max(0, input.otherThaiTaxableIncome);
  const foreignTaxPaid = Math.max(0, input.foreignTaxPaidAlready);

  // หักค่าลดหย่อนพื้นฐานส่วนตัว 60,000 + ค่าใช้จ่าย 50% สูงสุด 100,000 = 160,000 บาท
  const baseDeduction = 160000;
  const taxableBaseWithout = Math.max(0, otherIncome - baseDeduction);
  const taxableBaseWith = Math.max(0, otherIncome + foreignProfit - baseDeduction);

  const taxWithout = computePersonalIncomeTax(taxableBaseWithout);
  const taxWith = computePersonalIncomeTax(taxableBaseWith);
  const additionalTax = Math.max(0, taxWith - taxWithout);

  // เครดิตภาษีต่างประเทศหักได้ไม่เกินภาษีส่วนที่เพิ่มขึ้น
  const taxCredit = Math.min(foreignTaxPaid, additionalTax);
  const netTax = Math.max(0, additionalTax - taxCredit);

  // อัตราภาษีส่วนเพิ่มสูงสุด
  let topBracketRate = 0;
  for (const b of THAI_TAX_BRACKETS) {
    if (taxableBaseWith > b.min) topBracketRate = b.rate * 100;
  }

  const effectiveRate = foreignProfit > 0 ? (netTax / foreignProfit) * 100 : 0;

  return {
    taxBracketPercent: topBracketRate,
    taxWithoutForeignIncome: Math.round(taxWithout),
    taxWithForeignIncome: Math.round(taxWith),
    additionalTaxPayable: Math.round(additionalTax),
    taxCreditAllowed: Math.round(taxCredit),
    finalNetTaxToPay: Math.round(netTax),
    effectiveTaxRateOnForeignProfitPercent: Number(effectiveRate.toFixed(2)),
  };
}

// 3. US Stock Trade & W-8BEN Dividend Tax
export interface UsStockFeeInput {
  investmentUsd: number; // เงินลงทุน (USD)
  annualDividendYieldPercent: number; // อัตราเงินปันผล %
  tradeCommissionPerOrderUsd: number; // ค่าคอมมิชชันต่อออเดอร์ (เช่น 1 USD หรือ 0.1%)
  withholdingTaxRatePercent: number; // ภาษีหัก ณ ที่จ่าย (W-8BEN = 15%, ไม่มี = 30%)
}

export interface UsStockFeeResult {
  grossAnnualDividendUsd: number;
  withholdingTaxUsd: number;
  netAnnualDividendUsd: number;
  effectiveNetDividendYieldPercent: number;
  roundTripTradeCommissionUsd: number;
}

export function calculateUsStockFee(input: UsStockFeeInput): UsStockFeeResult {
  const principal = Math.max(0, input.investmentUsd);
  const divYield = Math.max(0, input.annualDividendYieldPercent) / 100;
  const taxRate = Math.max(0, Math.min(100, input.withholdingTaxRatePercent)) / 100;
  const comm = Math.max(0, input.tradeCommissionPerOrderUsd);

  const grossDiv = principal * divYield;
  const tax = grossDiv * taxRate;
  const netDiv = grossDiv - tax;
  const netYield = input.annualDividendYieldPercent * (1 - taxRate);

  return {
    grossAnnualDividendUsd: Number(grossDiv.toFixed(2)),
    withholdingTaxUsd: Number(tax.toFixed(2)),
    netAnnualDividendUsd: Number(netDiv.toFixed(2)),
    effectiveNetDividendYieldPercent: Number(netYield.toFixed(2)),
    roundTripTradeCommissionUsd: Number((comm * 2).toFixed(2)),
  };
}
