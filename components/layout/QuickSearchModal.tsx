'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Calculator, BookOpen, ArrowRight } from 'lucide-react';
import { CATEGORIES, GLOSSARY_TERMS } from '@/data/glossary-data';
import type { InvestmentCategory } from '@/types/glossary';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculator: (calculatorId: string, categoryId: InvestmentCategory) => void;
  onSelectGlossaryTerm: (termId: string) => void;
}

interface SearchableItem {
  id: string;
  type: 'calculator' | 'glossary';
  titleTh: string;
  titleEn: string;
  category: InvestmentCategory;
  categoryNameTh: string;
  calculatorId?: string;
}

const CALCULATOR_LIST: Array<{ id: string; nameTh: string; nameEn: string; category: InvestmentCategory }> = [
  // Financial Planning
  { id: 'calc-emergency-fund', nameTh: 'เงินสำรองฉุกเฉิน (Emergency Fund)', nameEn: 'Emergency Fund Planner', category: 'financial-planning' },
  { id: 'calc-compound-interest', nameTh: 'ดอกเบี้ยทบต้นและเงินออม (Compound Interest)', nameEn: 'Compound Interest & FV', category: 'financial-planning' },
  { id: 'calc-retirement', nameTh: 'วางแผนเกษียณอายุ (Retirement Nest Egg)', nameEn: 'Retirement Planner', category: 'financial-planning' },
  { id: 'calc-debt-payoff', nameTh: 'กลยุทธ์ปลดหนี้ (Snowball vs Avalanche)', nameEn: 'Debt Payoff Calculator', category: 'financial-planning' },

  // Investment Principles
  { id: 'calc-cagr', nameTh: 'ผลตอบแทนทบต้นเฉลี่ยต่อปี (CAGR)', nameEn: 'Compound Annual Growth Rate', category: 'investment-principles' },
  { id: 'calc-rule-of-72', nameTh: 'กฎ 72 เงินโต 2 เท่า (Rule of 72)', nameEn: 'Rule of 72 Calculator', category: 'investment-principles' },
  { id: 'calc-inflation', nameTh: 'เงินเฟ้อและผลตอบแทนแท้จริง (Real Return)', nameEn: 'Inflation & Purchasing Power', category: 'investment-principles' },
  { id: 'calc-asset-allocation', nameTh: 'การจัดพอร์ตลงทุน (Asset Allocation)', nameEn: 'Portfolio Expected Return', category: 'investment-principles' },

  // Stocks
  { id: 'calc-dividend-yield', nameTh: 'เครื่องคิดเงินปันผลสุทธิหลังหักภาษี (Dividend Planner)', nameEn: 'Dividend Income & Tax', category: 'stocks' },
  { id: 'calc-valuation-ratios', nameTh: 'อัตราส่วนประเมินมูลค่าหุ้น (P/E, P/BV, PEG, ROE)', nameEn: 'Valuation Ratios', category: 'stocks' },
  { id: 'calc-stock-pnl', nameTh: 'จุดคุ้มทุนและกำไร-ขาดทุนหุ้น (รวมค่าคอม+VAT)', nameEn: 'Stock Trade PnL & Break-even', category: 'stocks' },
  { id: 'calc-fair-value', nameTh: 'ประเมินราคาเหมาะสมหุ้น (DDM & Target P/E)', nameEn: 'Fair Value Calculator', category: 'stocks' },

  // Derivatives
  { id: 'calc-tfex-futures', nameTh: 'กำไร-ขาดทุน TFEX (SET50 & Gold Futures)', nameEn: 'Futures PnL & Multiplier', category: 'derivatives' },
  { id: 'calc-tfex-margin', nameTh: 'หลักประกันและความเสี่ยง (Margin Call & Force Close)', nameEn: 'Margin Alert Calculator', category: 'derivatives' },

  // Mutual Funds
  { id: 'calc-dca-simulator', nameTh: 'จำลองการลงทุนถัวเฉลี่ย (DCA Simulator)', nameEn: 'Dollar-Cost Averaging', category: 'mutual-funds' },
  { id: 'calc-expense-ratio', nameTh: 'ผลกระทบค่าธรรมเนียมกองทุน (Expense Ratio Impact)', nameEn: 'Fund Fee Impact', category: 'mutual-funds' },
  { id: 'calc-tax-funds', nameTh: 'กองทุนลดหย่อนภาษี (Thai ESG / RMF / SSF)', nameEn: 'Tax Saving Funds', category: 'mutual-funds' },

  // Fixed Income
  { id: 'calc-bond-yield', nameTh: 'ผลตอบแทนตราสารหนี้ (Current Yield & YTM)', nameEn: 'Bond Yield to Maturity', category: 'fixed-income' },
  { id: 'calc-bond-coupon', nameTh: 'ตารางรับดอกเบี้ยคูปองสุทธิ (Coupon & 15% Tax)', nameEn: 'Bond Coupon Schedule', category: 'fixed-income' },
  { id: 'calc-clean-dirty-price', nameTh: 'ราคาซื้อขายตราสารหนี้ (Clean Price vs Dirty Price)', nameEn: 'Clean vs Dirty Price', category: 'fixed-income' },

  // DW
  { id: 'calc-dw-gearing', nameTh: 'สถานะ DW และเกียร์ริ่ง (Moneyness & Gearing)', nameEn: 'DW Moneyness & Break-even', category: 'dw' },
  { id: 'calc-dw-time-decay', nameTh: 'การลดลงตามเวลา DW (Time Decay Estimator)', nameEn: 'DW Time Decay Cost', category: 'dw' },

  // Foreign
  { id: 'calc-foreign-fx', nameTh: 'ผลกระทบอัตราแลกเปลี่ยน (Currency FX Impact)', nameEn: 'Currency Impact on Return', category: 'foreign' },
  { id: 'calc-foreign-tax', nameTh: 'ภาษีนำกำไรต่างประเทศกลับไทย (เกณฑ์สรรพากร ป.161)', nameEn: 'Foreign Income Tax', category: 'foreign' },
  { id: 'calc-foreign-us-fees', nameTh: 'หุ้นสหรัฐฯ และภาษีปันผล (US Stock & W-8BEN Tax)', nameEn: 'US Dividend & Trade Fee', category: 'foreign' },

  // Alternatives
  { id: 'calc-gold-investment', nameTh: 'กำไร-ขาดทุนทองคำแท่ง (Thai Gold Bullion)', nameEn: 'Gold Baht & Block Fee', category: 'alternatives' },
  { id: 'calc-rental-yield', nameTh: 'ผลตอบแทนอสังหาฯ ให้เช่า (Gross, Net & Cash-on-Cash)', nameEn: 'Rental Yield Calculator', category: 'alternatives' },
  { id: 'calc-crypto-pnl', nameTh: 'กำไร-ขาดทุนคริปโทฯ (Crypto Trade PnL & Fee)', nameEn: 'Crypto PnL & Exchange Fee', category: 'alternatives' },
];

