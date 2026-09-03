'use client';

import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { Calculator, ShieldCheck } from 'lucide-react';

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
      <header className="border-b-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-6 sm:px-8">
          <span
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/12"
            aria-hidden="true"
          >
            <Calculator className="size-8" strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-lg font-medium text-sky-100">
              คำนวณง่าย เห็นเงินสุทธิทันที
            </p>
            <h1 className="text-[clamp(1.7rem,4vw,2.5rem)] font-bold leading-tight tracking-tight">
              เครื่องคิดเงินปันผลสุทธิ
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section
          className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]"
          aria-labelledby="calculator-heading"
        >
          <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
            <h2
              id="calculator-heading"
              className="mb-6 text-3xl font-bold leading-tight text-card-foreground"
            >
              กรอกข้อมูล 3 ช่อง
            </h2>

            <div className="space-y-7">
              <div>
                <label
                  htmlFor="portfolio"
                  className="mb-2 block text-xl font-semibold"
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
                    className="h-16 rounded-2xl border-2 bg-white px-5 pr-16 text-2xl font-bold tabular-nums shadow-inner md:text-2xl"
                  />
                  <span
                    className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-lg font-semibold text-muted-foreground"
                    aria-hidden="true"
                  >
                    บาท
                  </span>
                </div>
                <p
                  id="portfolio-help"
                  className="mt-2 text-lg text-muted-foreground"
                >
                  เช่น 2,000,000 บาท
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="dividend-yield"
                    className="mb-2 block text-xl font-semibold"
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
                      className="h-16 rounded-2xl border-2 bg-white px-5 pr-14 text-2xl font-bold tabular-nums shadow-inner md:text-2xl"
                    />
                    <span
                      className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-2xl font-bold text-muted-foreground"
                      aria-hidden="true"
                    >
                      %
                    </span>
                  </div>
                  <p
                    id="yield-help"
                    className="mt-2 text-lg text-muted-foreground"
                  >
                    ตารางตัวอย่างใช้ 5%
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="tax-rate"
                    className="mb-2 block text-xl font-semibold"
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
                      className="h-16 rounded-2xl border-2 bg-white px-5 pr-14 text-2xl font-bold tabular-nums shadow-inner md:text-2xl"
                    />
                    <span
                      className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-2xl font-bold text-muted-foreground"
                      aria-hidden="true"
                    >
                      %
                    </span>
                  </div>
                  <p
                    id="tax-help"
                    className="mt-2 text-lg text-muted-foreground"
                  >
                    ตั้งต้นที่หัก ณ ที่จ่าย 10%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <output
            className="relative overflow-hidden rounded-3xl bg-result p-6 text-result-foreground shadow-[0_18px_45px_rgb(15_23_42/0.18)] sm:p-8"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="absolute inset-x-0 top-0 h-2 bg-accent"
              aria-hidden="true"
            />
            <div className="flex items-center gap-3 text-xl font-semibold text-result-muted">
              <ShieldCheck className="size-7" aria-hidden="true" />
              หลังหักภาษีแล้ว
            </div>

            <div className="mt-6 border-b border-white/20 pb-7">
              <p className="text-xl font-medium text-result-muted">
                เงินปันผลสุทธิต่อเดือน
              </p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-bold leading-none tabular-nums">
                <span className="text-[clamp(3.25rem,9vw,6.2rem)] tracking-[-0.04em]">
                  {formatMoney(result.netMonthly)}
                </span>
                <span className="text-3xl">บาท</span>
              </p>
              <p className="mt-4 text-2xl font-semibold tabular-nums text-white">
                หรือ {formatMoney(result.netAnnual)} บาทต่อปี
              </p>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <dt className="text-lg text-result-muted">ก่อนหักภาษี/ปี</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">
                  {formatMoney(result.grossAnnual)}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <dt className="text-lg text-result-muted">ภาษีที่หัก/ปี</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">
                  {formatMoney(result.taxAnnual)}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <dt className="text-lg text-result-muted">ปันผลสุทธิ</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">
                  {decimalFormatter.format(result.netYield)}%
                </dd>
              </div>
            </dl>
          </output>
        </section>

        <section
          className="mt-8 rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:mt-10 sm:p-8"
          aria-labelledby="comparison-heading"
        >
          <div className="mb-6">
            <h2
              id="comparison-heading"
              className="text-3xl font-bold leading-tight"
            >
              ตารางเทียบเงินปันผลสุทธิ
            </h2>
            <p className="mt-2 text-xl text-muted-foreground">
              คำนวณด้วยปันผล {dividendYield || '0'}% และภาษี {taxRate || '0'}%
            </p>
          </div>

          <div className="grid gap-3 sm:hidden">
            {comparisonRows.map((row) => (
              <dl
                key={row.portfolioValue}
                className="rounded-2xl border-2 border-border bg-background p-4"
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                  <dt className="text-lg font-semibold text-muted-foreground">
                    พอร์ต
                  </dt>
                  <dd className="text-2xl font-bold tabular-nums">
                    {formatMoney(row.portfolioValue)} บาท
                  </dd>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <dt className="text-lg text-muted-foreground">สุทธิ/เดือน</dt>
                  <dd className="text-2xl font-bold tabular-nums text-accent-foreground">
                    {formatMoney(row.netMonthly)} บาท
                  </dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <dt className="text-lg text-muted-foreground">สุทธิ/ปี</dt>
                  <dd className="text-xl font-semibold tabular-nums">
                    {formatMoney(row.netAnnual)} บาท
                  </dd>
                </div>
              </dl>
            ))}
          </div>

          <div className="hidden sm:block">
            <Table className="text-xl">
              <TableHeader>
                <TableRow className="border-b-2 bg-muted hover:bg-muted">
                  <TableHead className="h-auto whitespace-normal px-4 py-4 text-xl font-bold">
                    มูลค่าพอร์ต
                  </TableHead>
                  <TableHead className="h-auto whitespace-normal px-4 py-4 text-right text-xl font-bold">
                    สุทธิต่อปี
                  </TableHead>
                  <TableHead className="h-auto whitespace-normal px-4 py-4 text-right text-xl font-bold">
                    สุทธิต่อเดือน
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row) => (
                  <TableRow
                    key={row.portfolioValue}
                    className="border-b text-card-foreground hover:bg-accent/10"
                  >
                    <TableCell className="px-4 py-4 font-semibold tabular-nums">
                      {formatMoney(row.portfolioValue)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right tabular-nums">
                      {formatMoney(row.netAnnual)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-bold tabular-nums text-accent-foreground">
                      {formatMoney(row.netMonthly)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border-2 border-note-border bg-note p-5 text-lg leading-relaxed text-note-foreground sm:p-6 sm:text-xl">
          <p className="font-bold">หมายเหตุสำคัญ</p>
          <p className="mt-1">
            ตัวเลขนี้เป็นการประมาณการจากอัตราที่กรอก ไม่รวมเครดิตภาษี เงินปันผลจากต่างประเทศ
            ค่าธรรมเนียม หรือผลจากการยื่นภาษีปลายปี
          </p>
          <a
            href="https://www.rd.go.th/60116.html"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-12 items-center font-bold text-link underline decoration-2 underline-offset-4 hover:text-link-hover focus-visible:rounded-md focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            ดูข้อมูลภาษีเงินปันผลจากกรมสรรพากร
          </a>
        </aside>
      </main>

      <footer className="border-t border-border bg-card py-6 text-center text-lg text-muted-foreground">
        คำนวณเพื่อช่วยวางแผน ไม่ใช่คำแนะนำด้านการลงทุนหรือภาษี
      </footer>
    </div>
  );
}
