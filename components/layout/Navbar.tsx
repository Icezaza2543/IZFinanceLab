'use client';

import React from 'react';
import {
  PiggyBank,
  Compass,
  TrendingUp,
  Zap,
  Layers,
  ShieldCheck,
  Flame,
  Globe,
  Coins,
  BookOpen,
  Search,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '@/data/glossary-data';
import type { InvestmentCategory } from '@/types/glossary';

interface NavbarProps {
  activeTab: InvestmentCategory | 'glossary';
  onSelectTab: (tab: InvestmentCategory | 'glossary') => void;
  onOpenQuickSearch: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  PiggyBank,
  Compass,
  TrendingUp,
  Zap,
  Layers,
  ShieldCheck,
  Flame,
  Globe,
  Coins,
};

export function Navbar({ activeTab, onSelectTab, onOpenQuickSearch }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D5D0C5] bg-[#F5F3EE]/95 backdrop-blur-md">
      {/* Editorial Top Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#A28143] via-[#E9DEC7] to-[#1A221F]" />

      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        {/* Masthead Header: Brand Identity + Search + Glossary */}
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onSelectTab('stocks')}
              className="flex items-center gap-3 text-left group transition-opacity hover:opacity-95"
            >
              {/* Atelier Brand Monogram Emblem */}
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A221F] text-[#FBFAF7] border border-[#A28143]/40 shadow-sm">
                <span className="font-display text-lg font-bold tracking-wider text-[#E9DEC7]">
                  IZ
                </span>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#A28143] text-[8px] text-white">
                  ✦
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl sm:text-2xl font-semibold tracking-[0.14em] text-[#181A18] block leading-none">
                    IZ FINANCE LAB
                  </span>
                  <span className="hidden sm:inline-block rounded-full bg-[#EEEAE1] border border-[#D5D0C5] px-2 py-0.5 text-[10px] font-display font-medium tracking-widest text-[#A28143] uppercase">
                    ATELIER
                  </span>
                </div>
                <span className="font-display text-[11px] tracking-[0.2em] text-[#68655D] uppercase block mt-1">
                  VTUBER INVESTMENT ATELIER · 2026 ARCHIVE
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenQuickSearch}
              className="flex items-center gap-2 rounded-xl border border-[#D5D0C5] bg-[#FBFAF7] px-3.5 py-2 text-xs font-medium text-[#68655D] hover:text-[#181A18] hover:bg-[#EEEAE1] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              title="ค้นหาเครื่องคิดเลขหรือคำศัพท์ลงทุน (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#A28143]" />
              <span className="hidden sm:inline font-ui">ค้นหาเครื่องคิดเลข & คำศัพท์</span>
              <span className="sm:hidden font-ui">ค้นหา</span>
              <kbd className="hidden md:inline-block rounded bg-[#EEEAE1] px-1.5 py-0.5 font-numeric text-[10px] font-medium text-[#68655D] border border-[#D5D0C5]">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('glossary')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all shadow-sm ${
                activeTab === 'glossary'
                  ? 'bg-[#1A221F] text-[#FBFAF7] border border-[#A28143]/50'
                  : 'border border-[#D5D0C5] bg-[#FBFAF7] text-[#181A18] hover:bg-[#EEEAE1]'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'glossary' ? 'text-[#E9DEC7]' : 'text-[#A28143]'}`} />
              <span className="font-ui font-semibold">คลังคำศัพท์ลงทุน</span>
            </button>
          </div>
        </div>

        {/* Categories Bar: Editorial Chapter Navigator */}
        <nav
          className="flex space-x-1.5 overflow-x-auto py-2.5 text-xs no-scrollbar border-t border-[#D5D0C5]/60"
          aria-label="Investment Categories Navigation"
        >
          {CATEGORIES.map((cat, idx) => {
            const Icon = ICON_MAP[cat.iconName] || Sparkles;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectTab(cat.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs transition-all ${
                  isActive
                    ? 'bg-[#1A221F] text-[#FBFAF7] font-semibold shadow-sm'
                    : 'text-[#68655D] hover:bg-[#EEEAE1] hover:text-[#181A18] font-normal'
                }`}
              >
                <span className={`font-display text-[11px] ${isActive ? 'text-[#E9DEC7]' : 'text-[#A28143]/80'}`}>
                  0{idx + 1}
                </span>
                <span className="font-ui">{cat.nameTh}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
