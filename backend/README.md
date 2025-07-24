# Catering Management System API

API sistem manajemen catering dengan fitur rotasi voucher otomatis per department.

## Konsep Sistem

Sistem ini mengelola catering perusahaan dengan konsep **rotasi voucher mingguan**:

1. **Setiap department mendapat giliran tidak catering** (mendapat voucher sebagai gantinya)
2. **Jadwal voucher maju 1 hari setiap minggu** (contoh: HC minggu ini dapat voucher Jumat, minggu depan dapat voucher Sabtu)
3. **Voucher adalah pengganti catering**, bukan kode untuk order makanan
4. **Department yang tidak dapat voucher**, dapat memesan catering normal

## Contoh Alur Sistem

**Minggu 1:**

- HC Department: Voucher Jumat (tidak dapat catering Jumat)
- IT Department: Voucher Senin (tidak dapat catering Senin)
- Finance: Voucher Selasa (tidak dapat catering Selasa)

**Minggu 2:**

- HC Department: Voucher Sabtu (maju 1 hari)
- IT Department: Voucher Selasa (maju 1 hari)
- Finance: Voucher Rabu (maju 1 hari)

## Fitur Utama

1. **Authentication & Authorization**

   - Login untuk PIC Catering dan Administrator
   - JWT-based authentication
   - Role-based access control

2. **Department Management**

   - CRUD department dengan PIN unique
   - Urutan department (order sequence)

3. **Food Management**

   - CRUD makanan dengan kategori
   - Input oleh PIC Catering

4. **Weekly Schedule Management**

   - Generate jadwal mingguan otomatis
   - Rotasi voucher day (maju 1 hari per minggu)
   - CRUD schedule per minggu

5. **Voucher System**

   - Generate voucher otomatis berdasarkan schedule
   - Voucher code unique dengan expiry date
   - Track status: active, used, expired
   - Department dapat menggunakan voucher

6. **Order Management**

   - Pemesanan catering normal (tanpa voucher code)
   - Department order makanan dengan PIN verification
   - Edit request system dengan approval

7. **Feedback System**

   - Feedback makanan per hari
   - Rating dan comments

8. **Reporting System**
   - Reports untuk orders, vouchers, dan feedback
   - Export ready data structure

## API Endpoints

### Authentication

```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
```

### Departments

```
GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
POST   /api/departments/verify-pin
```

### Foods

```
GET    /api/foods
GET    /api/foods/categories
GET    /api/foods/:id
POST   /api/foods
PUT    /api/foods/:id
DELETE /api/foods/:id
```

### Weekly Schedules

```
POST /api/schedules/generate
GET  /api/schedules
PUT  /api/schedules/:id
DELETE /api/schedules/week/:weekStartDate
GET  /api/schedules/department/:departmentId
```

### Vouchers

```
POST /api/vouchers/generate
GET  /api/vouchers
GET  /api/vouchers/:id
GET  /api/vouchers/code/:code
POST /api/vouchers/use/:code
PUT  /api/vouchers/:id/status
GET  /api/vouchers/department/:departmentId
POST /api/vouchers/expire-old
```

### Orders

```
GET  /api/orders
GET  /api/orders/:id
POST /api/orders
PUT  /api/orders/:id/status
POST /api/orders/:id/edit-request
PUT  /api/orders/:id/approve-edit
```

### Feedbacks

```
GET    /api/feedbacks
GET    /api/feedbacks/stats
GET    /api/feedbacks/:id
POST   /api/feedbacks
PUT    /api/feedbacks/:id
DELETE /api/feedbacks/:id
```

### Reports

```
GET /api/reports/daily?date=YYYY-MM-DD
GET /api/reports/monthly?year=YYYY&month=MM
GET /api/reports/yearly?year=YYYY
GET /api/reports/department?departmentId=ID&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

## Database Schema

### Users

- id, name, email, password, role, isActive, timestamps

### Departments

- id, name, pin (6 digit), orderSequence, isActive, timestamps

### Foods

- id, name, description, price, category, isAvailable, createdBy, timestamps

### WeeklySchedules

- id, weekStartDate, departmentId, voucherDay, weekNumber, year, timestamps

### Vouchers

- id, voucherCode, departmentId, date, amount, status, usedAt, expiryDate, notes, createdBy, timestamps

### Orders

- id, departmentId, date, totalAmount, status, notes, isEditable, editRequestReason, editRequestStatus, timestamps

### OrderItems

- id, orderId, foodId, quantity, price, subtotal, timestamps

### Feedbacks

- id, orderId, departmentId, date, rating, comment, foodQuality, serviceQuality, suggestions, timestamps

## Workflow

1. **Setup Initial Data**

   - Register PIC Catering user
   - Create departments dengan PIN unique
   - Input daftar makanan

2. **Generate Weekly Schedule**

   - PIC Catering generate schedule untuk range minggu tertentu
   - Sistem otomatis assign voucher day dan rotasi per minggu

3. **Generate Vouchers**

   - Berdasarkan schedule, generate voucher untuk setiap department
   - Voucher memiliki expiry date (biasanya 7 hari)

4. **Daily Operations**

   - Department cek schedule: jika hari voucher → gunakan voucher
   - Department cek schedule: jika bukan hari voucher → order catering
   - Department order dengan PIN verification
   - PIC Catering confirm/update status order

5. **Voucher Usage**

   - Department gunakan voucher code saat hari voucher
   - Sistem track penggunaan voucher

6. **Weekly Rotation**
   - Setiap minggu baru, voucher day maju 1 hari otomatis
   - PIC Catering dapat adjust manual jika perlu

## Installation & Setup

1. Copy `.env.example` to `.env` dan sesuaikan konfigurasi
2. Install dependencies: `npm install`
3. Setup database MySQL
4. Run seeder: `npm run seed`
5. Run server: `npm run dev`

## Security Features

- JWT authentication
- Password hashing dengan bcrypt
- Role-based access control
- PIN verification untuk department access
- Voucher code validation dengan expiry

## Response Format

Success Response:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

Error Response:

```json
{
  "success": false,
  "message": "Error message"
}
```
