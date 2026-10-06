# PRD — Laundry Booking & Order Management System

**Version:** 2.1.0  
**Status:** Production Ready / Development Source of Truth  
**Product Type:** Smart Laundry Booking + Simple Order Management  
**Target:** Laundry UMKM / Single Outlet  
**Architecture:** Modular Monolith REST API  
**Tech Stack:** PERN Stack  
**Authentication:** Single Admin  
**Customer Account:** Tidak tersedia  
**Payment Gateway:** Tidak digunakan  
**Primary Communication:** WhatsApp  

---

# 1. Product Vision

Laundry Booking & Order Management System adalah website ringan untuk membantu satu outlet laundry:

- menerima booking;
- menyaring pickup berdasarkan radius layanan;
- mengatur pickup berdasarkan slot;
- membatasi kapasitas pickup;
- membuat pesan WhatsApp otomatis;
- mencatat customer dan order;
- mencatat berat aktual;
- menyimpan foto timbangan;
- menghitung tagihan;
- mencatat pembayaran manual;
- mengelola status cucian;
- memberikan tracking sederhana kepada customer.

Sistem sengaja tidak dibuat seperti e-commerce atau aplikasi laundry enterprise.

Core flow:

```text
Customer buka website
        ↓
Pilih layanan
        ↓
Pilih antar sendiri / pickup
        ↓
Booking
        ↓
Booking tersimpan
        ↓
WhatsApp
        ↓
Admin konfirmasi
        ↓
Laundry menerima cucian
        ↓
Timbang + foto
        ↓
Tagihan final
        ↓
Pembayaran manual
        ↓
Processing
        ↓
Ready
        ↓
Completed
```

Website menjadi alat bantu operasional.

WhatsApp tetap menjadi channel komunikasi utama.

---

# 2. Product Scope

Sistem adalah:

> Smart Booking + WhatsApp Workflow + Simple Laundry Order Management

Bukan:

```text
E-commerce
Marketplace
ERP
Multi-outlet SaaS
Courier platform
Payment platform
Customer membership application
```

---

# 3. Core Principles

## 3.1 Customer Tanpa Account

Customer tidak perlu:

```text
Register
Login
Password
Customer Dashboard
Download aplikasi
```

Customer cukup menggunakan website dan WhatsApp.

---

## 3.2 WhatsApp First

Website membantu menghasilkan komunikasi terstruktur.

WhatsApp digunakan untuk:

```text
Booking confirmation
Billing
Payment instruction
Status notification
Operational communication
```

WhatsApp bukan source of truth.

Database PostgreSQL tetap menjadi source of truth.

---

## 3.3 No Payment Gateway

Pembayaran dilakukan melalui:

```text
QRIS
Transfer Bank
Cash
```

Tidak menggunakan:

```text
Payment gateway
Payment API
Webhook payment
Payment callback
```

Status pembayaran diperbarui manual oleh admin.

---

## 3.4 Actual Weight Is Source of Truth

Estimasi customer bukan tagihan final.

Untuk layanan kiloan:

```text
actual_weight × unit_price
```

menentukan subtotal final.

---

## 3.5 Backend Is Source of Truth

Frontend tidak dipercaya untuk menentukan:

```text
distance
pickup fee
service price
subtotal
total
slot availability
status transition
```

Semua dihitung dan divalidasi kembali oleh backend.

---

# 4. Technology Stack

## Frontend

```text
React
TypeScript
Vite
React Router
Tailwind CSS
TanStack Query
React Hook Form
Zod
Axios / Fetch
```

## Backend

```text
Node.js
Express.js
TypeScript
Zod
Prisma ORM
JWT
HttpOnly Cookie
Argon2id
Helmet
express-rate-limit
```

## Database

```text
PostgreSQL
```

## Storage

Object storage melalui abstraction:

```text
StorageService
```

Provider dapat berupa:

```text
Cloudinary
Cloudflare R2
S3-compatible storage
Supabase Storage
```

---

# 5. Architecture

```text
React
   │
   │ HTTPS / REST
   ▼
Express + TypeScript
   │
   ▼
Service Layer
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

Architecture:

```text
Modular Monolith
```

Tidak menggunakan microservices.

---

# 6. User Roles

## Customer

Customer adalah guest.

Customer dapat:

- melihat layanan;
- melakukan booking;
- memilih self drop-off atau pickup;
- memberikan lokasi pickup;
- melihat validasi radius;
- memilih pickup slot;
- melihat estimasi;
- membuka WhatsApp;
- mendapatkan booking reference;
- melakukan tracking menggunakan booking code + nomor WhatsApp.

Customer tidak memiliki account.

---

## Admin

Hanya terdapat satu role:

```text
ADMIN
```

Sistem dirancang untuk satu admin account aktif pada v1.

Admin dapat:

- login;
- logout;
- mengubah profile;
- mengubah password;
- melihat dashboard;
- mengelola booking;
- mengelola layanan;
- mengelola customer;
- memasukkan berat aktual;
- upload foto timbangan;
- menghasilkan tagihan;
- mengubah payment status;
- mengubah order status;
- mengelola pickup zone;
- mengelola pickup slot;
- mengubah settings;
- generate WhatsApp message.

Tidak tersedia:

```text
SUPER_ADMIN
STAFF
CASHIER
MANAGER
CUSTOMER_ACCOUNT
MULTI_ROLE
```

---

# 7. Booking and Order Definition

Untuk menjaga sistem tetap sederhana:

> Booking dan Order menggunakan entity database yang sama.

Table:

```text
bookings
```

Lifecycle booking berlanjut sampai order selesai.

Tidak dibuat table `orders` terpisah pada v1.

Dengan demikian:

```text
Booking dibuat
↓
Booking dikonfirmasi
↓
Cucian diterima
↓
Booking menjadi operational order
↓
Processing
↓
Ready
↓
Completed
```

Istilah "order" pada UI dapat digunakan setelah booking dikonfirmasi, tetapi source data tetap `bookings`.

---

# 8. Order Status

Enum:

```text
PENDING
CONFIRMED
RECEIVED
PROCESSING
READY
COMPLETED
CANCELLED
```

Tidak menggunakan:

```text
PENDING_CONTACT
```

## Meaning

### PENDING

Booking berhasil tersimpan tetapi belum dikonfirmasi admin.

### CONFIRMED

Admin menyetujui booking.

Untuk pickup, booking ini sudah dianggap menggunakan kapasitas slot.

### RECEIVED

Cucian sudah diterima outlet.

Berat aktual dapat dimasukkan.

### PROCESSING

Cucian sedang diproses.

### READY

Cucian selesai dan siap diambil atau diantar.

### COMPLETED

Order selesai diserahkan kepada customer.

### CANCELLED

Booking dibatalkan.

---

# 9. Status Transition

Valid:

```text
PENDING
   ↓
CONFIRMED
   ↓
RECEIVED
   ↓
PROCESSING
   ↓
READY
   ↓
