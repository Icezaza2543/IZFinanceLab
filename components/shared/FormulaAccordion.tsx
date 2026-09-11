'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen, Lightbulb } from 'lucide-react';

interface FormulaAccordionProps {
  formulaTitle: string;
  formula: string;
  explanation: string;
  tips?: string;
  relatedTermId?: string;
  onOpenGlossary?: (termId: string) => void;
}

export function FormulaAccordion({
  formulaTitle,
  formula,
  explanation,
  tips,
  relatedTermId,
  onOpenGlossary,
}: FormulaAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#D5D0C5] bg-[#EEEAE1]/40 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[#EEEAE1]/70 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#181A18]">
          <BookOpen className="w-4 h-4 text-[#A28143]" />
          <span>สูตรและหลักการคำนวณ: {formulaTitle}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#68655D] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-[#D5D0C5]/60 text-xs space-y-3 bg-[#FBFAF7]">
          <div className="p-3 rounded-lg bg-[#F5F3EE] border border-[#D5D0C5] font-numeric font-mono text-xs text-[#181A18] overflow-x-auto">
            <span className="text-[#68655D] select-none font-display uppercase tracking-wider text-[11px] block mb-1">
              FORMULA / MATHEMATICAL PRINCIPLE:
            </span>
            <span className="font-semibold text-[#181A18]">{formula}</span>
          </div>

          <p className="text-[#68655D] leading-relaxed font-normal">{explanation}</p>

          {tips && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#E9DEC7]/40 border border-[#D5D0C5] text-xs text-[#181A18]">
              <Lightbulb className="w-4 h-4 shrink-0 text-[#A28143] mt-0.5" />
              <span className="leading-relaxed">
                <strong className="font-semibold text-[#181A18]">เกร็ดข้อควรระวัง: </strong>
                {tips}
              </span>
            </div>
          )}

          {relatedTermId && onOpenGlossary && (
            <button
              type="button"
              onClick={() => onOpenGlossary(relatedTermId)}
              className="text-xs font-medium text-[#7F632F] hover:text-[#53401B] underline inline-flex items-center gap-1 pt-1"
            >
              📖 อ่านคำอธิบายศัพท์ฉบับเต็มในคลังคำศัพท์ลงทุน →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
