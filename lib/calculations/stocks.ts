// 1. Dividend Calculator (จากระบบเดิม อัปเกรดให้คำนวณครบถ้วน)
export interface DividendInput {
  portfolioValue: number; // มูลค่าพอร์ตลงทุน
  dividendYieldPercent: number; // อัตราปันผลต่อปี %
  taxRatePercent: number; // ภาษีหัก ณ ที่จ่าย % (ตั้งต้น 10%)
}

export interface DividendResult {
  grossAnnual: number;
  taxAnnual: number;
  netAnnual: number;
  netMonthly: number;
  netDaily: number;
  netYieldPercent: number;
}

export function calculateDividend(input: DividendInput): DividendResult {
  const portfolio = Math.max(0, input.portfolioValue);
  const yieldPct = Math.max(0, input.dividendYieldPercent);
  const taxPct = Math.max(0, Math.min(100, input.taxRatePercent));

  const grossAnnual = portfolio * (yieldPct / 100);
  const taxAnnual = grossAnnual * (taxPct / 100);
  const netAnnual = grossAnnual - taxAnnual;
  const netMonthly = netAnnual / 12;
  const netDaily = netAnnual / 365;
  const netYield = yieldPct * (1 - taxPct / 100);

  return {
    grossAnnual: Math.round(grossAnnual),
    taxAnnual: Math.round(taxAnnual),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netMonthly),
    netDaily: Math.round(netDaily),
    netYieldPercent: Number(netYield.toFixed(2)),
  };
}

// 2. Valuation Ratios: P/E, P/BV, PEG, ROE
export interface ValuationRatiosInput {
  stockPrice: number; // ราคาหุ้นปัจจุบัน
  eps: number; // กำไรต่อหุ้น (EPS)
  bookValuePerShare: number; // มูลค่าทางบัญชีต่อหุ้น (BVPS)
  earningsGrowthRatePercent: number; // อัตราการเติบโตกำไร %
  dividendPerShare: number; // ปันผลต่อหุ้น
}

export interface ValuationRatiosResult {
  peRatio: number;
  pbvRatio: number;
  pegRatio: number;
  dividendYieldPercent: number;
  roeEstimatePercent: number; // ROE ≈ (P/BV) / (P/E) * 100
  valuationSummaryTh: string;
}

export function calculateValuationRatios(input: ValuationRatiosInput): ValuationRatiosResult {
  const price = Math.max(0, input.stockPrice);
  const eps = input.eps;
  const bvps = input.bookValuePerShare;
  const growth = input.earningsGrowthRatePercent;
  const dps = Math.max(0, input.dividendPerShare);

  const pe = eps > 0 ? price / eps : 0;
  const pbv = bvps > 0 ? price / bvps : 0;
  const peg = growth > 0 && pe > 0 ? pe / growth : 0;
  const divYield = price > 0 ? (dps / price) * 100 : 0;
  // ความสัมพันธ์ ROE = EPS / BVPS = (P/BV) / (P/E)
  const roe = bvps > 0 && eps > 0 ? (eps / bvps) * 100 : 0;

  let summary = '';
  if (pe <= 0) {
    summary = 'บริษัทมีผลประกอบการขาดทุน (ไม่สามารถคำนวณ P/E ได้)';
  } else if (peg > 0 && peg < 1.0) {
    summary = 'PEG ต่ำกว่า 1.0 สะท้อนว่าราคาหุ้นยังไม่แพงเมื่อเทียบกับอัตราการเติบโตของกำไร';
  } else if (peg >= 1.0 && peg <= 1.5) {
    summary = 'ราคาซื้อขายอยู่ในระดับมูลค่าที่เหมาะสมตามการเติบโต';
  } else if (peg > 1.5) {
    summary = 'PEG สูงกว่า 1.5 ตลาดให้พรีเมียมสูงหรือราคาอาจเริ่มตึงตัว';
  } else {
    summary = `P/E อยู่ที่ ${pe.toFixed(1)} เท่า และ P/BV อยู่ที่ ${pbv.toFixed(1)} เท่า`;
  }

  return {
    peRatio: Number(pe.toFixed(2)),
    pbvRatio: Number(pbv.toFixed(2)),
    pegRatio: Number(peg.toFixed(2)),
    dividendYieldPercent: Number(divYield.toFixed(2)),
    roeEstimatePercent: Number(roe.toFixed(2)),
    valuationSummaryTh: summary,
  };
}

// 3. Stock Trade PnL & Break-even Calculator (รวมค่าคอมมิชชั่นไทย + VAT 7%)
export interface StockTradeInput {
  buyPrice: number; // ราคาซื้อต่อหุ้น
  sellPrice: number; // ราคาขายต่อหุ้น
  shares: number; // จำนวนหุ้น
  commissionRatePercent: number; // ค่าคอมมิชชัน % (ปกติ 0.157% Cash Balance)
  includeVat: boolean; // คิด VAT 7% เพิ่มจากค่าคอม (ปกติ true)
}

export interface StockTradeResult {
  buyAmountGross: number; // ยอดซื้อหุ้นเพียวๆ
  buyCommission: number;
  buyVat: number;
  totalCost: number; // ต้นทุนรวมที่จ่ายจริง

  sellAmountGross: number; // ยอดขายหุ้นเพียวๆ
  sellCommission: number;
  sellVat: number;
  netProceeds: number; // เงินที่ได้รับสุทธิหลังหักค่าธรรมเนียม