COMPLETED
```

Cancellation:

```text
PENDING → CANCELLED
CONFIRMED → CANCELLED
```

Invalid:

```text
COMPLETED → PROCESSING
READY → RECEIVED
CANCELLED → PROCESSING
```

Backend wajib memvalidasi transition.

Frontend hanya menampilkan action yang valid.

---

# 10. Payment Status

Payment status dipisahkan dari order status.

Enum:

```text
UNPAID
PAID
```

Default:

```text
UNPAID
```

Contoh:

```text
order_status   = READY
payment_status = UNPAID
```

atau:

```text
order_status   = PROCESSING
payment_status = PAID
```

Admin mengubah payment status secara manual.

Tidak ada payment verification otomatis.

---

# 11. Customer Journey

```text
Landing
   ↓
Pilih Layanan
   ↓
Pilih Metode
   │
   ├── SELF_DROP_OFF
   │
   └── PICKUP
           ↓
      Input Location
           ↓
      Backend Distance Check
           ↓
       <= Max Radius?
       │            │
      YES           NO
       │            │
       ↓            ↓
 Pickup Slot    Pickup Blocked
       │
       ↓
Customer Data
       ↓
Review
       ↓
Create Booking
       ↓
Booking Reference
       ↓
Generate WhatsApp
       ↓
Open WhatsApp
```

---

# 12. Service Mode

Enum:

```text
SELF_DROP_OFF
PICKUP
```

---

# 13. Self Drop-Off

Jika:

```text
SELF_DROP_OFF
```

customer mengisi:

```text
Name
WhatsApp
Service
Estimated Quantity
Optional Schedule
Notes
```

Tidak diperlukan:

```text
Pickup address
Latitude
Longitude
Pickup slot
Pickup zone
Pickup fee
Distance
```

---

# 14. Pickup

Jika:

```text
PICKUP
```

customer wajib memberikan:

```text
Address
Landmark
Latitude
Longitude
Scheduled Date
Pickup Slot
```

Location dapat diberikan melalui:

```text
Use Current Location
Choose Location on Map
Manual Address + Map Point
```

Alamat teks tidak digunakan untuk menentukan radius.

---

# 15. Location Validation

Settings menyimpan:

```text
outlet_latitude
outlet_longitude
maximum_pickup_radius
```

Customer memberikan:

```text
customer_latitude
customer_longitude
```

Backend menghitung:

```text
Outlet coordinates
        ↓
Haversine Formula
        ↓
distance_km
```

Default:

```text
maximum_pickup_radius = 5 km
```

Valid:

```text
distance <= maximum_pickup_radius
```

Invalid:

```text
distance > maximum_pickup_radius
```

Frontend tidak boleh menjadi source of truth.

---

# 16. Location UX

Valid:

```text
✓ Lokasi tersedia

Jarak dari outlet:
3,2 km

Pickup tersedia untuk lokasi Anda.
```

Invalid:

```text
Lokasi di luar jangkauan antar-jemput.

Maksimal pickup adalah 5 km dari outlet.

[Gunakan Antar Mandiri]
```

---

# 17. Coordinate Validation

Backend wajib memvalidasi:

```text
latitude  >= -90
latitude  <= 90

longitude >= -180
longitude <= 180
```

Coordinates harus finite number.

Backend mengabaikan `distance` yang dikirim client.

---

# 18. Pickup Zones

Pickup fee menggunakan zona jarak configurable.

Contoh:

```text
0 – 2 km  → Rp3.000
>2 – 5 km → Rp5.000
```

Database:

```text
pickup_zones
```

Admin dapat mengubah tarif tanpa deploy.

---

# 19. Pickup Zone Rules

Pickup zones aktif tidak boleh:

```text
overlap
```

Contoh invalid:

```text
0–3 km
2–5 km
```

Boundary harus memiliki definisi konsisten.

Contoh:

```text
Zone A:
0 <= distance <= 2

Zone B:
2 < distance <= 5
```

Backend menentukan zone berdasarkan calculated distance.

Frontend tidak mengirim pickup fee sebagai source of truth.

---

# 20. Pickup Slots

Pickup menggunakan predefined slot.

Contoh:

```text
Pagi
10:00–11:00

Sore
16:00–17:00
```

Schema slot merupakan template harian.

```text
pickup_slots
```

Fields:

```text
id
name
start_time
end_time
capacity
is_active
created_at
updated_at
```

---

# 21. Slot Availability

Availability dihitung berdasarkan:

```text
pickup_slot_id
+
scheduled_date
```

Bukan hanya `pickup_slot_id`.

Contoh:

```text
6 Oct
Slot Pagi
5/5

7 Oct
Slot Pagi
0/5
```

Keduanya menggunakan slot template yang sama tetapi kapasitas per tanggal berbeda.

---

# 22. Slot Capacity Reservation

Booking pickup dengan status berikut menggunakan kapasitas:

```text
PENDING
CONFIRMED
```

Status berikut tidak menggunakan kapasitas booking baru:

```text
CANCELLED
```

Setelah booking memasuki:

```text
RECEIVED
PROCESSING
READY
COMPLETED
```

booking tetap tercatat sebagai historical usage, tetapi tidak relevan untuk availability karena scheduled date sudah berjalan.

Untuk perhitungan availability tanggal aktif, backend menghitung reservation pada tanggal tersebut.

---

# 23. Slot Concurrency

Slot capacity wajib aman terhadap concurrent booking.

Scenario yang harus dicegah:

```text
Capacity = 5
Current = 4

Customer A → request
Customer B → request

A membaca 4
B membaca 4

A booking
B booking

Result = 6/5
```

Tidak diperbolehkan.

Check capacity dan create booking harus dilakukan secara transaction-safe.

Implementation dapat menggunakan mekanisme database locking / serializable transaction yang sesuai PostgreSQL dan Prisma.

Invariant:

```text
reserved_slot_count <= capacity
```

harus selalu terjaga.

---

# 24. Slot Cutoff

Customer tidak boleh booking slot yang sudah dimulai.

Minimum rule:

```text
current_time < slot.start_time
```

Settings dapat memiliki:

```text
pickup_cutoff_minutes
```

Default:

```text
30
```

Maka slot hanya tersedia jika:

```text
current_time
<
slot.start_time - pickup_cutoff_minutes
```

untuk booking same-day.

---

# 25. Scheduled Date Validation

Customer tidak boleh memilih:

```text
past date
```

Maximum future booking window configurable:

```text
maximum_booking_days_ahead
```

Default:

```text
7 days
```

---

# 26. Booking Creation

Frontend mengirim data minimum yang diperlukan.

Contoh:

```json
{
  "serviceId": "uuid",
  "serviceMode": "PICKUP",
  "estimatedQuantity": "1 kantong sedang",
  "scheduledDate": "2026-10-06",
  "pickupSlotId": "uuid",
  "customer": {
    "name": "Budi",
    "phone": "08123456789",
    "address": "Jl. Mawar No. 4",
    "landmark": "Gerbang hitam",
    "latitude": -6.9,
    "longitude": 107.6
  }
}
```

Frontend tidak mengirim trusted:

```text
service price
distance
pickup fee
subtotal
total
status
payment status
```

Jika field tersebut dikirim, backend mengabaikan atau menolak berdasarkan schema policy.

---

# 27. Booking Creation Backend Flow

```text
Request
 ↓
