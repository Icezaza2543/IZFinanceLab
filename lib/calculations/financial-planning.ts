// 1. เครื่องคำนวณเงินสำรองฉุกเฉิน
export interface EmergencyFundInput {
  monthlyFixedExpense: number; // รายจ่ายคงที่ เช่น ค่าบ้าน รถ ประกัน
  monthlyVariableExpense: number; // รายจ่ายผันแปร เช่น ค่ากิน เดินทาง
  jobSecurityMonths: number; // 3, 6, 9 หรือ 12 เดือน
  currentSavings: number; // เงินเก็บฉุกเฉินที่มีอยู่แล้ว
}

export interface EmergencyFundResult {
  totalMonthlyExpense: number;
  targetFund: number;
  currentSavings: number;
  gapAmount: number;
  progressPercent: number;
  monthsCoveredCurrent: number;
  recommendationTh: string;
}

export function calculateEmergencyFund(input: EmergencyFundInput): EmergencyFundResult {
  const totalMonthly = Math.max(0, input.monthlyFixedExpense) + Math.max(0, input.monthlyVariableExpense);
  const target = totalMonthly * Math.max(1, input.jobSecurityMonths);
  const current = Math.max(0, input.currentSavings);
  const gap = Math.max(0, target - current);
  const progress = target > 0 ? Math.min(100, (current / target) * 100) : 100;
  const monthsCovered = totalMonthly > 0 ? current / totalMonthly : 0;

  let recommendation = '';
  if (monthsCovered < 3) {
    recommendation = 'ควรเร่งสะสมเงินสำรองอย่างน้อย 3 เดือนก่อนเริ่มลงทุนในสินทรัพย์เสี่ยงสูง';
  } else if (monthsCovered < input.jobSecurityMonths) {
    recommendation = `มีเงินสำรองแล้ว ${monthsCovered.toFixed(1)} เดือน ใกล้ถึงเป้าหมาย ${input.jobSecurityMonths} เดือนแล้ว`;
  } else {
    recommendation = 'ยอดเงินสำรองฉุกเฉินครบตามเป้าหมายอย่างปลอดภัย ส่วนที่เกินสามารถนำไปลงทุนเพื่อเพิ่มผลตอบแทนได้';
  }

  return {
    totalMonthlyExpense: totalMonthly,
    targetFund: target,
    currentSavings: current,
    gapAmount: gap,
    progressPercent: progress,
    monthsCoveredCurrent: monthsCovered,
    recommendationTh: recommendation,
  };
}

// 2. เครื่องคำนวณดอกเบี้ยทบต้น & เป้าหมายเงินก้อน (Compound Interest)
export interface CompoundInterestInput {
  initialPrincipal: number; // เงินต้นเริ่มต้น
  monthlyContribution: number; // ออมเพิ่มต่อเดือน
  annualRatePercent: number; // ผลตอบแทนคาดหวังต่อปี %
  years: number; // ระยะเวลาปี
}

export interface CompoundInterestResult {
  totalPrincipal: number;
  totalInterest: number;
  futureValue: number;
  yearlyBreakdown: Array<{
    year: number;
    principal: number;
    interestEarned: number;
    totalBalance: number;
  }>;
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const p = Math.max(0, input.initialPrincipal);
  const pmt = Math.max(0, input.monthlyContribution);
  const r = Math.max(0, input.annualRatePercent) / 100 / 12; // monthly rate
  const years = Math.max(1, Math.min(50, Math.round(input.years)));
  const totalMonths = years * 12;

  let currentBalance = p;
  let totalContributed = p;
  const yearlyBreakdown: CompoundInterestResult['yearlyBreakdown'] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const interest = currentBalance * r;
    currentBalance += interest + pmt;
    totalContributed += pmt;

    if (m % 12 === 0) {
      const year = m / 12;
      yearlyBreakdown.push({
        year,
        principal: Math.round(totalContributed),
        interestEarned: Math.round(currentBalance - totalContributed),
        totalBalance: Math.round(currentBalance),
      });
    }
  }

  return {
    totalPrincipal: Math.round(totalContributed),
    totalInterest: Math.round(Math.max(0, currentBalance - totalContributed)),
    futureValue: Math.round(currentBalance),
    yearlyBreakdown,
  };
}

// 3. เครื่องคำนวณวางแผนเกษียณ (Retirement Planner)
export interface RetirementInput {
  currentAge: number; // อายุปัจจุบัน
  retireAge: number; // อายุเกษียณเป้าหมาย
  lifeExpectancyAge: number; // อายุขัยคาดการณ์
  monthlyExpenseToday: number; // ค่าใช้จ่ายต่อเดือนในปัจจุบัน
  inflationRatePercent: number; // อัตราเงินเฟ้อเฉลี่ยต่อปี % (เช่น 2.5 - 3%)
  postRetireReturnPercent: number; // ผลตอบแทนพอร์ตหลังเกษียณ % (เช่น 4 - 5%)
  currentRetirementSavings: number; // เงินเก็บเพื่อเกษียณปัจจุบัน
}

export interface RetirementResult {
  yearsToRetire: number;
  yearsInRetirement: number;
  futureMonthlyExpenseAtRetire: number;
  futureAnnualExpenseAtRetire: number;
  totalNestEggRequired: number;
  gapAmount: number;
  requiredMonthlySavings: number;
}

