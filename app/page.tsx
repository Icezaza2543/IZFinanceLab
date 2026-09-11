'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { QuickSearchModal } from '@/components/layout/QuickSearchModal';
import { GlossaryModal } from '@/components/glossary/GlossaryModal';
import { GlossaryView } from '@/components/glossary/GlossaryView';

import { FinancialPlanningSection } from '@/components/calculators/financial-planning/FinancialPlanningSection';
import { InvestmentPrinciplesSection } from '@/components/calculators/investment-principles/InvestmentPrinciplesSection';
import { StockSection } from '@/components/calculators/stocks/StockSection';
import { DerivativesSection } from '@/components/calculators/derivatives/DerivativesSection';
import { MutualFundsSection } from '@/components/calculators/mutual-funds/MutualFundsSection';
import { FixedIncomeSection } from '@/components/calculators/fixed-income/FixedIncomeSection';
import { DwSection } from '@/components/calculators/dw/DwSection';
import { ForeignSection } from '@/components/calculators/foreign/ForeignSection';
import { AlternativesSection } from '@/components/calculators/alternatives/AlternativesSection';

import { CATEGORIES } from '@/data/glossary-data';
import type { InvestmentCategory } from '@/types/glossary';
import { BookOpen } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<InvestmentCategory | 'glossary'>('stocks');
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [selectedGlossaryTermId, setSelectedGlossaryTermId] = useState<string | null>(null);

  // Listen to Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenGlossaryForTerm = (termId: string) => {
    setSelectedGlossaryTermId(termId);
    setIsGlossaryModalOpen(true);
  };

  const handleSelectCalculator = (calculatorId: string, categoryId: InvestmentCategory) => {
    setActiveTab(categoryId);
    // Smooth scroll to calculator after rendering
    setTimeout(() => {
      const el = document.getElementById(calculatorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#A28143]');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[#A28143]'), 2500);
      }
    }, 150);
  };

  const currentCategoryIndex = CATEGORIES.findIndex((c) => c.id === activeTab);
  const currentCategoryInfo = CATEGORIES[currentCategoryIndex];

  return (
    <div className="min-h-dvh bg-[#F5F3EE] text-[#181A18] flex flex-col selection:bg-[#A28143] selection:text-white">
      {/* Top Sticky Luxury Editorial Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
      />

      {/* Main Content Container (Max width 1320px) */}
      <main className="mx-auto w-full max-w-[1340px] px-4 py-8 sm:px-6 lg:px-8 flex-1">
        {activeTab === 'glossary' ? (
          <GlossaryView onSelectCalculator={handleSelectCalculator} />
        ) : (
          <div className="space-y-8">
            {/* Editorial Chapter Header Banner */}
            {currentCategoryInfo && (
              <section className="rounded-2xl border border-[#D5D0C5] bg-[#FBFAF7] p-6 sm:p-10 shadow-[0_4px_24px_rgba(24,26,24,0.03)] relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display text-xs sm:text-sm tracking-[0.25em] text-[#A28143] uppercase font-semibold">
                        CHAPTER 0{currentCategoryIndex + 1} · {currentCategoryInfo.nameEn}
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#181A18] font-ui leading-[1.15]">
                      {currentCategoryInfo.nameTh}
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-[#68655D] font-normal leading-relaxed font-ui">
                      {currentCategoryInfo.shortDesc}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGlossaryTermId(null);
                        setIsGlossaryModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D5D0C5] bg-[#EEEAE1] hover:bg-[#D5D0C5]/80 px-4 py-2.5 text-xs font-semibold text-[#181A18] transition-colors shadow-sm font-ui"
                    >
                      <BookOpen className="w-4 h-4 text-[#A28143]" />
                      <span>คำศัพท์หมวดนี้</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Category Calculators Component Rendering */}
            <div className="space-y-8">
              {activeTab === 'financial-planning' && (
                <FinancialPlanningSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'investment-principles' && (
                <InvestmentPrinciplesSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'stocks' && (
                <StockSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'derivatives' && (
                <DerivativesSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'mutual-funds' && (
                <MutualFundsSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'fixed-income' && (
                <FixedIncomeSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'dw' && (
                <DwSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'foreign' && (
                <ForeignSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
              {activeTab === 'alternatives' && (
                <AlternativesSection onOpenGlossary={handleOpenGlossaryForTerm} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Editorial Colophon & Footer */}
      <footer className="mt-20 border-t border-[#D5D0C5] bg-[#FBFAF7] py-12 text-center text-xs text-[#68655D]">
        <div className="mx-auto max-w-[1340px] px-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-[#D5D0C5]" />
            <span className="font-display text-sm tracking-[0.2em] font-semibold text-[#181A18] uppercase">
              IZ FINANCE LAB · ATELIER ARCHIVE
            </span>
            <span className="h-px w-8 bg-[#D5D0C5]" />
          </div>
          <p className="font-ui font-medium max-w-2xl mx-auto text-[#68655D] leading-relaxed">
            ศูนย์รวมเครื่องคิดเลขการเงินและการลงทุน 9 หมวดหมู่: การวางแผนการเงิน · หลักการลงทุน · หุ้น · อนุพันธ์ · กองทุนรวม · ตราสารหนี้ · DW · ต่างประเทศ · สินทรัพย์ทางเลือก
          </p>
          <p className="font-display text-[11px] tracking-widest text-[#A28143] uppercase pt-1">
            EDITION 2026 · PRECISION IN METRICS · CHARACTER IN DESIGN
          </p>
          <p className="text-[11px] text-[#68655D]/70 font-ui pt-1">
            * ตัวเลขและการคำนวณทั้งหมดจัดทำขึ้นเพื่อการศึกษาและการวางแผนเบื้องต้น ไม่ถือเป็นคำแนะนำหรือการชี้ชวนการลงทุน
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectCalculator={handleSelectCalculator}
        onSelectGlossaryTerm={handleOpenGlossaryForTerm}
      />

      <GlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => {
          setIsGlossaryModalOpen(false);
          setSelectedGlossaryTermId(null);
        }}
        initialTermId={selectedGlossaryTermId}
        onSelectCalculator={handleSelectCalculator}
      />
    </div>
  );
}