Validate schema
 ↓
Validate service
 ↓
Normalize phone
 ↓
Validate mode
 ↓
If PICKUP:
   validate coordinates
   calculate distance
   validate radius
   determine pickup zone
   calculate pickup fee
   validate scheduled date
   validate slot
   validate cutoff
   validate capacity
 ↓
Find/Create Customer
 ↓
Generate booking code
 ↓
Snapshot service data
 ↓
Create Booking
 ↓
Create Booking Item
 ↓
Commit transaction
 ↓
Return Booking
```

---

# 28. Booking Transaction

Booking creation menggunakan database transaction.

```text
BEGIN
 ↓
Validation requiring DB state
 ↓
Capacity protection
 ↓
Customer upsert
 ↓
Booking
 ↓
Booking item
 ↓
COMMIT
```

Failure:

```text
ROLLBACK
```

Tidak boleh tercipta:

```text
booking tanpa booking_item
booking_item tanpa booking
partial customer/order state
```

---

# 29. Booking Idempotency

Frontend mengirim:

```http
Idempotency-Key
```

untuk `POST /bookings`.

Backend menyimpan atau mengenali key yang sama sehingga retry request yang identik tidak menghasilkan booking kedua.

Scope minimal:

```text
endpoint
+
idempotency key
```

Key memiliki expiry sesuai implementasi.

Duplicate request harus mengembalikan booking sebelumnya atau deterministic response.

---

# 30. Booking Reference

Format:

```text
LDR-YYYYMMDD-XXXX
```

Contoh:

```text
LDR-20261006-A7F2
```

Requirement:

```text
Unique
Non sequential
Human readable
Tidak menggunakan DB ID
```

Internal database ID tetap menggunakan:

```text
UUID
```

`booking_code` memiliki unique constraint.

Collision harus menghasilkan retry generation.

---

# 31. Customer Phone Normalization

Nomor WhatsApp dinormalisasi backend.

Input berikut:

```text
08123456789
+628123456789
628123456789
62 812-3456-789
```

harus menghasilkan canonical format:

```text
628123456789
```

untuk nomor Indonesia.

Database menyimpan canonical phone.

Constraint:

```text
UNIQUE customers.phone
```

Display formatting dilakukan frontend jika diperlukan.

---

# 32. Customer Upsert

Customer ditemukan berdasarkan normalized phone.

Jika customer sudah ada:

```text
update latest known name/address/location
```

sesuai data booking terbaru.

Booking tetap menyimpan data operasional yang diperlukan sebagai snapshot jika dibutuhkan untuk menjaga historical correctness.

Perubahan alamat customer di masa depan tidak boleh merusak data pickup order lama.

---

# 33. Service Pricing

Versi 2.1 fokus pada:

```text
PER_KG
```

Tidak mengimplementasikan billing:

```text
PER_ITEM
FIXED
```

pada v1 production.

Hal tersebut dapat ditambahkan pada versi berikutnya jika kebutuhan bisnis nyata muncul.

Ini menghindari abstraction yang belum dibutuhkan.

---

# 34. Service Schema

```text
id
name
description
price_per_kg
is_active
created_at
updated_at
```

Contoh:

```text
Cuci Komplit Reguler
Rp7.000/kg
ACTIVE
```

---

# 35. Money Data Type

Semua nominal Rupiah disimpan sebagai integer.

Contoh:

```text
price_per_kg = 7000
pickup_fee   = 5000
subtotal     = 33600
discount     = 0
total        = 38600
```

Tidak menggunakan floating point untuk monetary value.

---

# 36. Weight Data Type

Berat disimpan menggunakan decimal database type.

Contoh:

```text
DECIMAL(8,2)
```

Valid:

```text
0.10
4.80
10.50
```

Rule:

```text
actual_weight > 0
```

Tidak valid:

```text
0
negative
NaN
string invalid
infinite
```

---

# 37. Estimated Quantity

Customer dapat memilih:

```text
1 kantong kecil
1 kantong sedang
1 kantong besar
```

atau input estimasi lain yang disediakan UI.

Data ini hanya informasi operasional.

Customer selalu melihat:

> Estimasi di website bukan tagihan final. Tagihan final dihitung berdasarkan berat aktual setelah cucian ditimbang di outlet.

---

# 38. Estimated Price

Jika sistem menampilkan estimasi harga sebelum penimbangan, label wajib menggunakan:

```text
Estimasi
```

Tidak boleh menampilkan estimasi sebagai:

```text
Total Final
Tagihan Final
```

---

# 39. Actual Billing

Admin memasukkan:

```text
4.80 kg
```

Service snapshot:

```text
Rp7.000/kg
```

Calculation:

```text
4.80 × 7.000
= Rp33.600
```

Pickup:

```text
Rp5.000
```

Discount:

```text
Rp0
```

Final:

```text
33.600
+ 5.000
- 0
= Rp38.600
```

Formula:

```text
subtotal = actual_weight × unit_price

total =
subtotal
+ pickup_fee
- discount
```

Backend menjadi satu-satunya source of truth.

---

# 40. Service Price Snapshot

`booking_items` menyimpan:

```text
service_name
unit_price
```

ketika booking dibuat.

Perubahan harga service di masa depan tidak mengubah booking lama.

Contoh:

```text
Booking dibuat:
Rp7.000/kg

Besok admin mengubah service:
Rp8.000/kg

Booking lama:
tetap Rp7.000/kg
```

---

# 41. Scale Photo

Admin dapat upload foto timbangan.

Foto idealnya memperlihatkan:

- angka berat;
- timbangan;
- cucian/kantong.

Database hanya menyimpan:

```text
scale_photo_url
```

atau storage key.

Binary file tidak disimpan di PostgreSQL.

---

# 42. Upload Security

Allowed:

```text
jpg
jpeg
png
webp
```

Validation:

```text
MIME type
extension
file size
generated filename
```

Tidak mempercayai filename user.

Maximum file size configurable.

Contoh:

```text
5 MB
```

File executable ditolak.

---

# 43. Storage Abstraction

Business logic menggunakan:

```text
StorageService
```

Interface concept:

```text
upload()
delete()
```

Implementation:

```text
CloudinaryStorage
R2Storage
S3Storage
SupabaseStorage
```

Booking module tidak boleh bergantung langsung pada SDK provider.

---

# 44. Payment Methods

Settings dapat mengaktifkan:

```text
QRIS
BANK_TRANSFER
CASH
```

Payment information:

```text
bank_name
bank_account_name
bank_account_number
qris_image_url
```

Customer tidak melakukan payment melalui website.

---

# 45. Billing WhatsApp

Admin memiliki:

```text
[Generate Tagihan WhatsApp]
```

Example:

```text
Halo Kak Budi,

Cucian sudah kami timbang.

Berat:
4.8 kg

Laundry:
4.8 kg × Rp7.000 = Rp33.600

Pickup:
Rp5.000

Total:
Rp38.600

