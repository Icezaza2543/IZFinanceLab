'use client';

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ExternalLink, Lightbulb, Copy, Check } from 'lucide-react';
import { GLOSSARY_TERMS, CATEGORIES } from '@/data/glossary-data';
import type { GlossaryTerm, InvestmentCategory } from '@/types/glossary';

interface GlossaryViewProps {
  onSelectCalculator?: (calculatorId: string, categoryId: InvestmentCategory) => void;
}

export function GlossaryView({ onSelectCalculator }: GlossaryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return GLOSSARY_TERMS.filter((term) => {
      const matchCategory = selectedCategory === 'all' || term.category === selectedCategory;
      if (!matchCategory) return false;
      if (!q) return true;

      return (
        term.termTh.toLowerCase().includes(q) ||
        term.termEn.toLowerCase().includes(q) ||
        (term.abbreviation && term.abbreviation.toLowerCase().includes(q)) ||
        term.definition.toLowerCase().includes(q) ||
        (term.tags && term.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyFormula = (formula: string, id: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="space-y-8">
      {/* Editorial Section Masthead */}
      <div className="rounded-2xl border border-[#D5D0C5] bg-[#FBFAF7] p-6 sm:p-8 shadow-[0_4px_24px_rgba(24,26,24,0.03)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display text-xs tracking-[0.2em] text-[#A28143] uppercase font-semibold block">
                COMPREHENSIVE LEXICON · 60+ TERMS
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181A18] font-ui">
              คลังคำศัพท์และหลักการลงทุน
            </h1>
            <p className="text-sm sm:text-base text-[#68655D] font-ui mt-2 max-w-2xl leading-relaxed">
              รวบรวมคำศัพท์ทางการเงิน การลงทุนในหุ้น อนุพันธ์ กองทุนรวม ตราสารหนี้ และสินทรัพย์ทางเลือก
              พร้อมสูตรคณิตศาสตร์ ตัวอย่างจริง และข้อควรระวัง
            </p>
          </div>

          <div className="text-xs font-numeric font-medium text-[#68655D] bg-[#EEEAE1] border border-[#D5D0C5] px-3.5 py-1.5 rounded-xl self-start md:self-auto">
            แสดง <span className="font-semibold text-[#181A18]">{filteredTerms.length}</span> จากทั้งหมด {GLOSSARY_TERMS.length} คำศัพท์
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A28143]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาคำศัพท์ (เช่น CAGR, P/E, ปันผล, สัญญาซื้อขายล่วงหน้า, สรรพากร, ทองคำ)..."
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#D5D0C5] bg-[#F5F3EE] text-sm sm:text-base font-ui focus:outline-none focus:ring-1 focus:ring-[#A28143] shadow-inner"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#1A221F] text-[#FBFAF7] shadow-sm'
                  : 'bg-[#EEEAE1] text-[#68655D] hover:bg-[#D5D0C5]'
              }`}
            >
              ทั้งหมด ({GLOSSARY_TERMS.length})
            </button>
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#1A221F] text-[#FBFAF7] shadow-sm'
                    : 'bg-[#EEEAE1] text-[#68655D] hover:bg-[#D5D0C5]'
                }`}
              >
                <span className={`font-display text-[11px] ${selectedCategory === cat.id ? 'text-[#E9DEC7]' : 'text-[#A28143]'}`}>
                  0{idx + 1}
                </span>
                <span className="font-ui">{cat.nameTh}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Glossary Cards */}
      {filteredTerms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5D0C5] p-12 text-center text-[#68655D]">
          <BookOpen className="w-10 h-10 mx-auto opacity-30 mb-3" />
          <p className="font-semibold text-lg text-[#181A18] font-ui">ไม่พบคำศัพท์ที่ค้นหา</p>
          <p className="text-sm mt-1 font-ui">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredTerms.map((term) => {
            const cat = CATEGORIES.find((c) => c.id === term.category);
            return (
              <article
                key={term.id}
                id={`term-${term.id}`}
                className="rounded-2xl border border-[#D5D0C5] bg-[#FBFAF7] p-6 shadow-[0_4px_20px_rgba(24,26,24,0.02)] flex flex-col justify-between space-y-4 hover:border-[#A28143]/50 transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EEEAE1] text-[#A28143] border border-[#D5D0C5] text-[10px] font-display uppercase tracking-wider mb-1 font-semibold">
                        {cat?.nameTh}
                      </span>
                      <h3 className="text-xl font-semibold text-[#181A18] leading-tight font-ui">
                        {term.termTh}
                      </h3>
                      <p className="font-display text-sm text-[#68655D] tracking-wide mt-0.5">
                        {term.termEn}
                      </p>
                    </div>

                    {term.abbreviation && (
                      <span className="px-2 py-1 rounded-lg bg-[#1A221F] text-[#E9DEC7] font-numeric text-xs font-semibold shrink-0">
                        {term.abbreviation}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-[#68655D] font-ui">
                    {term.definition}
                  </p>

                  {term.formula && (
                    <div className="p-3.5 rounded-xl bg-[#F5F3EE] border border-[#D5D0C5] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-display uppercase tracking-widest text-[#68655D]">
                        <span>FORMULA</span>
                        <button
                          type="button"
                          onClick={() => handleCopyFormula(term.formula!, term.id)}
                          className="inline-flex items-center gap-1 text-[#A28143] hover:underline cursor-pointer"
                        >
                          {copiedId === term.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="font-ui font-medium">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="font-ui font-medium">คัดลอก</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-numeric font-mono text-xs text-[#181A18] overflow-x-auto select-all">
                        {term.formula}
                      </div>
                    </div>
                  )}

                  {term.example && (
                    <div className="p-3 rounded-xl bg-[#EEEAE1]/60 border border-[#D5D0C5] text-xs leading-relaxed">
                      <strong className="block font-display text-xs text-[#181A18] uppercase tracking-wider mb-0.5">
                        EXAMPLE:
                      </strong>
                      <span className="text-[#181A18] font-ui">{term.example}</span>
                    </div>
                  )}

                  {term.tips && (
                    <div className="p-3 rounded-xl bg-[#E9DEC7]/40 border border-[#D5D0C5] text-xs leading-relaxed">
                      <div className="flex items-center gap-1 font-display text-xs text-[#A28143] uppercase tracking-wider mb-0.5 font-semibold">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>ATELIER NOTE:</span>
                      </div>
                      <span className="text-[#181A18] font-ui">{term.tips}</span>
                    </div>
                  )}
                </div>

                {term.relatedCalculatorId && onSelectCalculator && (
                  <div className="pt-3 border-t border-[#D5D0C5]/60">
                    <button
                      type="button"
                      onClick={() => onSelectCalculator(term.relatedCalculatorId!, term.category)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#EEEAE1] text-[#181A18] hover:bg-[#D5D0C5] font-ui font-semibold text-xs transition-colors border border-[#D5D0C5]"
                    >
                      <span>ไปยังเครื่องคิดเลขที่เกี่ยวข้อง</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#A28143]" />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
