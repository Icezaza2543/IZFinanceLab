'use client';

import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const comparisonPortfolios = Array.from(
  { length: 10 },
  (_, index) => (index + 1) * 2_000_000,
);

const moneyFormatter = new Intl.NumberFormat('th-TH', {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: {
    readOnlyHint: boolean;
    untrustedContentHint: boolean;
  };
  execute: (input: unknown) => unknown;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: WebMcpTool,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(',', ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPortfolioInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  return digits ? moneyFormatter.format(Number(digits)) : '';
}

function formatPercentInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = normalized.split('.');
  const decimal = decimalParts.join('').slice(0, 2);
  const formatted =
    decimalParts.length > 0
      ? `${whole.slice(0, 3)}.${decimal}`
      : whole.slice(0, 3);

  return parseNumber(formatted) > 100 ? '100' : formatted;
}

function clampPercent(value: string) {
  if (!value) return '';
  return decimalFormatter.format(
    Math.min(100, Math.max(0, parseNumber(value))),
  );
}

function formatMoney(value: number) {
  return moneyFormatter.format(Math.round(value));
}

function calculateDividend(
  portfolioValue: number,
  yieldValue: number,
  taxValue: number,
) {
  const grossAnnual = portfolioValue * (yieldValue / 100);
  const taxAnnual = grossAnnual * (taxValue / 100);
  const netAnnual = grossAnnual - taxAnnual;

  return {
    grossAnnual,
    taxAnnual,
    netAnnual,
    netMonthly: netAnnual / 12,
    netYield: yieldValue * (1 - taxValue / 100),
  };
}

export default function Home() {
  const [portfolio, setPortfolio] = useState('2,000,000');
  const [dividendYield, setDividendYield] = useState('5');
  const [taxRate, setTaxRate] = useState('10');

  const result = useMemo(() => {
    const portfolioValue = parseNumber(portfolio);
    const yieldValue = parseNumber(dividendYield);
    const taxValue = parseNumber(taxRate);

    return calculateDividend(portfolioValue, yieldValue, taxValue);
  }, [portfolio, dividendYield, taxRate]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();

    void Promise.resolve(
      context.registerTool(
        {
          name: 'calculate_dividend_return',
          title: 'คำนวณเงินปันผลสุทธิ',
          description: 'คำนวณเงินปันผลก่อนและหลังหักภาษี พร้อมอัปเดตตัวเลขที่เห็นบนหน้าเว็บ',
          inputSchema: {
            type: 'object',
            properties: {
              portfolioValue: {
                type: 'number',
                minimum: 0,
                description: 'มูลค่าพอร์ตลงทุน หน่วยเป็นบาท',
              },
              dividendYield: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'อัตราเงินปันผลต่อปี หน่วยเป็นเปอร์เซ็นต์',
              },
              taxRate: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'อัตราภาษีที่หัก หน่วยเป็นเปอร์เซ็นต์',
              },
            },
            required: ['portfolioValue', 'dividendYield', 'taxRate'],
            additionalProperties: false,
          },
          annotations: {
            readOnlyHint: false,
            untrustedContentHint: false,
          },
          execute(input) {
            const values = input as Record<string, unknown>;
            const portfolioValue = values.portfolioValue;
            const yieldValue = values.dividendYield;
            const taxValue = values.taxRate;

            if (
              typeof portfolioValue !== 'number' ||
              !Number.isFinite(portfolioValue) ||
              portfolioValue < 0 ||
              typeof yieldValue !== 'number' ||
              !Number.isFinite(yieldValue) ||
              yieldValue < 0 ||
              yieldValue > 100 ||
              typeof taxValue !== 'number' ||
              !Number.isFinite(taxValue) ||
              taxValue < 0 ||
              taxValue > 100
            ) {
              throw new Error(
                'กรุณากรอกมูลค่าพอร์ตตั้งแต่ 0 บาท และใช้อัตราปันผลกับภาษีระหว่าง 0–100%',
              );
            }

            const calculated = calculateDividend(
              portfolioValue,
              yieldValue,
              taxValue,
            );

            flushSync(() => {
              setPortfolio(moneyFormatter.format(Math.round(portfolioValue)));
              setDividendYield(decimalFormatter.format(yieldValue));
              setTaxRate(decimalFormatter.format(taxValue));
            });

            return {
              portfolioValue,
              dividendYield: yieldValue,
              taxRate: taxValue,
              grossAnnual: calculated.grossAnnual,
              taxAnnual: calculated.taxAnnual,
              netAnnual: calculated.netAnnual,
              netMonthly: calculated.netMonthly,
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, []);

  const comparisonRows = useMemo(() => {
    const yieldValue = parseNumber(dividendYield);
    const taxValue = parseNumber(taxRate);

    return comparisonPortfolios.map((portfolioValue) => {
      const grossAnnual = portfolioValue * (yieldValue / 100);
      const netAnnual = grossAnnual * (1 - taxValue / 100);

      return {
        portfolioValue,
        netAnnual,
        netMonthly: netAnnual / 12,
      };
    });
  }, [dividendYield, taxRate]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="size-2.5 rotate-45 bg-accent" aria-hidden="true" />
            <div>
              <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground">
                DIVIDEND / TH
              </p>
              <p className="mt-0.5 text-lg font-semibold tracking-tight">
                เครื่องคิดเงินปันผลสุทธิ
              </p>
            </div>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            เครื่องมือวางแผนรายได้จากพอร์ต
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 grid items-end gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.52fr)]">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-accent-foreground">
              DIVIDEND INCOME PLANNER
            </p>
            <h1 className="max-w-3xl text-[clamp(2.35rem,6vw,4.75rem)] font-medium leading-[1.08] tracking-[-0.045em]">
              ปันผลเท่านี้
              <br />
              เหลือใช้จริงเท่าไร
            </h1>
          </div>
          <p className="max-w-md border-l border-accent pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            ปรับมูลค่าพอร์ต อัตราปันผล และภาษี เพื่อดูรายรับสุทธิต่อเดือนทันที
          </p>
        </div>

        <section
          className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]"
          aria-labelledby="calculator-heading"
        >
          <div className="rounded-[1.25rem] border border-border bg-card p-6 shadow-[0_12px_40px_rgb(28_26_21/0.05)] sm:p-8">
            <h2
              id="calculator-heading"
              className="mb-7 text-xl font-semibold tracking-tight text-card-foreground"
            >
              ข้อมูลสำหรับคำนวณ
            </h2>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="portfolio"
                  className="mb-2 block text-base font-medium"
                >
                  มูลค่าพอร์ตลงทุน
                </label>
                <div className="relative">
                  <Input
                    id="portfolio"
                    value={portfolio}
                    onChange={(event) =>
                      setPortfolio(formatPortfolioInput(event.target.value))
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    aria-describedby="portfolio-help"
                    className="h-14 rounded-xl border bg-background px-4 pr-16 text-2xl font-medium tabular-nums shadow-none md:text-2xl"
                  />
                  <span
                    className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-base font-medium text-muted-foreground"
                    aria-hidden="true"
                  >
                    บาท
                  </span>
                </div>
                <p
                  id="portfolio-help"
                  className="mt-2 text-sm text-muted-foreground"
                >
                  เช่น 2,000,000 บาท
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="dividend-yield"
                    className="mb-2 block text-base font-medium"
                  >
                    ปันผลต่อปี
                  </label>
                  <div className="relative">
                    <Input
                      id="dividend-yield"
                      value={dividendYield}
                      onChange={(event) =>
                        setDividendYield(formatPercentInput(event.target.value))
                      }
                      onBlur={() =>
                        setDividendYield(clampPercent(dividendYield))
                      }
                      inputMode="decimal"
                      autoComplete="off"
                      aria-describedby="yield-help"
                      className="h-14 rounded-xl border bg-background px-4 pr-12 text-2xl font-medium tabular-nums shadow-none md:text-2xl"
                    />
                    <span
                      className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-medium text-muted-foreground"
                      aria-hidden="true"
                    >
                      %
                    </span>
                  </div>
                  <p
                    id="yield-help"
                    className="mt-2 text-sm text-muted-foreground"
                  >
                    ตารางตัวอย่างใช้ 5%
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="tax-rate"
                    className="mb-2 block text-base font-medium"
                  >
                    ภาษีที่หัก
                  </label>
                  <div className="relative">
                    <Input
                      id="tax-rate"
                      value={taxRate}
                      onChange={(event) =>
                        setTaxRate(formatPercentInput(event.target.value))
                      }
                      onBlur={() => setTaxRate(clampPercent(taxRate))}
                      inputMode="decimal"
                      autoComplete="off"
                      aria-describedby="tax-help"
                      className="h-14 rounded-xl border bg-background px-4 pr-12 text-2xl font-medium tabular-nums shadow-none md:text-2xl"
                    />
                    <span
                      className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-medium text-muted-foreground"
                      aria-hidden="true"
                    >
                      %
                    </span>
                  </div>
                  <p
                    id="tax-help"
                    className="mt-2 text-sm text-muted-foreground"
                  >
                    ตั้งต้นที่หัก ณ ที่จ่าย 10%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <output
            className="relative overflow-hidden rounded-[1.25rem] bg-result p-6 text-result-foreground shadow-[0_18px_50px_rgb(18_22_20/0.14)] sm:p-8"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="absolute inset-x-7 top-0 h-px bg-accent"
              aria-hidden="true"
            />
            <div className="text-xs font-semibold tracking-[0.2em] text-result-muted">
              หลังหักภาษีแล้ว
            </div>

            <div className="mt-8 border-b border-white/15 pb-8">
              <p className="text-base font-normal text-result-muted sm:text-lg">
                เงินปันผลสุทธิต่อเดือน
              </p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-3 font-medium leading-none tabular-nums">
                <span className="text-[clamp(3.4rem,9vw,5.75rem)] tracking-[-0.055em]">
                  {formatMoney(result.netMonthly)}
                </span>
                <span className="text-xl font-normal text-result-muted sm:text-2xl">
                  บาท
                </span>
              </p>
              <p className="mt-5 text-lg font-normal tabular-nums text-result-muted sm:text-xl">
                หรือ {formatMoney(result.netAnnual)} บาทต่อปี
              </p>
            </div>

            <dl className="mt-5 grid divide-y divide-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="py-4 sm:px-5 sm:py-2 sm:first:pl-0">
                <dt className="text-sm text-result-muted">ก่อนหักภาษี/ปี</dt>
                <dd className="mt-1 text-xl font-medium tabular-nums">
                  {formatMoney(result.grossAnnual)}
                </dd>
              </div>
              <div className="py-4 sm:px-5 sm:py-2">
                <dt className="text-sm text-result-muted">ภาษีที่หัก/ปี</dt>
                <dd className="mt-1 text-xl font-medium tabular-nums">
                  {formatMoney(result.taxAnnual)}
                </dd>
              </div>
              <div className="py-4 sm:px-5 sm:py-2 sm:last:pr-0">
                <dt className="text-sm text-result-muted">ปันผลสุทธิ</dt>
                <dd className="mt-1 text-xl font-medium tabular-nums">
                  {decimalFormatter.format(result.netYield)}%
                </dd>
              </div>
            </dl>
          </output>
        </section>

        <section
          className="mt-8 rounded-[1.25rem] border border-border bg-card p-5 shadow-[0_12px_40px_rgb(28_26_21/0.04)] sm:mt-10 sm:p-8"
          aria-labelledby="comparison-heading"
        >
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <h2
              id="comparison-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              ตารางเทียบเงินปันผลสุทธิ
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              คำนวณด้วยปันผล {dividendYield || '0'}% และภาษี {taxRate || '0'}%
            </p>
          </div>

          <div className="border-t border-border sm:hidden">
            {comparisonRows.map((row) => (
              <dl
                key={row.portfolioValue}
                className="border-b border-border py-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm font-medium text-muted-foreground">
                    พอร์ต
                  </dt>
                  <dd className="text-xl font-semibold tabular-nums">
                    {formatMoney(row.portfolioValue)} บาท
                  </dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted-foreground">สุทธิ/เดือน</dt>
                  <dd className="text-xl font-semibold tabular-nums text-accent-foreground">
                    {formatMoney(row.netMonthly)} บาท
                  </dd>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted-foreground">สุทธิ/ปี</dt>
                  <dd className="text-base font-medium tabular-nums">
                    {formatMoney(row.netAnnual)} บาท
                  </dd>
                </div>
              </dl>
            ))}
          </div>

          <div className="hidden sm:block">
            <Table className="text-lg">
              <TableHeader>
                <TableRow className="border-y bg-muted/60 hover:bg-muted/60">
                  <TableHead className="h-auto whitespace-normal px-4 py-3 text-sm font-semibold tracking-wide text-muted-foreground">
                    มูลค่าพอร์ต
                  </TableHead>
                  <TableHead className="h-auto whitespace-normal px-4 py-3 text-right text-sm font-semibold tracking-wide text-muted-foreground">
                    สุทธิต่อปี
                  </TableHead>
                  <TableHead className="h-auto whitespace-normal px-4 py-3 text-right text-sm font-semibold tracking-wide text-muted-foreground">
                    สุทธิต่อเดือน
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row) => (
                  <TableRow
                    key={row.portfolioValue}
                    className="border-b text-card-foreground hover:bg-muted/40"
                  >
                    <TableCell className="px-4 py-4 font-medium tabular-nums">
                      {formatMoney(row.portfolioValue)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right tabular-nums">
                      {formatMoney(row.netAnnual)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-semibold tabular-nums text-accent-foreground">
                      {formatMoney(row.netMonthly)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside className="mt-8 rounded-xl border border-note-border bg-note p-5 text-base leading-relaxed text-note-foreground sm:p-6">
          <p className="font-semibold">หมายเหตุสำคัญ</p>
          <p className="mt-1">
            ตัวเลขนี้เป็นการประมาณการจากอัตราที่กรอก ไม่รวมเครดิตภาษี เงินปันผลจากต่างประเทศ
            ค่าธรรมเนียม หรือผลจากการยื่นภาษีปลายปี
          </p>
          <a
            href="https://www.rd.go.th/60116.html"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-12 items-center font-medium text-link underline decoration-1 underline-offset-4 transition-colors duration-200 hover:text-link-hover focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            ดูข้อมูลภาษีเงินปันผลจากกรมสรรพากร
          </a>
        </aside>
      </main>

      <footer className="border-t border-border bg-card py-6 text-center text-sm text-muted-foreground">
        คำนวณเพื่อช่วยวางแผน ไม่ใช่คำแนะนำด้านการลงทุนหรือภาษี
      </footer>
    </div>
  );
}
