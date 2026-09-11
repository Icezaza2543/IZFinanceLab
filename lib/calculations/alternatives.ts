// 1. Thai Gold Bullion Calculator (ทองคำแท่งไทย 96.5%)
export interface GoldBullionInput {
  goldBahtWeight: number; // น้ำหนักกี่บาททอง (เช่น 1, 2, 5, 10 บาททอง)
  buyPricePerBaht: number; // ราคาซื้อขายตามประกาศสมาคม ณ วันซื้อ (บาท)
  blockFeeTotal: number; // ค่าบล็อก/ค่ากำเหน็จรวม (บาท เช่น 100 - 300 บ.)
  currentSellPricePerBaht: number; // ราคารับซื้อคืนของสมาคม ณ วันขาย (บาท)
}

export interface GoldBullionResult {
  totalCost: number; // ต้นทุนรวมที่จ่ายจริง (ราคาทอง + ค่าบล็อก)
  breakEvenSellPricePerBaht: number; // ราคาขายต่อบาททองที่คืนทุนพอดี
  grossProceeds: number; // เงินที่ได้รับจากการขายคืน
  netProfitAmount: number; // กำไร/ขาดทุนสุทธิ
  netProfitPercent: number; // % กำไร
  weightInGrams: number; // น้ำหนักแปลงเป็นกรัม (1 บาททอง = 15.244 กรัม)
}

export function calculateGoldBullion(input: GoldBullionInput): GoldBullionResult {
  const weight = Math.max(0.1, input.goldBahtWeight);
  const buyPrice = Math.max(0, input.buyPricePerBaht);
  const blockFee = Math.max(0, input.blockFeeTotal);
  const sellPrice = Math.max(0, input.currentSellPricePerBaht);

  const goldCostRaw = buyPrice * weight;
  const totalCost = goldCostRaw + blockFee;

  const grossProceeds = sellPrice * weight;
  const netProfit = grossProceeds - totalCost;
  const netProfitPct = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  // จุดคุ้มทุนต่อบาททอง
  const breakEvenPrice = totalCost / weight;
  const grams = weight * 15.244;

  return {
    totalCost: Math.round(totalCost),
    breakEvenSellPricePerBaht: Number(breakEvenPrice.toFixed(1)),
    grossProceeds: Math.round(grossProceeds),
    netProfitAmount: Math.round(netProfit),
    netProfitPercent: Number(netProfitPct.toFixed(2)),
    weightInGrams: Number(grams.toFixed(2)),
  };
}

// 2. Real Estate Rental Yield & Cash-on-Cash Return
export interface RentalYieldInput {
  propertyPurchasePrice: number; // ราคาซื้ออสังหาฯ (บาท)
  renovationAndTransferCosts: number; // ค่าโอน ตกแต่ง ซ่อมแซม (บาท)
  monthlyRentalIncome: number; // ค่าเช่าคาดว่าจะได้รับต่อเดือน (บาท)
  vacancyMonthsPerYear: number; // เผื่อห้องว่างกี่เดือนต่อปี (เช่น 1 เดือน)
  annualCommonFeeAndMaintenance: number; // ค่าส่วนกลาง ค่าซ่อมแซมต่อปี (บาท)
  annualPropertyTax: number; // ภาษีที่ดินและสิ่งปลูกสร้างต่อปี (บาท)
  // ส่วนของการกู้เงิน (Financing)
  downPaymentAmount: number; // เงินดาวน์ที่จ่ายสด (บาท)
  monthlyMortgagePayment: number; // ค่างวดผ่อนธนาคารต่อเดือน (บาท)
}

export interface RentalYieldResult {
  grossRentalYieldPercent: number;
  netRentalYieldPercent: number;
  cashOnCashReturnPercent: number;
  annualGrossRentalIncome: number;
  annualNetOperatingIncome: number;
  annualCashFlowAfterDebt: number;
  totalCashInvested: number;
}

