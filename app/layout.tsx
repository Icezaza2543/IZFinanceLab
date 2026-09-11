import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-thai',
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IZFinanceLab · Luxury Investment Atelier & Financial Archive',
  description:
    'ศูนย์รวมเครื่องคิดเลขการเงินและการลงทุน 9 หมวดหมู่หลัก พร้อมคลังคำศัพท์และหลักการประเมินมูลค่าระดับพรีเมียม',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${cormorant.variable} ${inter.variable}`}
    >
      <body className="font-ui antialiased bg-canvas text-primary-text min-h-dvh selection:bg-muted-gold selection:text-white">
        {children}
      </body>
    </html>
  );
}
