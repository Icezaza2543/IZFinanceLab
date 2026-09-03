import type { Metadata } from 'next';
import { Dancing_Script, Srisakdi } from 'next/font/google';
import './globals.css';

const dancingScript = Dancing_Script({
  variable: '--font-dancing-script',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const srisakdi = Srisakdi({
  variable: '--font-srisakdi',
  subsets: ['thai'],
  weight: ['400', '700'],
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
      <body
        className={`${srisakdi.variable} ${dancingScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
