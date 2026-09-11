// 1. TFEX Futures Profit & Loss Calculator (SET50 / Gold)
export type TfexInstrumentType = 'SET50' | 'GOLD_ONLINE' | 'GOLD_50' | 'CUSTOM';

export interface TfexInstrumentPreset {
  name: string;
  multiplier: number; // บาทต่อจุด
  typicalIm: number; // Initial Margin ปกติต่อสัญญา (บาท)
  typicalMm: number; // Maintenance Margin ปกติต่อสัญญา
  tickSize: number; // ขนาดการขยับขั้นต่ำ
}

export const TFEX_PRESETS: Record<TfexInstrumentType, TfexInstrumentPreset> = {
  SET50: {
    name: 'SET50 Index Futures',
    multiplier: 200, // 1 จุด = 200 บาท
    typicalIm: 7525,
    typicalMm: 5290,
    tickSize: 0.1,
  },
  GOLD_ONLINE: {
    name: 'Gold Online Futures (GO)',
    multiplier: 300, // 1 USD = 300 บาท (ไม่มีความเสี่ยงค่าเงิน)
    typicalIm: 25200,
    typicalMm: 17715,
    tickSize: 0.1,
  },
  GOLD_50: {
    name: '50 Baht Gold Futures (GF)',
    multiplier: 50, // 1 บาททองคำ × 50
    typicalIm: 54950,
    typicalMm: 38630,
    tickSize: 10,
  },
  CUSTOM: {
    name: 'กำหนดเอง (Custom)',
    multiplier: 200,
    typicalIm: 8000,
    typicalMm: 5600,
    tickSize: 0.1,
  },
};

export interface TfexPnlInput {
  instrumentType: TfexInstrumentType;
  position: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  contracts: number;
  customMultiplier?: number;
  commissionPerContract: number; // ค่าคอมมิชชันต่อสัญญา
}

export interface TfexPnlResult {
  pointDifference: number;
  multiplier: number;
  grossPnl: number;
  totalCommission: number;
  netPnl: number;
  returnOnMarginPercent: number; // ผลตอบแทนเทียบกับ Initial Margin
  isProfit: boolean;
}

export function calculateTfexPnl(input: TfexPnlInput): TfexPnlResult {
  const preset = TFEX_PRESETS[input.instrumentType];
  const multiplier = input.instrumentType === 'CUSTOM' && input.customMultiplier ? input.customMultiplier : preset.multiplier;
  const contracts = Math.max(1, input.contracts);
  const entry = Math.max(0, input.entryPrice);
  const exit = Math.max(0, input.exitPrice);
  const comm = Math.max(0, input.commissionPerContract);

  let pointDiff = 0;
  if (input.position === 'LONG') {
    pointDiff = exit - entry;
  } else {
    pointDiff = entry - exit;
  }

  const grossPnl = pointDiff * multiplier * contracts;
  // ค่าคอมมิชชันรวม (ทั้งเปิดและปิดสถานะ = 2 ขา) + VAT 7%
  const totalCommission = comm * 2 * contracts * 1.07;
  const netPnl = grossPnl - totalCommission;

  const totalImRequired = preset.typicalIm * contracts;
  const returnOnMargin = totalImRequired > 0 ? (netPnl / totalImRequired) * 100 : 0;

  return {
    pointDifference: Number(pointDiff.toFixed(2)),
    multiplier,
    grossPnl: Math.round(grossPnl),
    totalCommission: Math.round(totalCommission),
    netPnl: Math.round(netPnl),
    returnOnMarginPercent: Number(returnOnMargin.toFixed(2)),
    isProfit: netPnl >= 0,
  };
}

// 2. TFEX Margin & Risk Management (Margin Call / Force Close)
export interface TfexMarginInput {
  equityBalance: number; // มูลค่าเงินในพอร์ตปัจจุบัน (Equity)
  contracts: number; // จำนวนสัญญาที่ถือครอง
  initialMarginPerContract: number; // IM ต่อสัญญา
  maintenanceMarginPerContract: number; // MM ต่อสัญญา
  multiplier: number; // ตัวคูณดัชนี (เช่น 200)
  position: 'LONG' | 'SHORT';
  entryPrice: number;
}

export interface TfexMarginResult {
  totalImRequired: number;
  totalMmRequired: number;
  totalForceCloseRequired: number; // FM ~ 30% of IM
  marginCallPointsBuffer: number; // ดัชนีวิ่งผิดทางได้กี่จุดก่อนโดน Margin Call
  forceClosePointsBuffer: number; // ดัชนีวิ่งผิดทางได้กี่จุดก่อนโดน Force Close
  marginCallPriceLevel: number; // ราคาดัชนีที่จะโดน Margin Call
  forceClosePriceLevel: number; // ราคาดัชนีที่จะโดน Force Close
  statusTh: string;
  statusVariant: 'safe' | 'warning' | 'danger';
}

export function calculateTfexMargin(input: TfexMarginInput): TfexMarginResult {
  const equity = Math.max(0, input.equityBalance);
  const contracts = Math.max(1, input.contracts);
  const im = Math.max(100, input.initialMarginPerContract);
  const mm = Math.max(50, input.maintenanceMarginPerContract || im * 0.7);
  const multiplier = Math.max(1, input.multiplier);
  const entry = Math.max(0, input.entryPrice);

  const totalIm = im * contracts;
  const totalMm = mm * contracts;
  const totalFm = im * 0.3 * contracts;

  // ส่วนต่างเงินที่ขาดทุนได้ก่อนโดน MM
  const bufferMoneyToMm = Math.max(0, equity - totalMm);
  const pointsToMm = bufferMoneyToMm / (contracts * multiplier);

  // ส่วนต่างเงินที่ขาดทุนได้ก่อนโดน FM
  const bufferMoneyToFm = Math.max(0, equity - totalFm);
  const pointsToFm = bufferMoneyToFm / (contracts * multiplier);

  let mcPrice = 0;
  let fcPrice = 0;
  if (input.position === 'LONG') {
    mcPrice = Math.max(0, entry - pointsToMm);
    fcPrice = Math.max(0, entry - pointsToFm);
  } else {
    mcPrice = entry + pointsToMm;
    fcPrice = entry + pointsToFm;
  }

  let status = 'ปลอดภัย พอร์ตมีหลักประกันครอบคลุมเพียงพอ';
  let variant: TfexMarginResult['statusVariant'] = 'safe';

  if (equity < totalFm) {
    status = 'วิกฤต! เงินในพอร์ตต่ำกว่าเกณฑ์ Force Close โบรกเกอร์จะบังคับปิดสัญญา';
    variant = 'danger';
  } else if (equity < totalMm) {
    status = 'แจ้งเตือน! พอร์ตแตะระดับ Margin Call ต้องเติมเงินให้เท่าระดับ Initial Margin';
    variant = 'warning';
  }

  return {
    totalImRequired: Math.round(totalIm),
    totalMmRequired: Math.round(totalMm),
    totalForceCloseRequired: Math.round(totalFm),
    marginCallPointsBuffer: Number(pointsToMm.toFixed(2)),
    forceClosePointsBuffer: Number(pointsToFm.toFixed(2)),
    marginCallPriceLevel: Number(mcPrice.toFixed(2)),
    forceClosePriceLevel: Number(fcPrice.toFixed(2)),
    statusTh: status,
    statusVariant: variant,
  };
}
