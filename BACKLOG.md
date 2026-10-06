# Backlog — create-clean-arch

ไอเดียและงานที่จะทำต่อ อ้างอิงจาก smoke test เมื่อ 2026-10-06 (v0.2.0)

## สถานะล่าสุด (2026-10-06)

ทุกอย่างผ่านบน Node 24 / .NET SDK 10.0.400:

- `npm test`: 48/48
- `create DemoApp --frontend vue --ci github --sample-feature --solution-format slnx -y` → `dotnet build` 0 error / 0 warning, `dotnet test` 39/39, `npm run build` (Vue) ผ่าน
- `generate feature Orders --crud create,read,list,update,delete -y` → เขียน 15 ไฟล์, build และ test ยังผ่าน

---

## P1 — `generate feature` ต่อสายให้อัตโนมัติ

ตอนนี้จบคำสั่งแล้วยังต้องทำเอง 3 ขั้น (ดู `src/generators/feature-generator.ts` บรรทัด ~57):

- [ ] เพิ่ม `public DbSet<Entity> Entities => Set<Entity>();` ลงใน `<Project>DbContext.cs` ให้เอง
- [ ] ลงทะเบียน `services.AddScoped<IEntityRepository, EntityRepository>();` ใน `InfrastructureServiceRegistration.cs` ให้เอง
- [ ] (เลือกได้) flag `--migrate` สำหรับรัน `dotnet ef migrations add Add<Entity>` ต่อท้าย เหมือนคำสั่ง `create`

แนวทาง:
- ใส่ marker comment ใน template เช่น `// <create-clean-arch:dbsets>` และ `// <create-clean-arch:repositories>` แล้วแทรกโค้ดใต้ marker
- ถ้าไม่เจอ marker (โปรเจกต์เก่า) ให้ fallback เป็นข้อความ manual step แบบเดิม
- ถ้ามีบรรทัดนั้นอยู่แล้วต้องไม่แทรกซ้ำ (idempotent) และ `--dry-run` ต้องแสดงไฟล์ที่จะถูกแก้ด้วย
- เพิ่มเทสต์ใน `test/` สำหรับกรณีมี marker / ไม่มี marker / รันซ้ำ

## P2 — ทดสอบ runtime จริง

- [ ] smoke test แบบ end-to-end: สร้างโปรเจกต์ → migration → `dotnet run` → เรียก `/health` หรือ register/login ผ่าน HTTP ได้
- [ ] ทำเป็น script หรือ e2e test (`vitest.e2e.config.ts`) ที่ข้ามอัตโนมัติถ้าไม่มี SQL Server LocalDB
- [ ] เพิ่ม GitHub Actions ให้ repo นี้เอง: `npm test` + build + e2e แบบไม่ใช้ DB (ตอนนี้ยังไม่มี CI)

## P3 — Frontend อื่นนอกจาก Vue

ตอนนี้ `--frontend react|angular|next` จะ throw error ว่ายังไม่รองรับ (`src/generators/web-generator.ts`) และในเมนู interactive ก็ปิดตัวเลือกไว้แล้ว

- [ ] **Angular**: standalone components + signals + Reactive Forms + interceptor สำหรับ JWT/refresh token (ใช้ประสบการณ์จาก portfolio)
- [ ] React + TypeScript (Vite)
- [ ] Next.js
- [ ] ระหว่างที่ยังไม่ทำ: ซ่อนตัวเลือกที่ยังไม่รองรับออกจาก `--help` หรือเขียนกำกับว่า "(planned)" ให้ตรงกับเมนู interactive

## P4 — ฐานข้อมูลอื่น

ตอนนี้ `--db` รองรับแค่ `sqlserver`

- [ ] PostgreSQL (Npgsql)
- [ ] SQLite (เหมาะกับ demo / desktop แบบ Family Expense Tracker เวอร์ชัน Windows)

## P5 — การแจกจ่าย

- [ ] ตัดสินใจว่าจะ publish ขึ้น npm หรือให้ติดตั้งจาก GitHub (`npm i -g github:BBT0423/create-clean-arch`) แล้วอัปเดต README ให้ตรง
- [ ] ถ้า publish: ทำ release workflow (tag → `npm publish`) และ CHANGELOG

---

### หมายเหตุ

- repo เป็น public แล้ว และ portfolio ลิงก์มาที่นี่ (https://bbt0423.github.io/projects/create-clean-arch)
- ถ้าทำข้อไหนเสร็จ อัปเดตข้อความใน portfolio ด้วย (`portfolio/public/data/{en,th}.json` ของ create-clean-arch)
