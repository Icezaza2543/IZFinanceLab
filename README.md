# IZFinanceLab

เว็บคำนวณเงินปันผลสุทธิหลังหักภาษี ภาษาไทย ใช้ Next.js และโฮสต์บน Vercel

## การใช้งานในเครื่อง

ติดตั้งด้วย `npm ci` แล้วเปิดด้วย `npm run dev`

ตรวจสอบก่อนเผยแพร่ด้วย `npm run build` และเผยแพร่ด้วย `npx vercel --prod`

ฟอนต์ภาษาไทยใช้ Srisakdi ตัวหนา ตัวเลขและภาษาอังกฤษใช้ Dancing Script

## การย้ายโฮสต์ 2026-09-06

ย้ายการพัฒนาจาก `D:/SecondBrain-TJ3D/80-Resources/Calculators/Thai-Dividend-Calculator` มาที่โฟลเดอร์นี้ พร้อมประวัติ Git โดยเก็บต้นฉบับไว้เป็นสำรอง

เปลี่ยน Vinext/Cloudflare/Sites เป็น Next.js/Vercel ปรับ package.json และ tsconfig.json เพิ่ม postcss.config.mjs และ vercel.json และเอา vite.config.ts กับ .openai/hosting.json ออกจากสำเนาใหม่ ไฟล์เดิมกู้ได้จากประวัติ Git และต้นฉบับ

Remote `legacy-local` ใช้อ้างอิงต้นฉบับเท่านั้น โฟลเดอร์นี้ยังไม่ได้ผูกกับ repository บน GitHub

ค่าลับอยู่ในไฟล์ .env ที่ไม่ติดตามด้วย Git และการเชื่อม Vercel อยู่ใน .vercel ที่ไม่ติดตามด้วย Git
