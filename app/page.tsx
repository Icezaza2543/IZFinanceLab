'use client';

import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

import { Input } from '@/components/ui/input';

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

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-5 grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.52fr)]">
          <div>
            <p className="font-numbers mb-2 text-sm font-semibold tracking-[0.22em] text-accent-foreground">
              DIVIDEND INCOME PLANNER
            </p>
            <h1 className="max-w-3xl text-[clamp(2.75rem,6vw,4.75rem)] font-bold leading-[1.05] tracking-normal">
              ปันผลเท่านี้
              <br />
              เหลือใช้จริงเท่าไร
            </h1>
          </div>
          <p className="max-w-md border-l border-accent pl-4 text-lg font-bold leading-snug text-muted-foreground sm:text-xl">
            ปรับมูลค่าพอร์ต อัตราปันผล และภาษี เพื่อดูรายรับสุทธิต่อเดือนทันที
          </p>
        </div>

        <section
          className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]"
          aria-labelledby="calculator-heading"
        >
          <div className="rounded-[1.25rem] border border-border bg-card p-5 shadow-[0_12px_40px_rgb(28_26_21/0.05)] sm:p-6">
            <h2
              id="calculator-heading"
              className="mb-4 text-2xl font-bold leading-tight tracking-tight text-card-foreground"
            >
              ข้อมูลสำหรับคำนวณ
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="portfolio"
                  className="mb-1 block text-lg font-bold leading-tight"
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
                    className="font-numbers h-12 rounded-xl border bg-background px-4 pr-16 text-2xl font-medium tabular-nums shadow-none md:text-2xl"
                  />
                  <span
                    className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg font-bold text-muted-foreground"
                    aria-hidden="true"
                  >
                    บาท
                  </span>
                </div>
                <p
                  id="portfolio-help"
                  className="mt-1 text-base font-bold leading-tight text-muted-foreground"
                >
                  เช่น{' '}
                  <span className="font-numbers font-normal">2,000,000</span>{' '}
                  บาท
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="dividend-yield"
                    className="mb-1 block text-lg font-bold leading-tight"
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
                      className="font-numbers h-12 rounded-xl border bg-background px-4 pr-12 text-2xl font-medium tabular-nums shadow-none md:text-2xl"
                    />
                    <span
                      className="font-numbers pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-medium text-muted-foreground"
                      aria-hidden="true"
                    >
                      %
                    </span>
                  </div>
                  <p
                    id="yield-help"
                    className="mt-1 text-base font-bold leading-tight text-muted-foreground"
                  >
                    ตารางตัวอย่างใช้{' '}
                    <span className="font-numbers font-normal">5%</span>
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="tax-rate"
                    className="mb-1 block text-lg font-bold leading-tight"
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
                      className="font-numbers h-12 rounded-xl border bg-background px-4 pr-12 text-2xl font-medium tabular-nums shadow-none md:text-2xl"
                    />
                    <span
                      className="font-numbers pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-medium text-muted-foreground"
                      aria-hidden="true"
                    >
                      %
                    </span>
                  </div>
                  <p
                    id="tax-help"
                    className="mt-1 text-base font-bold leading-tight text-muted-foreground"
                  >
                    ตั้งต้นที่หัก ณ ที่จ่าย{' '}
                    <span className="font-numbers font-normal">10%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <output
            className="relative overflow-hidden rounded-[1.25rem] bg-result p-5 text-result-foreground shadow-[0_18px_50px_rgb(18_22_20/0.14)] sm:p-6"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="absolute inset-x-7 top-0 h-px bg-accent"
              aria-hidden="true"
            />
            <div className="text-base font-bold tracking-[0.12em] text-result-muted">
              หลังหักภาษีแล้ว
            </div>

            <div className="mt-4 border-b border-white/15 pb-5">
              <p className="text-xl font-bold leading-tight text-result-muted sm:text-2xl">
                เงินปันผลสุทธิต่อเดือน
              </p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-medium leading-none tabular-nums">
                <span className="font-numbers text-[clamp(3.4rem,9vw,5.75rem)] tracking-[-0.055em]">
                  {formatMoney(result.netMonthly)}
                </span>
                <span className="text-xl font-bold text-result-muted sm:text-2xl">
                  บาท
                </span>
              </p>
              <p className="mt-3 text-xl font-bold leading-tight tabular-nums text-result-muted sm:text-2xl">
                หรือ{' '}
                <span className="font-numbers font-normal">
                  {formatMoney(result.netAnnual)}
                </span>{' '}
                บาทต่อปี
              </p>
            </div>

            <dl className="mt-3 grid divide-y divide-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="py-3 sm:px-4 sm:py-1 sm:first:pl-0">
                <dt className="text-base font-bold leading-tight text-result-muted">
                  ก่อนหักภาษี/ปี
                </dt>
                <dd className="font-numbers mt-1 text-xl font-medium tabular-nums">
                  {formatMoney(result.grossAnnual)}
                </dd>
              </div>
              <div className="py-3 sm:px-4 sm:py-1">
                <dt className="text-base font-bold leading-tight text-result-muted">
                  ภาษีที่หัก/ปี
                </dt>
                <dd className="font-numbers mt-1 text-xl font-medium tabular-nums">
                  {formatMoney(result.taxAnnual)}
                </dd>
              </div>
              <div className="py-3 sm:px-4 sm:py-1 sm:last:pr-0">
                <dt className="text-base font-bold leading-tight text-result-muted">
                  ปันผลสุทธิ
                </dt>
                <dd className="font-numbers mt-1 text-xl font-medium tabular-nums">
                  {decimalFormatter.format(result.netYield)}%
                </dd>
              </div>
            </dl>
          </output>
        </section>

        <aside className="mt-4 rounded-xl border border-note-border bg-note p-4 text-lg font-bold leading-snug text-note-foreground">
          <p className="font-bold">หมายเหตุสำคัญ</p>
          <p className="mt-1 font-bold">
            ตัวเลขนี้เป็นการประมาณการจากอัตราที่กรอก ไม่รวมเครดิตภาษี เงินปันผลจากต่างประเทศ
            ค่าธรรมเนียม หรือผลจากการยื่นภาษีปลายปี
          </p>
          <a
            href="https://www.rd.go.th/60116.html"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-12 items-center font-bold text-link underline decoration-1 underline-offset-4 transition-colors duration-200 hover:text-link-hover focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            ดูข้อมูลภาษีเงินปันผลจากกรมสรรพากร
          </a>
        </aside>
      </main>
    </div>
  );
}
