import type { InvestmentCategory } from './glossary';

export interface CalculatorMeta {
  id: string;
  nameTh: string;
  nameEn: string;
  category: InvestmentCategory;
  shortDesc: string;
  badge?: string;
  relatedTerms?: string[]; // IDs in glossary
}