Pembayaran dapat dilakukan melalui QRIS,
transfer bank, atau cash.

Terima kasih.
```

Foto timbangan dikirim manual melalui WhatsApp.

---

# 46. Booking WhatsApp

Setelah booking berhasil dibuat:

```text
[Chat Laundry via WhatsApp]
```

Example:

```text
Halo Min, saya mau booking laundry.

Nama: Budi
Metode: Pickup
Jarak: 3 km

Alamat:
Jl. Mawar No. 4

Patokan:
Gerbang hitam

Layanan:
Cuci Komplit Reguler

Jadwal:
6 Oktober 2026

Slot:
Pagi (10.00–11.00)

Estimasi:
1 Kantong Sedang

Booking Reference:
LDR-20261006-A7F2
```

---

# 47. Important WhatsApp Rule

Booking dibuat **sebelum** WhatsApp dibuka.

Flow:

```text
POST /bookings
↓
Booking saved as PENDING
↓
Return booking code
↓
Generate WhatsApp URL
↓
Open WhatsApp
```

Jika customer tidak mengirim pesan WhatsApp:

```text
booking tetap PENDING
```

Tidak menggunakan status `PENDING_CONTACT`.

Admin dapat membatalkan booking yang tidak valid.

---

# 48. WhatsApp URL

Format:

```text
https://wa.me/{outletNumber}?text={encodedMessage}
```

Nomor outlet berasal dari Settings.

Customer data berasal dari booking response/server-derived data.

Tidak hardcode customer information.

---

# 49. Status WhatsApp Templates

## RECEIVED

```text
Halo Kak Budi,

Cucian sudah kami terima dan timbang.

Berat:
4.8 kg

Total:
Rp38.600

Foto timbangan kami lampirkan ya Kak.

Terima kasih.
```

## PROCESSING

```text
Halo Kak Budi,

Cucian Kakak sedang kami proses.

Nanti kami kabari lagi kalau sudah selesai.
```

## READY

```text
Halo Kak Budi,

Cucian sudah selesai, wangi, dan rapi.

Cucian sudah siap diambil / diantar.

Terima kasih Kak.
```

Templates dapat dihasilkan sistem berdasarkan booking data.

---

# 50. Customer Tracking

Route:

```text
/tracking
```

Customer memasukkan:

```text
Booking Code
Phone Number
```

Tidak ada customer login.

---

# 51. Tracking API

Gunakan:

```http
POST /api/v1/bookings/track
```

Bukan GET dengan phone number pada URL.

Request:

```json
{
  "bookingCode": "LDR-20261006-A7F2",
  "phone": "08123456789"
}
```

Backend:

```text
normalize phone
↓
match booking_code
+
customer.phone
```

Jika cocok, return limited public tracking data.

---

# 52. Tracking Privacy

Tracking response tidak boleh mengembalikan data internal yang tidak diperlukan.

Contoh response:

```json
{
  "success": true,
  "data": {
    "bookingCode": "LDR-20261006-A7F2",
    "service": "Cuci Komplit Reguler",
    "status": "PROCESSING",
    "paymentStatus": "UNPAID",
    "scheduledDate": "2026-10-06"
  }
}
```

Jangan expose:

```text
customer database id
admin data
internal notes
storage credentials
raw coordinates jika tidak diperlukan
```

Endpoint tracking wajib rate limited.

Error sebaiknya tidak membedakan secara berlebihan apakah booking code atau nomor HP yang salah.

---

# 53. Tracking UI

Contoh:

```text
Order
LDR-20261006-A7F2

✓ Booking dikonfirmasi
✓ Cucian diterima
● Sedang diproses
○ Siap
○ Selesai
```

Cancelled:

```text
Booking dibatalkan
```

---

# 54. Admin Dashboard

Dashboard menampilkan:

```text
Booking Hari Ini
Pending
Confirmed
Received
Processing
Ready
Completed
Cancelled
Unpaid
Revenue Hari Ini
Recent Bookings
Pickup Slots Hari Ini
```

Tidak perlu dashboard dengan banyak chart.

Operational information menjadi prioritas.

---

# 55. Revenue Definition

Untuk menghindari ambiguity:

```text
Revenue Hari Ini
```

pada dashboard berarti:

```text
SUM(total)
WHERE payment_status = PAID
AND payment paid/updated pada periode yang relevan
```

Jika payment timestamp diperlukan untuk laporan yang benar, booking menyimpan:

```text
paid_at
```

Revenue tidak dihitung dari booking yang masih UNPAID.

---

# 56. Admin Booking Page

Route:

```text
/admin/bookings
```

Features:

```text
Search booking code
Search customer name
Search phone
Filter status
Filter payment status
Filter date
Filter PICKUP / SELF_DROP_OFF
Pagination
Booking detail
```

---

# 57. Booking Detail

Example:

```text
Booking
LDR-20261006-A7F2

Customer
Budi
08123456789

Method
Pickup

Distance
3.2 km

Address
Jl. Mawar No. 4

Schedule
6 October 2026

Slot
10:00–11:00

Service
Cuci Komplit Reguler

Estimated Quantity
1 kantong sedang

Actual Weight
4.8 kg

Price
Rp7.000/kg

Pickup Fee
Rp5.000

Total
Rp38.600

Payment
UNPAID

Status
RECEIVED
```

---

# 58. Services Management

Admin dapat:

```text
Create
Edit
Activate
Deactivate
```

Delete service yang pernah digunakan booking berarti:

```text
soft deactivate
```

Historical booking tidak boleh rusak.

---

# 59. Customer Management

Admin dapat melihat:

```text
Name
WhatsApp
Latest Address
Total Bookings
Completed Orders
Last Booking Date
```

Customer tidak memiliki login.

---

# 60. Settings

## Laundry

```text
Laundry Name
Phone
WhatsApp
Address
Latitude
Longitude
```

## Operational

```text
Opening Time
Closing Time
Maximum Pickup Radius
Maximum Booking Days Ahead
Pickup Cutoff Minutes
```

## Pickup

```text
Pickup Zones
Pickup Fees
Pickup Slots
Slot Capacity
```

## Payment

```text
QRIS
Bank Name
Account Number
Account Name
Cash Enabled
```

## Upload

```text
Maximum Scale Photo Size
```

---

# 61. Database Schema

## admins

```text
id UUID PK
name VARCHAR
email VARCHAR UNIQUE
password_hash VARCHAR
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## customers

```text
id UUID PK
name VARCHAR
phone VARCHAR UNIQUE
email VARCHAR NULL
latest_address TEXT NULL
latest_latitude DECIMAL NULL
latest_longitude DECIMAL NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## services

```text
id UUID PK
name VARCHAR
description TEXT NULL
price_per_kg INTEGER
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## pickup_zones

```text
id UUID PK
min_distance_km DECIMAL
max_distance_km DECIMAL
fee INTEGER
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Constraints:

```text
min_distance_km >= 0
max_distance_km > min_distance_km
fee >= 0
```

Application/service layer wajib mencegah overlapping active zones.

---

## pickup_slots

```text
id UUID PK
name VARCHAR
start_time TIME
end_time TIME
capacity INTEGER
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Constraints:

