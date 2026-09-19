# create-clean-arch

CLI สำหรับสร้างโปรเจกต์ .NET 10 / C# แบบ Clean Architecture (Domain / Application / Infrastructure /
Api / Tests) โดยมีระบบ Auth + JWT + MFA + ลืมรหัสผ่านทางอีเมลมาให้ตั้งแต่ต้น เลือกเพิ่ม frontend
Vue 3 และไฟล์ CI pipeline ได้ และมีคำสั่ง `generate feature` สำหรับเพิ่ม feature แบบ vertical-slice
CQRS เข้าไปในโปรเจกต์ที่สร้างไว้แล้ว

## ความต้องการของระบบ

- Node.js 20 ขึ้นไป
- .NET 10 SDK (สำหรับ build และรันโปรเจกต์ที่สร้างขึ้น)
- SQL Server (ค่าเริ่มต้นใช้ LocalDB) หากต้องการรัน migration

## ติดตั้ง

ติดตั้งจาก npm:

```bash
npm install -g @bbt0423/create-clean-arch
```

หรือติดตั้งจาก GitHub (repo เป็น private ต้องได้รับสิทธิ์เข้าถึงและ login GitHub ในเครื่องก่อน):

```bash
npm install -g github:BBT0423/create-clean-arch
```

ไม่ว่าติดตั้งจากทางไหน ชื่อคำสั่งที่ใช้งานคือ `create-clean-arch`

หรือ build จาก source ในเครื่อง:

```bash
npm install
npm run build
npm pack
npm install -g ./bbt0423-create-clean-arch-0.2.0.tgz
```

### ถ้าติดตั้งแล้วไม่พบคำสั่ง `create-clean-arch`

ให้เปิด terminal **หน้าต่างใหม่** ก่อน เพราะ terminal ที่เปิดค้างไว้จะไม่เห็น PATH ที่เพิ่งอัปเดต
ถ้ายังไม่พบ แปลว่าโฟลเดอร์ global bin ของ npm ไม่ได้อยู่ใน PATH (พบบ่อยกับ Node version manager
บางตัว เช่น nvm-for-Windows ที่ติดตั้งแพ็กเกจไว้ในโฟลเดอร์ตามเวอร์ชัน) มี 2 ทางเลือก:

- รันผ่าน `npx` โดยไม่ต้องแตะ PATH: `npx create-clean-arch create MyApp ...`
- เพิ่มโฟลเดอร์ global bin ของ npm เข้า PATH ถาวรครั้งเดียว (PowerShell, **รันก่อนใช้งานครั้งแรก**):

  ```powershell
  $dir = npm config get prefix
  $current = [Environment]::GetEnvironmentVariable("PATH","User")
  if ($current -notlike "*$dir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$current;$dir", "User")
  }
  ```

  จากนั้นเปิด terminal ใหม่ แล้วรัน `create-clean-arch --version` ควรใช้ได้

## คำสั่ง

### `create [name]`

สร้าง solution ใหม่ หากไม่ได้ระบุ flag จะถามแบบ interactive ใส่ `--yes` เพื่อข้ามคำถามทั้งหมด
(ถ้าข้อมูลที่จำเป็นขาดไปจะ error แทนที่จะถาม)

```bash
create-clean-arch create MyApp
create-clean-arch create MyApp --frontend vue --ci github --sample-feature --yes
```

| Flag | คำอธิบาย | ค่าเริ่มต้น |
|---|---|---|
| `--dir <path>` | โฟลเดอร์ปลายทาง | `./<name>` |
| `--frontend <choice>` | `none` \| `vue` (`react`/`angular`/`next` ยังไม่รองรับ) | `none` |
| `--db <provider>` | ฐานข้อมูล — รองรับเฉพาะ `sqlserver` | `sqlserver` |
| `--auth` / `--no-auth` | รวมระบบ Auth/JWT/MFA/ลืมรหัสผ่าน | `--auth` (เปิด) |
| `--ci <provider>` | `none` \| `github` \| `bitbucket` | `none` |
| `--sample-feature` | เพิ่มตัวอย่าง `Products` (backend: สร้าง/ดูตามไอดี/list) และถ้าใช้ `--frontend vue` จะได้หน้า Products ด้วย | ปิด |
| `--solution-format <format>` | `sln` (แบบคลาสสิก) หรือ `slnx` (แบบ XML ใหม่) | `sln` |
| `--skip-install` | ข้ามการรัน `dotnet restore` หลังสร้างเสร็จ | ปิด |
| `--migrate` / `--no-migrate` | สร้าง EF Core migration แรก (`InitialCreate`) หลังสร้างเสร็จ | ถาม |
| `--update-database` / `--no-update-database` | apply migration ลงฐานข้อมูลด้วย (ต้องเชื่อมต่อ DB ได้) | ถาม |
| `-y, --yes` | ไม่ถาม: ใช้ค่าเริ่มต้นสำหรับสิ่งที่ไม่ได้ระบุ flag | ปิด |
| `--force` | เขียนทับไฟล์ที่มีอยู่แล้วและเนื้อหาต่างกัน | ปิด |

