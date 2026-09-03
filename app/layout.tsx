import type { Metadata } from 'next';
import { Anuphan, Sarabun } from 'next/font/google';
import './globals.css';

const anuphan = Anuphan({
  variable: '--font-anuphan',
  subsets: ['thai'],
  display: 'swap',
});

const sarabun = Sarabun({
  variable: '--font-sarabun',
  subsets: ['thai'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'เครื่องคิดเงินปันผลสุทธิ',
  description:
    'คำนวณเงินปันผลต่อปีและต่อเดือนหลังหักภาษี ตัวอักษรใหญ่ อ่านง่าย ใช้งานได้บนมือถือ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} ${anuphan.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