```text
capacity > 0
end_time > start_time
```

---

## bookings

```text
id UUID PK

booking_code VARCHAR UNIQUE

customer_id UUID FK

service_mode ENUM(
  SELF_DROP_OFF,
  PICKUP
)

pickup_zone_id UUID NULL FK
pickup_slot_id UUID NULL FK

pickup_address TEXT NULL
pickup_landmark TEXT NULL
pickup_latitude DECIMAL NULL
pickup_longitude DECIMAL NULL

distance_km DECIMAL NULL

estimated_quantity VARCHAR NULL
scheduled_date DATE NULL

status ENUM(
  PENDING,
  CONFIRMED,
  RECEIVED,
  PROCESSING,
  READY,
  COMPLETED,
  CANCELLED
)

payment_status ENUM(
  UNPAID,
  PAID
)

notes TEXT NULL

subtotal INTEGER
pickup_fee INTEGER
discount INTEGER
total INTEGER

actual_weight DECIMAL(8,2) NULL

scale_photo_url TEXT NULL

received_at TIMESTAMP NULL
paid_at TIMESTAMP NULL
completed_at TIMESTAMP NULL

created_at TIMESTAMP
updated_at TIMESTAMP
```

Important invariant:

For:

```text
SELF_DROP_OFF
```

pickup-specific fields boleh null.

For:

```text
PICKUP
```

required:

```text
pickup_zone_id
pickup_slot_id
pickup_address
pickup_latitude
pickup_longitude
distance_km
scheduled_date
```

---

## booking_items

```text
id UUID PK
booking_id UUID FK
service_id UUID FK
service_name VARCHAR
unit_price INTEGER
subtotal INTEGER
created_at TIMESTAMP
```

Untuk v1:

```text
1 booking
→ minimal 1 booking item
```

Snapshot:

```text
service_name
unit_price
```

tidak berubah ketika master service berubah.

---

## settings

Single settings record.

```text
id UUID PK

laundry_name VARCHAR
phone VARCHAR
whatsapp VARCHAR

address TEXT

latitude DECIMAL
longitude DECIMAL

opening_time TIME
closing_time TIME

maximum_pickup_radius DECIMAL
maximum_booking_days_ahead INTEGER
pickup_cutoff_minutes INTEGER

bank_name VARCHAR NULL
bank_account_name VARCHAR NULL
bank_account_number VARCHAR NULL
qris_image_url TEXT NULL

cash_enabled BOOLEAN

maximum_scale_photo_mb INTEGER

created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## idempotency_keys

```text
id UUID PK
key VARCHAR UNIQUE
endpoint VARCHAR
request_hash VARCHAR
response_status INTEGER NULL
response_body JSONB NULL
expires_at TIMESTAMP
created_at TIMESTAMP
```

Digunakan untuk mencegah duplicate booking akibat retry.

---

# 62. Database Relations

```text
CUSTOMER
   │
   │ 1:N
   ▼
BOOKING
   │
   ├────────────► PICKUP_SLOT
   │
   ├────────────► PICKUP_ZONE
   │
   │ 1:N
   ▼
BOOKING_ITEM
   │
   ▼
SERVICE
```

---

# 63. Database Indexes

Unique:

```text
admins.email
customers.phone
bookings.booking_code
idempotency_keys.key
```

Indexes:

```text
bookings.status
bookings.payment_status
bookings.created_at
bookings.customer_id
bookings.scheduled_date
bookings.pickup_slot_id
bookings(scheduled_date, pickup_slot_id, status)

services.is_active
pickup_slots.is_active
pickup_zones.is_active
```

---

# 64. Public API

Base:

```text
/api/v1
```

Endpoints:

```http
GET  /services

GET  /pickup-slots?date=2026-10-06

POST /bookings/validate-location

POST /bookings

