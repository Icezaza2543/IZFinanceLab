'use client';

import React, { useState } from 'react';
import { CalculatorCard } from '@/components/shared/CalculatorCard';
import { ResultDisplay } from '@/components/shared/ResultDisplay';
import { FormulaAccordion } from '@/components/shared/FormulaAccordion';
import { Input } from '@/components/ui/input';
import { formatMoney, formatPercent, parseNumber, formatNumberInput, formatDecimalInput } from '@/lib/formatters';
import {
  calculateGoldBullion,
  calculateRentalYield,
  calculateCryptoTrade,
} from '@/lib/calculations/alternatives';

interface AlternativesSectionProps {
  onOpenGlossary?: (termId: string) => void;
}

export function AlternativesSection({ onOpenGlossary }: AlternativesSectionProps) {
  // 1. Thai Gold Bullion State
  const [goldWeight, setGoldWeight] = useState('2');
  const [goldBuyPrice, setGoldBuyPrice] = useState('42,500');
  const [blockFee, setBlockFee] = useState('200');
  const [goldSellPrice, setGoldSellPrice] = useState('44,200');

  const goldResult = calculateGoldBullion({
    goldBahtWeight: parseNumber(goldWeight),
    buyPricePerBaht: parseNumber(goldBuyPrice),
    blockFeeTotal: parseNumber(blockFee),
    currentSellPricePerBaht: parseNumber(goldSellPrice),
  });

  // 2. Real Estate Rental Yield State
  const [propertyPrice, setPropertyPrice] = useState('2,500,000');
  const [upfrontCosts, setUpfrontCosts] = useState('100,000');
  const [monthlyRent, setMonthlyRent] = useState('12,000');
  const [vacancyMonths, setVacancyMonths] = useState('1');
  const [commonFeeYear, setCommonFeeYear] = useState('18,000');
  const [propertyTaxYear, setPropertyTaxYear] = useState('2,000');
  const [downPayment, setDownPayment] = useState('500,000');
  const [monthlyMortgage, setMonthlyMortgage] = useState('9,500');

  const rentalResult = calculateRentalYield({
    propertyPurchasePrice: parseNumber(propertyPrice),
    renovationAndTransferCosts: parseNumber(upfrontCosts),
    monthlyRentalIncome: parseNumber(monthlyRent),
    vacancyMonthsPerYear: parseNumber(vacancyMonths),
    annualCommonFeeAndMaintenance: parseNumber(commonFeeYear),
    annualPropertyTax: parseNumber(propertyTaxYear),
    downPaymentAmount: parseNumber(downPayment),
    monthlyMortgagePayment: parseNumber(monthlyMortgage),
  });

  // 3. Crypto PnL State
  const [coinBuyPrice, setCoinBuyPrice] = useState('2,200,000');
  const [coinSellPrice, setCoinSellPrice] = useState('2,650,000');
  const [coinQty, setCoinQty] = useState('0.15');
  const [exchangeFeeRate, setExchangeFeeRate] = useState('0.25');

  const cryptoResult = calculateCryptoTrade({
    coinBuyPrice: parseNumber(coinBuyPrice),
    coinSellPrice: parseNumber(coinSellPrice),
    coinQuantity: parseNumber(coinQty),
    exchangeFeePercent: parseNumber(exchangeFeeRate),
    networkGasFee: 0,
  });

  return (
    <div className="space-y-8">
      {/* 1. Thai Gold Bullion Calculator */}
      <CalculatorCard
        id="calc-gold-investment"
        title="เครื่องคำนวณกำไร-ขาดทุนทองคำแท่ง (Thai Gold Bullion)"
        subtitle="คำนวณตามน้ำหนักบาททองคำไทย 96.5% รวมค่าบล็อกและจุดคุ้มทุนขายคืน"
        badge="ทองคำแท่ง"
        onReset={() => {
          setGoldWeight('2');
          setGoldBuyPrice('42,500');
          setBlockFee('200');
          setGoldSellPrice('44,200');
        }}
        onOpenHelp={() => onOpenGlossary?.('gold-baht-weight')}
        resultNode={
          <ResultDisplay
            badgeText="ผลกำไรจากการขายทองคำแท่ง"
            primaryLabel="กำไร / ขาดทุนสุทธิ"
            primaryValue={formatMoney(goldResult.netProfitAmount)}
            primaryUnit="บาท"
            secondaryNote={`ผลตอบแทน +${goldResult.netProfitPercent}% | จุดคุ้มทุนขายคืนต้องอยู่ที่ ${formatMoney(goldResult.breakEvenSellPricePerBaht)} บาท/บาททอง`}
            statusMessage={{
              text: goldResult.netProfitAmount >= 0 ? 'ขายได้กำไรสุทธิหลังหักค่าบล็อก' : 'ราคารับซื้อคืนยังไม่ครอบคลุมต้นทุนรวม',
              variant: goldResult.netProfitAmount >= 0 ? 'safe' : 'danger',
            }}
            metrics={[
              { label: 'จุดคุ้มทุนขายคืน/บาททอง', value: formatMoney(goldResult.breakEvenSellPricePerBaht), unit: 'บาท', highlight: true },
              { label: 'ต้นทุนรวมทั้งหมด', value: formatMoney(goldResult.totalCost), unit: 'บาท' },
              { label: 'น้ำหนักทองรวม', value: `${goldResult.weightInGrams} กรัม` },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="ทองคำแท่งไทย 96.5%"
            formula="Break-even Price = (ราคาทองคำซื้อ × จำนวนบาท + ค่าบล็อก) ÷ จำนวนบาททองคำ"
            explanation="ทองคำแท่ง 1 บาททองคำในไทยมีน้ำหนักมาตรฐาน 15.244 กรัม การซื้อทองคำแท่งชิ้นเล็ก (ต่ำกว่า 5 บาท) มักมีค่าบล็อกชิ้นละ 100–300 บาท ซึ่งเป็นต้นทุนเพิ่มที่ต้องคำนวณก่อนตั้งราคาขายคืน"
            tips="สมาคมค้าทองคำกำหนดส่วนต่างราคาซื้อขาย (Spread) ทองคำแท่งมาตรฐานไว้ที่ 100 บาทต่อบาททองคำเสมอ"
            relatedTermId="gold-baht-weight"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">จำนวนน้ำหนักทองคำ (บาททอง)</label>
            <div className="relative">
              <Input value={goldWeight} onChange={(e) => setGoldWeight(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11 pr-16" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาททอง</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ค่าบล็อก/ค่ากำเหน็จรวม (บาท)</label>
            <div className="relative">
              <Input value={blockFee} onChange={(e) => setBlockFee(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11 pr-12" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">บาท</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ราคาขายออกสมาคม ณ วันซื้อ (บาท/บาททอง)</label>
            <Input value={goldBuyPrice} onChange={(e) => setGoldBuyPrice(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ราคารับซื้อคืนสมาคม ณ วันขาย (บาท/บาททอง)</label>
            <Input value={goldSellPrice} onChange={(e) => setGoldSellPrice(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
        </div>
      </CalculatorCard>

      {/* 2. Rental Yield & Real Estate Investment Calculator */}
      <CalculatorCard
        id="calc-rental-yield"
        title="เครื่องคำนวณผลตอบแทนอสังหาฯ ให้เช่า (Gross, Net Yield & Cash-on-Cash)"
        subtitle="วิเคราะห์กระแสเงินสด ค่าส่วนกลาง เผื่อห้องว่าง และผลตอบแทนเทียบเงินดาวน์จริง"
        badge="อสังหาริมทรัพย์"
        onReset={() => {
          setPropertyPrice('2,500,000');
          setUpfrontCosts('100,000');
          setMonthlyRent('12,000');
          setVacancyMonths('1');
          setCommonFeeYear('18,000');
          setPropertyTaxYear('2,000');
          setDownPayment('500,000');
          setMonthlyMortgage('9,500');
        }}
        onOpenHelp={() => onOpenGlossary?.('rental-yield')}
        resultNode={
          <ResultDisplay
            badgeText="ผลตอบแทนจากการปล่อยเช่า"
            primaryLabel="Net Rental Yield (ผลตอบแทนสุทธิ)"
            primaryValue={`${rentalResult.netRentalYieldPercent}%`}
            primaryUnit="ต่อปี"
            secondaryNote={`Cash-on-Cash Return: ${rentalResult.cashOnCashReturnPercent}% ต่อปี (กระแสเงินสดสุทธิหลังผ่อน ${formatMoney(rentalResult.annualCashFlowAfterDebt)} บ./ปี)`}
            metrics={[
              { label: 'Gross Rental Yield', value: `${rentalResult.grossRentalYieldPercent}%`, unit: '/ปี' },
              { label: 'รายได้ค่าเช่าสุทธิ/ปี (NOI)', value: formatMoney(rentalResult.annualNetOperatingIncome), unit: 'บาท' },
              { label: 'เงินสดลงทุนจริงทั้งหมด', value: formatMoney(rentalResult.totalCashInvested), unit: 'บาท', highlight: true },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="Gross vs Net Yield vs Cash-on-Cash"
            formula="Net Yield = (รายได้ค่าเช่าทั้งปี - ค่าส่วนกลาง/ภาษี) ÷ มูลค่าอสังหาริมทรัพย์รวม | Cash-on-Cash = กระแสเงินสดสุทธิหลังหักค่างวด ÷ เงินสดลงทุนจริง"
            explanation="Gross Yield คิดจากค่าเช่ารวมเพียวๆ ขณะที่ Net Yield สะท้อนค่าใช้จ่ายส่วนกลางและห้องว่าง และ Cash-on-Cash Return จะบอกผลตอบแทนของเงินสดที่คุณควักกระเป๋าจ่ายจริงเมื่อมีการกู้ธนาคาร"
            tips="ควรเผื่อความเสี่ยงห้องว่าง (Vacancy Rate) ไว้อย่างน้อย 1 เดือนต่อปี เพื่อให้การประเมินกระแสเงินสดมีความปลอดภัย"
            relatedTermId="rental-yield"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ราคาซื้ออสังหาริมทรัพย์ (บาท)</label>
            <Input value={propertyPrice} onChange={(e) => setPropertyPrice(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ค่าตกแต่ง + ค่าโอนรวม (บาท)</label>
            <Input value={upfrontCosts} onChange={(e) => setUpfrontCosts(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1">ค่าเช่าต่อเดือน (บาท)</label>
            <Input value={monthlyRent} onChange={(e) => setMonthlyRent(formatNumberInput(e.target.value))} className="font-numbers text-base h-10" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">เผื่อห้องว่าง (เดือน/ปี)</label>
            <Input value={vacancyMonths} onChange={(e) => setVacancyMonths(formatNumberInput(e.target.value))} className="font-numbers text-base h-10" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">ค่าส่วนกลางรวม/ปี (บาท)</label>
            <Input value={commonFeeYear} onChange={(e) => setCommonFeeYear(formatNumberInput(e.target.value))} className="font-numbers text-base h-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold mb-1">เงินดาวน์สดที่จ่ายจริง (บาท)</label>
            <Input value={downPayment} onChange={(e) => setDownPayment(formatNumberInput(e.target.value))} className="font-numbers text-base h-10" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">ค่างวดผ่อนธนาคารต่อเดือน (บาท)</label>
            <Input value={monthlyMortgage} onChange={(e) => setMonthlyMortgage(formatNumberInput(e.target.value))} className="font-numbers text-base h-10" />
          </div>
        </div>
      </CalculatorCard>

      {/* 3. Crypto PnL & Fee Calculator */}
      <CalculatorCard
        id="calc-crypto-pnl"
        title="เครื่องคำนวณกำไร-ขาดทุนคริปโทฯ (Crypto Trade PnL & Fee)"
        subtitle="คำนวณต้นทุนรวม ค่าธรรมเนียมกระดานเทรด และจุดคุ้มทุนต่อเหรียญ"
        badge="สินทรัพย์ดิจิทัล"
        onReset={() => {
          setCoinBuyPrice('2,200,000');
          setCoinSellPrice('2,650,000');
          setCoinQty('0.15');
          setExchangeFeeRate('0.25');
        }}
        onOpenHelp={() => onOpenGlossary?.('crypto-pnl-fees')}
        resultNode={
          <ResultDisplay
            badgeText="กำไร/ขาดทุนสุทธิคริปโทฯ"
            primaryLabel="กำไร / ขาดทุนสุทธิ"
            primaryValue={formatMoney(cryptoResult.netProfitAmount)}
            primaryUnit="บาท"
            secondaryNote={`ผลตอบแทนสุทธิ +${cryptoResult.netProfitPercent}% | จุดคุ้มทุนขายคืนที่ ${formatMoney(cryptoResult.breakEvenSellPrice)} บาท`}
            statusMessage={{
              text: cryptoResult.netProfitAmount >= 0 ? 'รายการเทรดนี้มีกำไรสุทธิหลังหักค่าธรรมเนียม' : 'รายการนี้ขาดทุนสุทธิ',
              variant: cryptoResult.netProfitAmount >= 0 ? 'safe' : 'danger',
            }}
            metrics={[
              { label: 'จุดคุ้มทุนขาย (Break-even)', value: formatMoney(cryptoResult.breakEvenSellPrice), unit: 'บาท', highlight: true },
              { label: 'ต้นทุนรวมขาซื้อ', value: formatMoney(cryptoResult.totalCost), unit: 'บาท' },
              { label: 'ค่าธรรมเนียมเทรด 2 ขา', value: formatMoney(cryptoResult.totalFeesPaid), unit: 'บาท' },
            ]}
          />
        }
        formulaNode={
          <FormulaAccordion
            formulaTitle="กำไรสุทธิการเทรดคริปโทฯ"
            formula="Net PnL = (ราคาขาย × จำนวนเหรียญ - Feeขาย) - (ราคาซื้อ × จำนวนเหรียญ + Feeซื้อ)"
            explanation="กระดานเทรดสินทรัพย์ดิจิทัลจะเรียกเก็บค่าธรรมเนียมซื้อขาย (Maker/Taker fee) ปกติอยู่ที่ 0.1%–0.25% ต่อรายการ การเทรดบ่อยครั้งอาจเสียค่าธรรมเนียมสะสมในสัดส่วนที่สูง"
            tips="สำหรับเหรียญหลัก เช่น Bitcoin (BTC) หรือ Ethereum (ETH) การใช้วิธี DCA ออมระยะยาวจะช่วยลดความเสี่ยงจากความผันผวนของราคาในระยะสั้นได้ดีกว่า"
            relatedTermId="crypto-pnl-fees"
            onOpenGlossary={onOpenGlossary}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">ราคาเหรียญตอนซื้อ (บาท หรือ USD)</label>
            <Input value={coinBuyPrice} onChange={(e) => setCoinBuyPrice(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ราคาเหรียญตอนขาย (บาท หรือ USD)</label>
            <Input value={coinSellPrice} onChange={(e) => setCoinSellPrice(formatNumberInput(e.target.value))} className="font-numbers text-xl h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">จำนวนเหรียญที่เทรด</label>
            <Input value={coinQty} onChange={(e) => setCoinQty(formatDecimalInput(e.target.value, 6))} className="font-numbers text-xl h-11" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">ค่าธรรมเนียมกระดานเทรด (%/ครั้ง)</label>
            <div className="relative">
              <Input value={exchangeFeeRate} onChange={(e) => setExchangeFeeRate(formatDecimalInput(e.target.value))} className="font-numbers text-xl h-11 pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">%</span>
            </div>
          </div>
        </div>
      </CalculatorCard>
    </div>
  );
}