export function calculateRentalYield(input: RentalYieldInput): RentalYieldResult {
  const purchasePrice = Math.max(1, input.propertyPurchasePrice);
  const upfrontCosts = Math.max(0, input.renovationAndTransferCosts);
  const totalPropertyCost = purchasePrice + upfrontCosts;

  const monthlyRent = Math.max(0, input.monthlyRentalIncome);
  const vacancyMonths = Math.max(0, Math.min(12, input.vacancyMonthsPerYear));
  const activeMonths = Math.max(0, 12 - vacancyMonths);

  const annualGrossRent = monthlyRent * activeMonths;
  const annualExpenses = Math.max(0, input.annualCommonFeeAndMaintenance) + Math.max(0, input.annualPropertyTax);
  const netOperatingIncome = Math.max(0, annualGrossRent - annualExpenses);

  const grossYield = (annualGrossRent / totalPropertyCost) * 100;
  const netYield = (netOperatingIncome / totalPropertyCost) * 100;

  // Cash on Cash Return:
  // เงินสดลงทุนจริง = เงินดาวน์ + ค่าโอน/ตกแต่ง
  const downPayment = Math.max(0, input.downPaymentAmount || purchasePrice);
  const totalCashInvested = downPayment + upfrontCosts;

  const annualMortgage = Math.max(0, input.monthlyMortgagePayment) * 12;
  const netCashFlowAfterDebt = netOperatingIncome - annualMortgage;
  const cashOnCash = totalCashInvested > 0 ? (netCashFlowAfterDebt / totalCashInvested) * 100 : 0;

  return {
    grossRentalYieldPercent: Number(grossYield.toFixed(2)),
    netRentalYieldPercent: Number(netYield.toFixed(2)),
    cashOnCashReturnPercent: Number(cashOnCash.toFixed(2)),
    annualGrossRentalIncome: Math.round(annualGrossRent),
    annualNetOperatingIncome: Math.round(netOperatingIncome),
    annualCashFlowAfterDebt: Math.round(netCashFlowAfterDebt),
    totalCashInvested: Math.round(totalCashInvested),
  };
}

// 3. Crypto PnL & Fee Calculator
export interface CryptoTradeInput {
  coinBuyPrice: number; // ราคาเหรียญตอนซื้อ (บาท หรือ USD)
  coinSellPrice: number; // ราคาเหรียญตอนขาย
  coinQuantity: number; // จำนวนเหรียญที่เทรด
  exchangeFeePercent: number; // ค่าธรรมเนียมเทรดของกระดาน % (เช่น 0.25%)
  networkGasFee: number; // ค่าโอน Gas / Network fee (หน่วยเดียวกับราคา)
}

export interface CryptoTradeResult {
  buyAmountGross: number;
  buyFee: number;
  totalCost: number;

  sellAmountGross: number;
  sellFee: number;
  netProceeds: number;

  netProfitAmount: number;
  netProfitPercent: number;
  breakEvenSellPrice: number;
  totalFeesPaid: number;
}

export function calculateCryptoTrade(input: CryptoTradeInput): CryptoTradeResult {
  const buyPrice = Math.max(0, input.coinBuyPrice);
  const sellPrice = Math.max(0, input.coinSellPrice);
  const qty = Math.max(0.000001, input.coinQuantity);
  const feeRate = Math.max(0, input.exchangeFeePercent) / 100;
  const gasFee = Math.max(0, input.networkGasFee);

  const buyGross = buyPrice * qty;
  const buyFee = buyGross * feeRate;
  const totalCost = buyGross + buyFee + gasFee;

  const sellGross = sellPrice * qty;
  const sellFee = sellGross * feeRate;
  const netProceeds = sellGross - sellFee;

  const netProfit = netProceeds - totalCost;
  const netProfitPct = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const totalFees = buyFee + sellFee + gasFee;

  // จุดคุ้มทุน: sellPrice * qty * (1 - feeRate) = totalCost
  const breakEven = (1 - feeRate) > 0 ? totalCost / (qty * (1 - feeRate)) : 0;

  return {
    buyAmountGross: Number(buyGross.toFixed(2)),
    buyFee: Number(buyFee.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),

    sellAmountGross: Number(sellGross.toFixed(2)),
    sellFee: Number(sellFee.toFixed(2)),
    netProceeds: Number(netProceeds.toFixed(2)),

    netProfitAmount: Number(netProfit.toFixed(2)),
    netProfitPercent: Number(netProfitPct.toFixed(2)),
    breakEvenSellPrice: Number(breakEven.toFixed(2)),
    totalFeesPaid: Number(totalFees.toFixed(2)),
  };
}