export function QuickSearchModal({
  isOpen,
  onClose,
  onSelectCalculator,
  onSelectGlossaryTerm,
}: QuickSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const allItems: SearchableItem[] = useMemo(() => {
    const calcItems: SearchableItem[] = CALCULATOR_LIST.map((c) => ({
      id: c.id,
      type: 'calculator',
      titleTh: c.nameTh,
      titleEn: c.nameEn,
      category: c.category,
      categoryNameTh: CATEGORIES.find((cat) => cat.id === c.category)?.nameTh || '',
      calculatorId: c.id,
    }));

    const termItems: SearchableItem[] = GLOSSARY_TERMS.map((t) => ({
      id: t.id,
      type: 'glossary',
      titleTh: t.termTh + (t.abbreviation ? ` (${t.abbreviation})` : ''),
      titleEn: t.termEn,
      category: t.category,
      categoryNameTh: CATEGORIES.find((cat) => cat.id === t.category)?.nameTh || '',
      calculatorId: t.relatedCalculatorId,
    }));

    return [...calcItems, ...termItems];
  }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allItems.slice(0, 10);
    return allItems
      .filter((item) => {
        return (
          item.titleTh.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.categoryNameTh.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [query, allItems]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#FBFAF7] border border-[#D5D0C5] shadow-[0_24px_60px_rgba(24,26,24,0.18)] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center p-4 border-b border-[#D5D0C5] bg-[#F5F3EE]">
          <Search className="w-5 h-5 text-[#A28143] shrink-0 ml-1 mr-3" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาเครื่องคิดเลขหรือคำศัพท์ (เช่น ปันผล, P/E, เกษียณ, TFEX, ทองคำ, DCA)..."
            className="w-full bg-transparent text-sm sm:text-base font-ui text-[#181A18] focus:outline-none placeholder:text-[#68655D]/70"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#68655D] hover:text-[#181A18] hover:bg-[#EEEAE1]"
            aria-label="ปิดหน้าต่างค้นหา"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-[#D5D0C5]/40">
          {results.length === 0 ? (
            <div className="p-8 text-center text-[#68655D] text-sm font-ui">
              ไม่พบเครื่องคิดเลขหรือคำศัพท์ที่ตรงกับการค้นหา
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => {
                  if (item.type === 'calculator') {
                    onSelectCalculator(item.id, item.category);
                  } else {
                    onSelectGlossaryTerm(item.id);
                  }
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEEAE1]/80 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl text-white ${
                      item.type === 'calculator' ? 'bg-[#1A221F]' : 'bg-[#A28143]'
                    }`}
                  >
                    {item.type === 'calculator' ? (
                      <Calculator className="w-4 h-4 text-[#E9DEC7]" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#181A18] group-hover:text-[#A28143] transition-colors font-ui">
                        {item.titleTh}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EEEAE1] text-[#68655D] font-medium border border-[#D5D0C5]">
                        {item.categoryNameTh}
                      </span>
                    </div>
                    <p className="font-display text-xs text-[#68655D] mt-0.5 tracking-wider">
                      {item.titleEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#68655D] group-hover:text-[#A28143] font-medium">
                  <span className="hidden sm:inline font-ui">{item.type === 'calculator' ? 'เปิดเครื่องคิดเลข' : 'อ่านนิยาม'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#D5D0C5] bg-[#F5F3EE] text-xs text-[#68655D] flex items-center justify-between">
          <span className="font-ui">กด <kbd className="rounded bg-[#EEEAE1] px-1.5 py-0.5 border border-[#D5D0C5] font-numeric">ESC</kbd> เพื่อปิด</span>
          <span className="font-display tracking-widest text-[#A28143] text-[11px] uppercase font-semibold">
            IZ ATELIER ARCHIVE · 25+ CALCULATORS
          </span>
        </div>
      </div>
    </div>
  );
}