export function calculateRetirement(input: RetirementInput): RetirementResult {
  const currentAge = Math.max(18, Math.min(80, input.currentAge));
  const retireAge = Math.max(currentAge + 1, Math.min(90, input.retireAge));
  const lifeExpectancy = Math.max(retireAge + 1, Math.min(105, input.lifeExpectancyAge));
  const monthlyExpense = Math.max(0, input.monthlyExpenseToday);
  const inflation = Math.max(0, input.inflationRatePercent) / 100;
  const postReturn = Math.max(0, input.postRetireReturnPercent) / 100;

  const yearsToRetire = retireAge - currentAge;
  const yearsInRetire = lifeExpectancy - retireAge;

  // ค่าใช้จ่ายต่อเดือน ณ วันที่เกษียณ ปรับเงินเฟ้อ FV = PV * (1+i)^n
  const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflation, yearsToRetire);
  const futureAnnualExpense = futureMonthlyExpense * 12;

  // คำนวณเงินก้อนที่ต้องมี ณ วันเกษียณ โดยคิดลดกระแสเงินสด annuity
  // real discount rate = (1 + r) / (1 + i) - 1
  const realRate = (postReturn - inflation) / (1 + inflation);
  let totalNestEgg = 0;
  if (Math.abs(realRate) < 0.0001) {
    totalNestEgg = futureAnnualExpense * yearsInRetire;
  } else {
    totalNestEgg = futureAnnualExpense * ((1 - Math.pow(1 + realRate, -yearsInRetire)) / realRate);
  }

  const currentSavings = Math.max(0, input.currentRetirementSavings);
  // เงินเก็บปัจจุบันจะโตไปจนถึงวันเกษียณ
  const futureCurrentSavings = currentSavings * Math.pow(1 + postReturn, yearsToRetire);
  const gap = Math.max(0, totalNestEgg - futureCurrentSavings);

  // คำนวณเงินที่ต้องออมต่อเดือนก่อนเกษียณ (สมมติพอร์ตสะสมโต postReturn)
  const monthlyR = postReturn / 12;
  const totalMonths = yearsToRetire * 12;
  let requiredMonthlySavings = 0;
  if (monthlyR > 0 && totalMonths > 0) {
    requiredMonthlySavings = gap / ((Math.pow(1 + monthlyR, totalMonths) - 1) / monthlyR);
  } else if (totalMonths > 0) {
    requiredMonthlySavings = gap / totalMonths;
  }

  return {
    yearsToRetire,
    yearsInRetirement: yearsInRetire,
    futureMonthlyExpenseAtRetire: Math.round(futureMonthlyExpense),
    futureAnnualExpenseAtRetire: Math.round(futureAnnualExpense),
    totalNestEggRequired: Math.round(totalNestEgg),
    gapAmount: Math.round(gap),
    requiredMonthlySavings: Math.round(requiredMonthlySavings),
  };
}

// 4. เครื่องคำนวณปลดหนี้ (Debt Payoff - Snowball vs Avalanche)
export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRatePercent: number;
  minPayment: number;
}

export interface DebtPayoffResult {
  totalDebt: number;
  totalMinPayment: number;
  avalanche: {
    monthsToPayoff: number;
    totalInterestPaid: number;
  };
  snowball: {
    monthsToPayoff: number;
    totalInterestPaid: number;
  };
  interestSavedWithAvalanche: number;
}

export function calculateDebtPayoff(debts: DebtItem[], extraMonthlyPayment: number): DebtPayoffResult {
  const activeDebts = debts.filter((d) => d.balance > 0);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = activeDebts.reduce((sum, d) => sum + d.minPayment, 0);
  const extra = Math.max(0, extraMonthlyPayment);

  // จำลอง Avalanche (ดอกเบี้ยสูงสุดก่อน)
  const simAvalanche = simulateDebtStrategy(activeDebts, extra, 'avalanche');
  // จำลอง Snowball (ยอดหนี้น้อยสุดก่อน)
  const simSnowball = simulateDebtStrategy(activeDebts, extra, 'snowball');

  return {
    totalDebt: Math.round(totalDebt),
    totalMinPayment: Math.round(totalMinPayment),
    avalanche: simAvalanche,
    snowball: simSnowball,
    interestSavedWithAvalanche: Math.max(0, Math.round(simSnowball.totalInterestPaid - simAvalanche.totalInterestPaid)),
  };
}

function simulateDebtStrategy(
  debts: DebtItem[],
  extraMonthly: number,
  strategy: 'avalanche' | 'snowball',
): { monthsToPayoff: number; totalInterestPaid: number } {
  let list = debts.map((d) => ({
    ...d,
    currentBalance: d.balance,
  }));

  let months = 0;
  let totalInterest = 0;
  const maxMonths = 360; // 30 years cap

  while (list.some((d) => d.currentBalance > 0) && months < maxMonths) {
    months++;
    // 1. คิดดอกเบี้ยแต่ละรายการ
    for (const d of list) {
      if (d.currentBalance > 0) {
        const monthlyRate = d.interestRatePercent / 100 / 12;
        const interest = d.currentBalance * monthlyRate;
        totalInterest += interest;
        d.currentBalance += interest;
      }
    }

    // 2. จ่ายขั้นต่ำ
    let availableExtra = extraMonthly;
    for (const d of list) {
      if (d.currentBalance > 0) {
        const payment = Math.min(d.currentBalance, d.minPayment);
        d.currentBalance -= payment;
      }
    }

    // 3. เรียงลำดับโปะเงินก้อนพิเศษ
    if (strategy === 'avalanche') {
      list.sort((a, b) => b.interestRatePercent - a.interestRatePercent);
    } else {
      list.sort((a, b) => a.currentBalance - b.currentBalance);
    }

    for (const d of list) {
      if (d.currentBalance > 0 && availableExtra > 0) {
        const extraPay = Math.min(d.currentBalance, availableExtra);
        d.currentBalance -= extraPay;
        availableExtra -= extraPay;
      }
    }
  }

  return {
    monthsToPayoff: months,
    totalInterestPaid: Math.round(totalInterest),
  };
}