หมายเหตุ:
- `--frontend vue` ต้องใช้คู่กับ Auth baseline (หน้า Vue เรียก API ของ Authorize/User) จึงใช้ร่วมกับ
  `--no-auth` ไม่ได้
- จะสร้างไฟล์ `.cleanarch.json` ไว้ที่ root ของโปรเจกต์ — `generate feature` ใช้ไฟล์นี้อ่านชื่อ
  โปรเจกต์/namespace โดยไม่ต้องถามใหม่

### `generate feature [name]`

เพิ่ม feature แบบ vertical-slice (Domain entity, CQRS commands/queries, repository, Api controller)
เข้าไปในโปรเจกต์ที่สร้างด้วย `create` ไว้แล้ว ต้องรันจากในโฟลเดอร์ของโปรเจกต์นั้น
(ที่มีไฟล์ `.cleanarch.json`)

```bash
cd MyApp
create-clean-arch generate feature Orders --entity Order --crud create,read,list,update,delete
```

| Flag | คำอธิบาย | ค่าเริ่มต้น |
|---|---|---|
| `--entity <name>` | ชื่อ entity หากต่างจากชื่อ feature ที่แปลงเป็นเอกพจน์ | ชื่อ feature แบบเอกพจน์ |
| `--crud <ops>` | คั่นด้วยจุลภาค: `create,read,list,update,delete` | `create,read,list` |
| `--validator` / `--no-validator` | รวม FluentValidation validator สำหรับ Create/Update | `--validator` (เปิด) |
| `--force` | เขียนทับไฟล์ที่มีอยู่แล้วและเนื้อหาต่างกัน | ปิด |
| `--dry-run` | แสดงแผนไฟล์ที่จะสร้างโดยไม่เขียนจริง | ปิด |
| `-y, --yes` | ไม่ถาม: ถ้าข้อมูลที่จำเป็นขาดไปจะ error | ปิด |

การจัดการไฟล์ชนกันเป็นแบบ "ทั้งหมดหรือไม่เลย": ถ้ามีไฟล์ปลายทางใดมีอยู่แล้วและเนื้อหาต่างกัน
จะไม่เขียนอะไรเลย (และแสดงรายการไฟล์ที่ชน) เว้นแต่ใส่ `--force`

> `generate feature` สร้างเฉพาะฝั่ง backend เท่านั้น ยังไม่สร้างหน้า UI ให้ (ตัวอย่างหน้า UI มีเฉพาะ `Products` จาก `--sample-feature` ซึ่งเป็นแบบอย่างให้ทำหน้าอื่นตาม)

## หลังสร้างโปรเจกต์เสร็จ

```bash
cd MyApp
dotnet build
dotnet run --project ./MyApp.Api     # Swagger ที่ /swagger
```

ถ้าไม่ได้ใช้ `--migrate` / `--update-database` ต้องสร้างและ apply migration เองก่อนรัน:

```bash
dotnet ef migrations add InitialCreate --project ./MyApp.Infrastructure --startup-project ./MyApp.Api
dotnet ef database update --project ./MyApp.Infrastructure --startup-project ./MyApp.Api
```

ค่าลับสำหรับการพัฒนาในเครื่องจะถูกสร้างให้อัตโนมัติ: ไฟล์ `.env` ที่ root ของ solution (connection
string ของ DB, JWT secret แบบสุ่ม, ค่า SMTP ตัวอย่าง) และอีกไฟล์ใน `<Name>.Web/` (คีย์เข้ารหัสฝั่ง
client แบบสุ่ม) ทั้งสองไฟล์อยู่ใน `.gitignore` และถูกโหลดให้อัตโนมัติ ให้แทนค่า SMTP ตัวอย่างด้วยค่าจริง
ก่อนเปิดการส่งอีเมล (ระบบลืม/รีเซ็ตรหัสผ่านส่งอีเมลจริง)

ถ้าใช้ `--frontend vue`:

```bash
cd MyApp.Web
npm install
npm run dev
```

## พัฒนา CLI ตัวนี้เอง

```bash
npm install
npm run build     # tsup -> dist/index.js แล้วคัดลอก src/templates -> dist/templates
npm test          # vitest unit + ทดสอบ file-tree / token-regression
npm run test:e2e  # smoke test dotnet/npm (ข้ามอัตโนมัติถ้าไม่มี SDK)
npm link          # ลองใช้ CLI แบบ global จาก working copy นี้
```

## License

[MIT](./LICENSE)