POST /bookings/track
```

---

# 65. Auth API

```http
POST  /auth/bootstrap
POST  /auth/login
POST  /auth/logout
GET   /auth/me
PATCH /auth/profile
PATCH /auth/password
```

Public generic admin registration tidak tersedia setelah initialization.

---

# 66. Secure Initial Admin Bootstrap

Initial admin hanya dapat dibuat jika:

```text
admin count = 0
```

dan request memiliki valid:

```text
ADMIN_SETUP_TOKEN
```

Environment:

```env
ADMIN_SETUP_TOKEN=
```

Flow:

```text
POST /auth/bootstrap
↓
Check admin count
↓
Must equal 0
↓
Validate setup token
↓
Create admin
↓
Future bootstrap blocked
```

Jika admin sudah ada:

```text
403 ADMIN_ALREADY_INITIALIZED
```

Alternative production deployment diperbolehkan menggunakan secure CLI initialization.

Tidak boleh ada unrestricted public admin registration.

---

# 67. Login Security

Password hashing:

```text
Argon2id
```

Rate limit login:

```text
5 failed attempts
per 15 minutes
per IP
```

Implementasi boleh menambahkan protection berdasarkan account identifier jika diperlukan.

Password plaintext tidak pernah disimpan atau dicatat pada log.

---

# 68. Authentication

Authentication:

```text
JWT
+
HttpOnly Cookie
```

Cookie production:

```text
HttpOnly
Secure
SameSite=Lax
```

Expiration ditentukan configuration.

Production wajib HTTPS.

---

# 69. CORS and Cookie Security

Allowed origin menggunakan exact allowlist.

Example:

```text
https://laundry.example.com
```

Backend:

```text
credentials = true
```

Tidak boleh menggunakan:

```text
Access-Control-Allow-Origin: *
```

bersamaan dengan credentialed authentication.

Mutation admin endpoints wajib melakukan origin validation dan/atau CSRF mitigation yang sesuai deployment.

---

# 70. Authorization

Semua:

```text
/api/v1/admin/*
```

wajib melewati:

```text
authenticateAdmin
```

Inactive admin ditolak.

Customer tidak memiliki access token.

---

# 71. Admin Booking API

```http
GET   /admin/bookings
GET   /admin/bookings/:id

PATCH /admin/bookings/:id/status
PATCH /admin/bookings/:id/weight
PATCH /admin/bookings/:id/payment-status

POST  /admin/bookings/:id/scale-photo
```

---

# 72. Admin Services API

```http
GET    /admin/services
POST   /admin/services
GET    /admin/services/:id
PATCH  /admin/services/:id
DELETE /admin/services/:id
```

`DELETE` melakukan deactivate jika service pernah digunakan.

---

# 73. Admin Customer API

```http
GET /admin/customers
GET /admin/customers/:id
GET /admin/customers/:id/bookings
```

---

# 74. Admin Pickup API

```http
GET   /admin/pickup-zones
POST  /admin/pickup-zones
PATCH /admin/pickup-zones/:id

GET   /admin/pickup-slots
POST  /admin/pickup-slots
PATCH /admin/pickup-slots/:id
```

---

# 75. Admin Settings API

```http
GET   /admin/settings
PATCH /admin/settings
```

---

# 76. Dashboard API

```http
GET /admin/dashboard
```

Example:

```json
{
  "success": true,
  "data": {
    "today": {
      "total": 12,
      "pending": 2,
      "confirmed": 2,
      "received": 1,
      "processing": 4,
      "ready": 2,
      "completed": 1,
      "cancelled": 0,
      "unpaid": 3,
      "paidRevenue": 125000
    }
  }
}
```

---

# 77. API Response Convention

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Booking created successfully"
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "message": "Invalid pickup location",
  "errors": []
}
```

---

# 78. Error Codes

Business errors sebaiknya memiliki stable code.

Example:

```text
OUTSIDE_PICKUP_RADIUS
PICKUP_SLOT_FULL
PICKUP_SLOT_CLOSED
INVALID_STATUS_TRANSITION
BOOKING_NOT_FOUND
INVALID_TRACKING_CREDENTIALS
ADMIN_ALREADY_INITIALIZED
SERVICE_INACTIVE
DUPLICATE_REQUEST
UNAUTHORIZED
```

Response dapat berupa:

```json
{
  "success": false,
  "data": null,
  "code": "PICKUP_SLOT_FULL",
  "message": "Pickup slot is full",
  "errors": []
}
```

---

# 79. Error Sanitization

Production tidak boleh expose:

```text
stack trace
SQL query
database credentials
filesystem path
JWT secret
internal storage credentials
raw Prisma error
```

Internal error tetap dicatat pada server logging.

---

# 80. Frontend Structure

```text
src/
│
├── assets/
├── components/
│   ├── ui/
│   ├── booking/
│   ├── admin/
│   └── common/
│
├── layouts/
│   ├── PublicLayout.tsx
│   └── AdminLayout.tsx
│
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── BookingPage.tsx
│   │   ├── BookingSuccessPage.tsx
│   │   └── TrackingPage.tsx
│   │
│   └── admin/
│       ├── LoginPage.tsx
│       ├── BootstrapPage.tsx
│       ├── DashboardPage.tsx
│       ├── BookingsPage.tsx
│       ├── BookingDetailPage.tsx
│       ├── ServicesPage.tsx
│       ├── CustomersPage.tsx
│       ├── PickupSlotsPage.tsx
│       ├── PickupZonesPage.tsx
│       └── SettingsPage.tsx
│
├── features/
│   ├── auth/
│   ├── booking/
│   ├── services/
│   ├── customers/
│   ├── pickup/
│   └── settings/
│
├── hooks/
├── lib/
├── schemas/
├── types/
├── routes/
│
├── App.tsx
└── main.tsx
```

---

# 81. Backend Structure

```text
src/
│
├── config/
│   ├── env.ts
│   └── database.ts
│
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   ├── validate.ts
│   └── originGuard.ts
│
├── modules/
│   ├── auth/
│   ├── bookings/
│   ├── services/
│   ├── customers/
│   ├── pickup/
│   ├── dashboard/
│   └── settings/
│
├── storage/
│   ├── storage.interface.ts
│   └── providers/
│
├── utils/
│   ├── bookingCode.ts
│   ├── distance.ts
│   ├── phone.ts
│   ├── money.ts
│   └── whatsapp.ts
│
├── routes/
│   └── index.ts
│
├── app.ts
└── server.ts
```

---

# 82. Clean Architecture

```text
Route
 ↓
Middleware
 ↓
Controller
 ↓
Service
 ↓
Prisma
 ↓
PostgreSQL
```

Controller:

```text
request
response
status code
```

Service:

```text
business logic
calculation
transaction
workflow
status transition
```

Schema:

```text
input validation
```

Prisma:

```text
database access
```

---

# 83. Customer Booking UI

Mobile-first flow:

```text
Step 1
Pilih Layanan

↓

Step 2
Pilih Metode

↓

Step 3
Lokasi
(hanya PICKUP)

↓

Step 4
Tanggal + Slot
(hanya PICKUP)

↓

Step 5
Data Customer

↓

Step 6
Review

↓

Create Booking

↓

WhatsApp
```

---

# 84. Smart UI

Jika:

```text
SELF_DROP_OFF
```

hide:

```text
Location
Pickup Slot
Pickup Fee
Distance
```

Jika:

```text
PICKUP
```

show:

```text
Location
Distance
Scheduled Date
Pickup Slot
Pickup Fee
```

---

# 85. Booking Success Page

Setelah booking berhasil:

```text
Booking berhasil dibuat

Reference:
LDR-20261006-A7F2

Simpan kode booking ini.

[Chat Laundry via WhatsApp]

[Lacak Booking]
```

Customer harus tetap bisa melihat booking reference walaupun WhatsApp gagal dibuka.

---

# 86. Mobile Admin

Desktop:

```text
Sidebar
+
Content
```

Mobile:

```text
Sidebar → Drawer
```

Booking table desktop berubah menjadi booking cards pada mobile.

Tidak memaksa horizontal scrolling untuk workflow utama.

---

# 87. Security Baseline

Gunakan:

```text
Helmet
Exact CORS allowlist
Rate limiting
Zod validation
Prisma parameterization
Secure cookies
Authorization
Origin/CSRF mitigation
Upload validation
Error sanitization
HTTPS
```

---

# 88. Mass Assignment Protection

Backend tidak boleh langsung melakukan:

```text
prisma.booking.create({
  data: req.body
})
```

Gunakan explicit mapping.

Client tidak boleh menentukan:

```text
status
payment_status
total
subtotal
pickup_fee
distance_km
actual_weight
scale_photo_url
admin-only fields
```

pada public booking endpoint.

---

# 89. Price Manipulation Protection

Input:

```json
{
  "total": 1000
}
```

tidak boleh mengubah total.

Backend mengambil:

```text
service snapshot price
pickup zone
actual weight
discount authorized by admin
```

kemudian menghitung total sendiri.

---

# 90. Radius Bypass Protection

Input client:

```text
distance = 1 km
```

tetapi coordinates menghasilkan:

```text
7 km
```

Backend menggunakan hasil Haversine sendiri dan menolak pickup.

---

# 91. Slot Bypass Protection

Client tidak boleh dapat membuat booking ke:

```text
inactive slot
full slot
past slot
slot outside allowed booking window
```

walaupun request dimodifikasi manual.

---

# 92. Rate Limiting

Minimal:

```text
Login
Tracking
Booking creation
Location validation
Admin bootstrap
```

memiliki rate limit yang sesuai.

Rate limit booking tidak boleh terlalu agresif hingga mengganggu customer normal.

---

# 93. Logging

Production logging mencatat:

```text
request ID
timestamp
method
route
status
duration
sanitized error
```

Jangan log:

```text
password
JWT
cookie
bank credentials
full sensitive payload
```

---

# 94. SEO

Public pages:

```text
title
description
canonical
OG tags
robots.txt
sitemap
```

Admin:

```text
noindex
```

---

# 95. Accessibility

Wajib:

```text
semantic HTML
input labels
keyboard navigation
visible focus state
sufficient contrast
accessible buttons
image alt
clear validation error
ARIA hanya jika diperlukan
```

---

# 96. Performance

Target:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

Optimasi:

```text
image compression
WebP/AVIF
lazy loading
pagination
database indexes
selective Prisma queries
minimal API payload
frontend code splitting jika berguna
```

---

# 97. Unit Tests

Wajib test:

```text
Haversine distance
Pickup zone selection
Pickup fee
Phone normalization
Money calculation
Actual weight calculation
Booking code generation
Status transition
Slot cutoff
WhatsApp message generation
```

---

# 98. Integration Tests

Wajib test:

```text
Admin bootstrap
Second bootstrap blocked
Login
Logout
Auth me
Create booking
Duplicate booking/idempotency
Track booking
Update status
Update weight
Update payment status
Service management
Pickup management
Settings
```

---

# 99. Concurrency Tests

Wajib test:

```text
Pickup slot capacity = 1

Customer A
Customer B

submit concurrently
```

Expected:

```text
1 booking succeeds
1 receives SLOT_FULL
```

Tidak boleh:

```text
2 successful reservations
```

---

# 100. Security Tests

Test:

```text
SQL injection payload
XSS payload
Invalid JWT
Expired JWT
Unauthorized admin endpoint
Login brute force
Tracking brute force
Upload abuse
Mass assignment
Parameter tampering
Booking duplication
Radius bypass
Price manipulation
Slot capacity bypass
Invalid status transition
Admin bootstrap takeover
```

---

# 101. Development Phase 1 — Foundation

```text
Repository
Frontend
Backend
TypeScript
PostgreSQL
Prisma
ESLint
Prettier
Environment validation
Base API
Error handling
Logging
```

---

# 102. Phase 2 — Database

```text
Admin
Customer
Service
Pickup Zone
Pickup Slot
Booking
Booking Item
Settings
Idempotency
Relations
Indexes
Constraints
Migration
Development Seed
```

---

# 103. Phase 3 — Authentication

```text
Secure bootstrap
Single admin restriction
Argon2id
Login
Logout
JWT
HttpOnly cookie
/me
Auth middleware
Profile
Password change
Rate limiting
Origin protection
```

---

# 104. Phase 4 — Public Website

```text
Landing
Services
Booking wizard
Location
Radius validation
Pickup fee
Scheduled date
Pickup slot
Review
Success page
WhatsApp generator
Tracking
```

---

# 105. Phase 5 — Booking Backend

```text
Booking endpoint
Phone normalization
Customer upsert
Radius calculation
Pickup zone
Pickup fee
Slot capacity
Concurrency protection
Slot cutoff
Booking code
Transaction
Idempotency
Service snapshot
Tracking
```

---

# 106. Phase 6 — Admin

```text
Dashboard
Booking list
Booking detail
Weight input
Scale photo
Billing
Payment status
WhatsApp billing
Order status
Service management
Customer management
Pickup zones
Pickup slots
Settings
Profile
Password
```

---

# 107. Phase 7 — Security Hardening

```text
Helmet
CORS
Rate limiting
Validation
Secure cookie
Authorization
Origin/CSRF protection
Upload security
Mass assignment protection
Error sanitization
Production logging
```

---

# 108. Phase 8 — Testing

```text
Unit
Integration
Concurrency
Security
Responsive
Browser compatibility
Booking workflow
Billing workflow
WhatsApp workflow
Tracking
```

---

# 109. Production Environment

Example:

```text
Frontend:
https://laundry.example.com

Backend:
https://api.laundry.example.com
```

Database:

```text
PostgreSQL
```

HTTPS wajib.

---

# 110. Environment Variables

```env
NODE_ENV=production

PORT=5000

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=

ADMIN_SETUP_TOKEN=

FRONTEND_URL=
CORS_ORIGIN=
COOKIE_DOMAIN=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Environment validation dilakukan saat application startup.

Application harus fail-fast jika critical production secret tidak tersedia.

Secrets tidak masuk Git.

---

# 111. Git

```text
main
develop
feature/*
fix/*
```

Examples:

```text
feature/auth
feature/booking
feature/radius
feature/pickup-capacity
feature/admin-dashboard
feature/services
feature/order-management
```

---

# 112. Clean Code Rules

## Rule 1

Jangan membuat satu file berisi semua logic.

## Rule 2

Business logic berada di service.

## Rule 3

Controller tipis.

## Rule 4

Input validation terpisah.

## Rule 5

Reusable component dibuat ketika benar-benar memiliki pola yang sama.

## Rule 6

Tidak membuat abstraction hanya karena mungkin diperlukan suatu hari.

## Rule 7

Unused code harus dihapus.

## Rule 8

Tidak membuat duplicate business logic frontend/backend.

Backend tetap source of truth.

## Rule 9

Money calculation tidak menggunakan floating point sebagai source of truth.

## Rule 10

Business invariant penting harus dilindungi backend dan database jika memungkinkan.

---

# 113. Feature Modification Rule

Jika fitur berubah:

```text
Analyze Existing Flow
        ↓
Identify Impact
        ↓
Modify Existing Implementation
        ↓
Update Database/API if Required
        ↓
Remove Obsolete Code
        ↓
Update Tests
        ↓
Regression Test
```

Dilarang:

```text
old implementation
+
new implementation
+
temporary workaround permanen
```

---

# 114. API Naming Convention

Gunakan resource plural:

```text
/bookings
/services
/customers
/pickup-slots
/pickup-zones
```

Gunakan HTTP method:

```text
GET
POST
PATCH
DELETE
```

Hindari:

```text
/getBookings
/createBooking
/updateBooking
```

---

# 115. Definition of Done

Feature dianggap selesai hanya jika bagian yang relevan sudah mencakup:

```text
Frontend
Backend
Database
Validation
Authorization
Security
Error Handling
Responsive UI
Testing
```

Selain itu:

```text
unused code
dead code
duplicate code
temporary workaround
```

harus dibersihkan.

---

# 116. Production Launch Checklist

```text
[ ] PostgreSQL production configured
[ ] Production migrations applied
[ ] Development seed disabled
[ ] Initial admin securely initialized
[ ] Bootstrap locked after initialization
[ ] HTTPS active
[ ] Secure cookie active
[ ] Strong JWT secret
[ ] ADMIN_SETUP_TOKEN secured/rotated after bootstrap
[ ] Exact CORS origin
[ ] Origin/CSRF protection verified
[ ] Login rate limit
[ ] Tracking rate limit
[ ] Booking rate limit
[ ] Helmet active
[ ] Object storage configured
[ ] Upload limit active
[ ] File type validation active
[ ] Database backup configured
[ ] Error monitoring configured
[ ] Production logging configured
[ ] Sensitive data excluded from logs
[ ] SEO configured
[ ] robots.txt configured
[ ] Admin noindex
[ ] Mobile customer flow tested
[ ] Mobile admin tested
[ ] Desktop tested
[ ] Radius boundary tested
[ ] Pickup zone boundary tested
[ ] Slot capacity tested
[ ] Concurrent booking tested
[ ] Slot cutoff tested
[ ] Idempotency tested
[ ] WhatsApp URL tested
[ ] Billing calculation tested
[ ] Payment status tested
[ ] Tracking privacy tested
[ ] Authentication tested
[ ] Authorization tested
[ ] Upload security tested
[ ] Production secrets not committed to Git
```

---

# 117. Explicit Non-Goals

Version 2.1 tidak menyediakan:

```text
Customer Login
Customer Registration
Customer Password
Customer Dashboard

Payment Gateway
Payment Webhook
Automatic Payment Verification

Courier API
Live Courier Tracking

Multi-role
Multi-admin workflow
Multi-outlet
Multi-tenancy

Subscription Billing
Loyalty Points
Promo Engine
Complex Inventory

WebSocket
Redis
Kafka
RabbitMQ
GraphQL
Microservices
CQRS
Event Sourcing
```

Feature tersebut hanya ditambahkan jika kebutuhan bisnis nyata muncul.

---

# 118. Core Business Invariants

Sistem tidak boleh melanggar aturan berikut:

```text
1. Backend menentukan harga.

2. Backend menentukan distance.

3. Pickup > maximum radius ditolak.

4. Slot tidak boleh melebihi capacity.

5. Capacity dihitung per slot + scheduled date.

6. Concurrent booking tidak boleh menyebabkan overbooking.

7. Service price lama tidak berubah ketika master price berubah.

8. Booking code harus unique.

9. Customer phone disimpan dalam normalized format.

10. Tracking membutuhkan booking code + phone.

11. Public endpoint tidak dapat mengubah admin-only fields.

12. Status transition harus mengikuti state machine.

13. Final laundry bill berasal dari actual weight.

14. Monetary value disimpan sebagai integer Rupiah.

15. Customer tidak membutuhkan account.

16. Payment dilakukan manual.

17. Booking harus tersimpan sebelum WhatsApp dibuka.

18. Database adalah source of truth.

19. WhatsApp adalah communication channel.

20. Sistem tetap single-outlet dan sederhana.
```

---

# 119. Final Customer Scope

```text
Landing Page
Services
Booking Wizard
Self Drop-Off
Pickup
Smart Location
Configurable Radius
Pickup Zone
Pickup Fee
Scheduled Date
Pickup Slot
Slot Capacity
Booking Reference
WhatsApp Generator
Tracking
```

---

# 120. Final Admin Scope

```text
Secure Initial Admin Bootstrap
Login
Logout
Profile
Password

Dashboard

Booking Management
Customer Management

Actual Weight
Scale Photo
Billing

Payment Status

Order Status
WhatsApp Templates

Services

Pickup Zones
Pickup Slots

Settings
```

---

# 121. Final Infrastructure Scope

```text
React
TypeScript
Vite
Tailwind CSS

Node.js
Express
TypeScript
Zod

Prisma
PostgreSQL

JWT
HttpOnly Cookie

Object Storage

REST API
Modular Monolith
```

---

# 122. Final Business Flow

```text
                     CUSTOMER
                        │
                        ▼
                   OPEN WEBSITE
                        │
                        ▼
                   PILIH SERVICE
                        │
                        ▼
             ┌──────────┴──────────┐
             │                     │
       SELF DROP-OFF             PICKUP
             │                     │
             │                     ▼
             │                INPUT LOCATION
             │                     │
             │                     ▼
             │             BACKEND CALCULATES
             │                  DISTANCE
             │                     │
             │           ┌─────────┴─────────┐
             │           │                   │
             │       WITHIN RADIUS       OUTSIDE
             │           │                   │
             │           ▼                   ▼
             │      PICKUP ZONE          BLOCK PICKUP
             │           │
             │           ▼
             │      SELECT DATE
             │           │
             │           ▼
             │      SELECT SLOT
             │           │
             │           ▼
             │    CAPACITY VALIDATION
             │           │
             └───────────┤
                         ▼
                   REVIEW BOOKING
                         │
                         ▼
                   CREATE BOOKING
                         │
                         ▼
                   STATUS PENDING
                         │
                         ▼
                  BOOKING REFERENCE
                         │
                         ▼
                 GENERATE WHATSAPP
                         │
                         ▼
                   CUSTOMER CHAT
                         │
                         ▼
                  ADMIN CONFIRMS
                         │
                         ▼
                 STATUS CONFIRMED
                         │
                         ▼
                 LAUNDRY RECEIVES
                         │
                         ▼
                      TIMBANG
                         │
                         ▼
                   FOTO TIMBANGAN
                         │
                         ▼
                  INPUT ACTUAL KG
                         │
                         ▼
                BACKEND CALCULATES
                    FINAL BILL
                         │
                         ▼
                WHATSAPP CUSTOMER
                         │
                         ▼
                     PAYMENT
              QRIS / TRANSFER / CASH
                         │
                         ▼
               ADMIN MARKS AS PAID
                         │
                         ▼
                    PROCESSING
                         │
                         ▼
                       READY
                         │
                         ▼
                PICKUP / DELIVERY
                         │
                         ▼
                    COMPLETED
```

---

# 123. Final Architecture Decision

Sistem ini bukan e-commerce laundry.

Sistem adalah:

> **Smart Booking + WhatsApp Workflow + Simple Laundry Order Management untuk satu outlet.**

Prinsip akhirnya:

```text
Simple for customer
Simple for staff
Backend-controlled business rules
Database as source of truth
WhatsApp-first communication
No unnecessary infrastructure
No unnecessary accounts
No unnecessary automation
No overengineering
```

Target akhir:

> Customer dapat melakukan booking dalam beberapa langkah melalui HP, lalu melanjutkan komunikasi melalui WhatsApp. Staf laundry dapat mengelola pickup, menerima cucian, mencatat berat, menghasilkan tagihan, mencatat pembayaran, dan memperbarui status order hanya dengan beberapa klik.

---

# 124. Development Priority

Urutan prioritas ketika terjadi trade-off:

```text
1. Data correctness
2. Security
3. Operational simplicity
4. Customer usability
5. Reliability
6. Performance
7. Visual polish
8. Future extensibility
```

Future extensibility tidak boleh mengorbankan kesederhanaan v1.

---

# 125. Source of Truth Rule

Dokumen PRD versi **2.1.0** ini menggantikan rule yang bertentangan dari versi sebelumnya.

Jika implementasi berbeda dengan PRD:

```text
PRD
↓
Business Invariant
↓
Database Constraint
↓
Backend Service
↓
API
↓
Frontend
```

harus diperiksa secara berurutan.

Frontend tidak boleh digunakan untuk mengakali business invariant backend.

---

# 126. Final Definition

**Laundry Booking & Order Management System v2.1.0**

adalah production-oriented single-outlet laundry system dengan:

```text
Guest Booking
Smart Pickup Radius
Distance-based Pickup Fee
Pickup Slot Batching
Capacity Protection
Concurrency Protection
WhatsApp Workflow
Customer Database
Actual Weight Billing
Scale Photo
Manual Payment Tracking
Order Status Management
Private Guest Tracking
Secure Single Admin
PostgreSQL Source of Truth
Modular Monolith Architecture
```

tanpa kompleksitas yang tidak dibutuhkan oleh laundry UMKM.