export type InvestmentCategory =
  | 'financial-planning'
  | 'investment-principles'
  | 'stocks'
  | 'derivatives'
  | 'mutual-funds'
  | 'fixed-income'
  | 'dw'
  | 'foreign'
  | 'alternatives';

export interface CategoryInfo {
  id: InvestmentCategory;
  nameTh: string;
  nameEn: string;
  shortDesc: string;
  iconName: string;
  color: string;
}

export interface GlossaryTerm {
  id: string;
  termTh: string;
  termEn: string;
  abbreviation?: string;
  category: InvestmentCategory;
  definition: string;
  formula?: string;
  example?: string;
  tips?: string;
  relatedCalculatorId?: string;
  tags?: string[];
}