  netProfitAmount: number; // กำไร/ขาดทุนสุทธิ
  netProfitPercent: number; // % กำไรสุทธิเทียบต้นทุนรวม
  breakEvenSellPrice: number; // ราคาขายต่อหุ้นขั้นต่ำที่เท่าทุนพอดี
  totalFeesPaid: number; // ค่าธรรมเนียมรวมทั้งหมดทั้งซื้อและขาย
}

export function calculateStockTrade(input: StockTradeInput): StockTradeResult {
  const buyPrice = Math.max(0, input.buyPrice);
  const sellPrice = Math.max(0, input.sellPrice);
  const shares = Math.max(1, input.shares);
  const commRate = Math.max(0, input.commissionRatePercent) / 100;
  const vatMultiplier = input.includeVat ? 1.07 : 1.0;

  // ฝั่งซื้อ
  const buyGross = buyPrice * shares;
  const buyCommRaw = buyGross * commRate;
  const buyVat = input.includeVat ? buyCommRaw * 0.07 : 0;
  const buyCommTotal = buyCommRaw + buyVat;
  const totalCost = buyGross + buyCommTotal;

  // ฝั่งขาย
  const sellGross = sellPrice * shares;
  const sellCommRaw = sellGross * commRate;
  const sellVat = input.includeVat ? sellCommRaw * 0.07 : 0;
  const sellCommTotal = sellCommRaw + sellVat;
  const netProceeds = sellGross - sellCommTotal;

  const netProfit = netProceeds - totalCost;
  const netProfitPct = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const totalFees = buyCommTotal + sellCommTotal;

  // คำนวณจุดคุ้มทุน Break-even:
  // netProceeds = sellPrice * shares * (1 - commRate * vatMultiplier) = totalCost
  const effectiveSellFactor = 1 - commRate * vatMultiplier;
  const breakEvenPrice = effectiveSellFactor > 0 ? totalCost / (shares * effectiveSellFactor) : 0;

  return {
    buyAmountGross: Math.round(buyGross),
    buyCommission: Math.round(buyCommRaw),
    buyVat: Math.round(buyVat),
    totalCost: Math.round(totalCost),

    sellAmountGross: Math.round(sellGross),
    sellCommission: Math.round(sellCommRaw),
    sellVat: Math.round(sellVat),
    netProceeds: Math.round(netProceeds),

    netProfitAmount: Math.round(netProfit),
    netProfitPercent: Number(netProfitPct.toFixed(2)),
    breakEvenSellPrice: Number(breakEvenPrice.toFixed(3)),
    totalFeesPaid: Math.round(totalFees),
  };
}

// 4. Fair Value (Gordon Growth DDM & Target P/E)
export interface FairValueInput {
  currentDividend: number; // เงินปันผลต่อหุ้นปัจจุบัน (D0)
  expectedDividendGrowthPercent: number; // อัตราการเติบโตปันผลระยะยาว % (g)
  requiredReturnPercent: number; // อัตราผลตอบแทนที่นักลงทุนต้องการ % (k)
  forwardEps: number; // กำไรต่อหุ้นคาดการณ์ปีหน้า
  targetPeRatio: number; // ค่า P/E ที่เหมาะสม
}

export interface FairValueResult {
  ddmFairValue: number;
  peFairValue: number;
  averageFairValue: number;
  marginOfSafety20Percent: number; // ราคาเผื่อส่วนเผื่อความปลอดภัย 20%
  isDdmValid: boolean;
  notesTh: string;
}

export function calculateFairValue(input: FairValueInput): FairValueResult {
  const d0 = Math.max(0, input.currentDividend);
  const g = input.expectedDividendGrowthPercent / 100;
  const k = input.requiredReturnPercent / 100;
  const forwardEps = Math.max(0, input.forwardEps);
  const targetPe = Math.max(0, input.targetPeRatio);

  let ddmValue = 0;
  let isDdmValid = false;
  let notes = '';

  if (k > g && d0 > 0) {
    const d1 = d0 * (1 + g);
    ddmValue = d1 / (k - g);
    isDdmValid = true;
    notes = 'แบบจำลอง DDM สมบูรณ์: ผลตอบแทนที่ต้องการสูงกว่าอัตราการเติบโต';
  } else if (d0 <= 0) {
    notes = 'หุ้นไม่ได้จ่ายเงินปันผล ไม่สามารถใช้ DDM ได้ ให้ดู Target P/E เป็นหลัก';
  } else {
    notes = 'ข้อควรระวัง: อัตราการเติบโต (g) สูงกว่าหรือเท่ากับผลตอบแทนที่ต้องการ (k) สูตร DDM ไม่สามารถคำนวณได้';
  }

  const peValue = forwardEps * targetPe;
  let avgValue = 0;
  if (isDdmValid && peValue > 0) {
    avgValue = (ddmValue + peValue) / 2;
  } else if (peValue > 0) {
    avgValue = peValue;
  } else {
    avgValue = ddmValue;
  }

  return {
    ddmFairValue: Number(ddmValue.toFixed(2)),
    peFairValue: Number(peValue.toFixed(2)),
    averageFairValue: Number(avgValue.toFixed(2)),
    marginOfSafety20Percent: Number((avgValue * 0.8).toFixed(2)),
    isDdmValid,
    notesTh: notes,
  };
}
