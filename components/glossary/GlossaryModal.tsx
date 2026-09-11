'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, BookOpen, ExternalLink, Lightbulb, Copy, Check } from 'lucide-react';
import { GLOSSARY_TERMS, CATEGORIES } from '@/data/glossary-data';
import type { GlossaryTerm, InvestmentCategory } from '@/types/glossary';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string | null;
  onSelectCalculator?: (calculatorId: string, categoryId: InvestmentCategory) => void;
}

export function GlossaryModal({
  isOpen,
  onClose,
  initialTermId,
  onSelectCalculator,
}: GlossaryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTermId, setActiveTermId] = useState<string | null>(initialTermId || null);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  useEffect(() => {
    if (initialTermId) {
      setActiveTermId(initialTermId);
      const term = GLOSSARY_TERMS.find((t) => t.id === initialTermId);
      if (term) setSelectedCategory(term.category);
    }
  }, [initialTermId]);

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

  const activeTerm = useMemo(() => {
    if (activeTermId) {
      return GLOSSARY_TERMS.find((t) => t.id === activeTermId) || filteredTerms[0] || null;
    }
    return filteredTerms[0] || null;
  }, [activeTermId, filteredTerms]);

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col rounded-2xl bg-[#FBFAF7] border border-[#D5D0C5] shadow-[0_24px_60px_rgba(24,26,24,0.18)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D5D0C5] bg-[#F5F3EE]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1A221F] text-[#E9DEC7] border border-[#A28143]/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#181A18] font-ui">
                  คลังคำศัพท์และหลักการลงทุน
                </h2>
                <span className="font-display text-xs tracking-widest text-[#A28143] uppercase hidden sm:inline">
                  · ATELIER LEXICON ·
                </span>
              </div>
              <p className="text-xs text-[#68655D] font-ui mt-0.5">
                รวบรวมนิยาม สูตรคณิตศาสตร์การเงิน ตัวอย่างประยุกต์ และข้อควรระวัง
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#68655D] hover:text-[#181A18] hover:bg-[#EEEAE1] transition-colors"
            aria-label="ปิดหน้าต่างคำศัพท์"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-[#D5D0C5]/80 space-y-3 bg-[#FBFAF7]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A28143]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาคำศัพท์ (เช่น CAGR, P/E, YTM, ปันผล, สัญญาฟิวเจอร์ส, สรรพากร)..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#D5D0C5] bg-[#F5F3EE] text-sm font-ui focus:outline-none focus:ring-1 focus:ring-[#A28143]"
              autoFocus
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#1A221F] text-[#FBFAF7]'
                  : 'bg-[#EEEAE1] text-[#68655D] hover:bg-[#D5D0C5]'
              }`}
            >
              ทั้งหมด ({GLOSSARY_TERMS.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#1A221F] text-[#FBFAF7]'
                    : 'bg-[#EEEAE1] text-[#68655D] hover:bg-[#D5D0C5]'
                }`}
              >
                {cat.nameTh}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Split view */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] overflow-hidden">
          {/* Left: Term List */}
          <div className="border-r border-[#D5D0C5]/70 overflow-y-auto p-3 space-y-1 bg-[#F5F3EE]/50">
            {filteredTerms.length === 0 ? (
              <div className="p-8 text-center text-[#68655D] text-sm font-ui">
                ไม่พบคำศัพท์ที่ตรงกับการค้นหา
              </div>
            ) : (
              filteredTerms.map((term) => {
                const isSelected = activeTerm?.id === term.id;
                return (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => setActiveTermId(term.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#FBFAF7] border border-[#A28143]/50 shadow-sm text-[#181A18]'
                        : 'hover:bg-[#EEEAE1]/80 text-[#68655D] hover:text-[#181A18]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-sm text-[#181A18] font-ui">
                        {term.termTh}
                      </span>
                      {term.abbreviation && (
                        <span className="px-1.5 py-0.5 rounded bg-[#EEEAE1] border border-[#D5D0C5] text-[#A28143] font-numeric text-[10px] font-semibold">
                          {term.abbreviation}
                        </span>
                      )}
                    </div>
                    <div className="font-display text-xs text-[#68655D] mt-0.5 tracking-wider truncate">
                      {term.termEn}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Active Term Details */}
          <div className="overflow-y-auto p-6 sm:p-7 space-y-5 bg-[#FBFAF7]">
            {activeTerm ? (
              <div className="space-y-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#EEEAE1] text-[#A28143] border border-[#D5D0C5] text-[11px] font-display tracking-widest uppercase">
                      {CATEGORIES.find((c) => c.id === activeTerm.category)?.nameTh}
                    </span>
                    {activeTerm.abbreviation && (
                      <span className="px-2 py-0.5 rounded-md bg-[#1A221F] text-[#E9DEC7] font-numeric text-xs font-semibold">
                        {activeTerm.abbreviation}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-[#181A18] font-ui">
                    {activeTerm.termTh}
                  </h3>
                  <p className="font-display text-base text-[#68655D] tracking-wide mt-0.5">
                    {activeTerm.termEn}
                  </p>
                </div>

                {/* Definition */}
                <div className="p-4 rounded-xl bg-[#F5F3EE] border border-[#D5D0C5]">
                  <h4 className="font-display text-xs font-semibold text-[#A28143] uppercase tracking-widest mb-1.5">
                    DEFINITIONS & PRINCIPLES
                  </h4>
                  <p className="text-sm leading-relaxed text-[#181A18] font-ui">
                    {activeTerm.definition}
                  </p>
                </div>

                {/* Formula */}
                {activeTerm.formula && (
                  <div className="p-4 rounded-xl bg-[#FBFAF7] border border-[#D5D0C5] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-xs font-semibold text-[#68655D] uppercase tracking-widest">
                        MATHEMATICAL FORMULA
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCopyFormula(activeTerm.formula!)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#A28143] hover:underline"
                      >
                        {copiedFormula === activeTerm.formula ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอกสูตร</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-numeric font-mono text-xs text-[#181A18] bg-[#F5F3EE] p-3 rounded-lg border border-[#D5D0C5] overflow-x-auto">
                      {activeTerm.formula}
                    </div>
                  </div>
                )}

                {/* Example */}
                {activeTerm.example && (
                  <div className="p-4 rounded-xl bg-[#EEEAE1]/60 border border-[#D5D0C5] text-xs leading-relaxed">
                    <h4 className="font-display text-xs font-semibold text-[#181A18] uppercase tracking-widest mb-1">
                      PRACTICAL EXAMPLE
                    </h4>
                    <p className="text-sm text-[#181A18] font-ui leading-relaxed">
                      {activeTerm.example}
                    </p>
                  </div>
                )}

                {/* Practical Tips */}
                {activeTerm.tips && (
                  <div className="p-4 rounded-xl bg-[#E9DEC7]/40 border border-[#D5D0C5] text-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 mb-1 font-display text-xs font-semibold text-[#A28143] uppercase tracking-widest">
                      <Lightbulb className="w-4 h-4 shrink-0" />
                      <span>ATELIER NOTES & CAUTION</span>
                    </div>
                    <p className="text-sm text-[#181A18] font-ui leading-relaxed">
                      {activeTerm.tips}
                    </p>
                  </div>
                )}

                {/* Action button */}
                {activeTerm.relatedCalculatorId && onSelectCalculator && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCalculator(activeTerm.relatedCalculatorId!, activeTerm.category);
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1A221F] text-[#FBFAF7] font-semibold text-xs hover:bg-[#262D2A] transition-colors border border-[#A28143]/40 shadow-sm"
                    >
                      <span className="font-ui">เปิดเครื่องคิดเลขที่เกี่ยวข้อง</span>
                      <ExternalLink className="w-4 h-4 text-[#E9DEC7]" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#68655D] text-sm font-ui">
                เลือกคำศัพท์ทางซ้ายเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
