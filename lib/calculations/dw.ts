// 1. DW Moneyness, Intrinsic Value & Break-even
export type DwType = 'CALL' | 'PUT';

export interface DwCalculatorInput {
  dwType: DwType;
  underlyingPrice: number; // ราคาหุ้นแม่ปัจจุบัน
  exercisePrice: number; // ราคาใช้สิทธิ (Exercise Price)
  dwPrice: number; // ราคา DW ปัจจุบัน (บาท)
  conversionRatio: number; // อัตราการใช้สิทธิ (เช่น 5 : 1 หมายถึง 0.2 หรือใส่ 5 DW ต่อ 1 หุ้น)
  effectiveGearing: number; // อัตราทด (Effective Gearing จากตารางผู้ออก)
  sensitivity: number; // Sensitivity (ราคา DW ขยับกี่ช่องต่อหุ้นแม่ 1 ช่อง)
}

export interface DwCalculatorResult {
  moneynessStatus: 'ITM' | 'ATM' | 'OTM';
  moneynessPercent: number;
  intrinsicValue: number; // มูลค่าที่แท้จริง
  timeValue: number; // มูลค่าทางเวลา
  breakEvenUnderlyingPrice: number; // ราคาหุ้นแม่ที่จุดคุ้มทุน
  priceChange1PctUnderlying: number; // การเปลี่ยนแปลงราคา DW โดยประมาณเมื่อหุ้นแม่เปลี่ยน 1%
  summaryTh: string;
}

export function calculateDw(input: DwCalculatorInput): DwCalculatorResult {
  const s = Math.max(0, input.underlyingPrice);
  const x = Math.max(0, input.exercisePrice);
  const dwPrice = Math.max(0.01, input.dwPrice);
  // อัตราการแปลง (Conversion Ratio): เช่น 0.1 หรือ 1:10
  const ratio = Math.max(0.0001, input.conversionRatio);
  const gearing = Math.max(0.1, input.effectiveGearing);

  let intrinsic = 0;
  let moneynessPct = 0;
  let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
  let breakEven = 0;

  if (input.dwType === 'CALL') {
    intrinsic = Math.max(0, (s - x) * ratio);
    moneynessPct = x > 0 ? ((s - x) / x) * 100 : 0;
    // Call Break-even = Exercise Price + (DW Price / Ratio)
    breakEven = x + (dwPrice / ratio);

    if (s > x * 1.005) moneyness = 'ITM';
    else if (s < x * 0.995) moneyness = 'OTM';
    else moneyness = 'ATM';
  } else {
    // PUT
    intrinsic = Math.max(0, (x - s) * ratio);
    moneynessPct = x > 0 ? ((x - s) / x) * 100 : 0;
    // Put Break-even = Exercise Price - (DW Price / Ratio)
    breakEven = Math.max(0, x - (dwPrice / ratio));

    if (s < x * 0.995) moneyness = 'ITM';
    else if (s > x * 1.005) moneyness = 'OTM';
    else moneyness = 'ATM';
  }

  const timeValue = Math.max(0, dwPrice - intrinsic);
  const dwChangePercent = gearing * 1.0; // 1% change

  let summary = '';
  if (moneyness === 'ITM') {
    summary = `สถานะ In-the-Money ${Math.abs(moneynessPct).toFixed(1)}% มีมูลค่าแท้จริง ${intrinsic.toFixed(3)} บาท`;
  } else if (moneyness === 'OTM') {
    summary = `สถานะ Out-of-the-Money ${Math.abs(moneynessPct).toFixed(1)}% ราคาประกอบด้วยมูลค่าทางเวลาล้วนๆ หากหมดอายุจะกลายเป็น 0`;
  } else {
    summary = 'สถานะ At-the-Money ราคาหุ้นแม่อยู่ใกล้เคียงกับราคาใช้สิทธิ';
  }

  return {
    moneynessStatus: moneyness,
    moneynessPercent: Number(moneynessPct.toFixed(2)),
    intrinsicValue: Number(intrinsic.toFixed(3)),
    timeValue: Number(timeValue.toFixed(3)),
    breakEvenUnderlyingPrice: Number(breakEven.toFixed(2)),
    priceChange1PctUnderlying: Number(dwChangePercent.toFixed(2)),
    summaryTh: summary,
  };
}

// 2. DW Time Decay Estimator
export interface DwTimeDecayInput {
  dwPrice: number; // ราคา DW ปัจจุบัน (บาท)
  holdingQuantity: number; // จำนวนหน่วย DW ที่ถือครอง
  timeDecayPercentPerDay: number; // อัตรา Time Decay ต่อวัน % (เช่น 1.5% - 3%)
  holdingDays: number; // จำนวนวันที่วางแผนจะถือครอง (วัน)
}

export interface DwTimeDecayResult {
  currentTotalValue: number;
  estimatedDwPriceAfterDays: number;
  totalLossAmount: number;
  totalLossPercent: number;
  dailyCostAmount: number;
}

export function calculateDwTimeDecay(input: DwTimeDecayInput): DwTimeDecayResult {
  const price = Math.max(0.01, input.dwPrice);
  const qty = Math.max(1, input.holdingQuantity);
  const decayRate = Math.max(0, input.timeDecayPercentPerDay) / 100;
  const days = Math.max(1, input.holdingDays);

  const initialTotal = price * qty;
  // มูลค่าลดลงทบต้นรายวัน: Price * (1 - decay)^days
  const priceAfter = price * Math.pow(1 - decayRate, days);
  const finalTotal = priceAfter * qty;
  const loss = Math.max(0, initialTotal - finalTotal);
  const lossPct = initialTotal > 0 ? (loss / initialTotal) * 100 : 0;
  const dailyCost = loss / days;

  return {
    currentTotalValue: Math.round(initialTotal),
    estimatedDwPriceAfterDays: Number(priceAfter.toFixed(3)),
    totalLossAmount: Math.round(loss),
    totalLossPercent: Number(lossPct.toFixed(1)),
    dailyCostAmount: Math.round(dailyCost),
  };
}
