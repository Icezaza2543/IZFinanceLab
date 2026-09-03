import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-sans-thai',
  subsets: ['thai'],
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
      <body className={`${notoSansThai.variable} antialiased`}>{children}</body>
    </html>
  );
}
