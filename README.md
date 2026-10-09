# 💈 ระบบจองคิวร้านตัดผมออนไลน์ (Barber Shop Booking System)

ระบบจองคิวร้านตัดผมอัตโนมัติ ออกแบบด้วย UI ทันสมัย สไตล์ Gentleman & Vintage Barber เชื่อมต่อกับ **Google Apps Script** และบันทึกข้อมูลเข้า **Google Sheet** ในโฟลเดอร์ Google Drive ที่กำหนดไว้โดยอัตโนมัติ

---

## 📌 ข้อมูลการเชื่อมต่อและลิงก์ระบบ

| รายการ | ลิงก์ / รายละเอียด |
| :--- | :--- |
| **📁 โฟลเดอร์ Google Drive** | [เปิดโฟลเดอร์ Google Drive (1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O)](https://drive.google.com/drive/u/0/folders/1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O) |
| **⚡ Google Apps Script Console** | [https://script.google.com/home](https://script.google.com/home) |
| **📄 ไฟล์ Frontend** | `index.html` (เปิดใช้งานในเบราว์เซอร์ได้ทันที) |
| **⚙️ ไฟล์ Backend** | `Code.gs` (สคริปต์ Google Apps Script) |
| **📋 ฐานข้อมูล Google Sheet** | สร้างให้อัตโนมัติในโฟลเดอร์ด้านบน ชื่อไฟล์: `ระบบจองคิวร้านตัดผม_Database` |

---

## 🚀 ฟังก์ชันการทำงานหลัก

1. **หน้าเว็บจองคิว (Frontend HTML)**:
   - ออกแบบด้วย **Tailwind CSS + Font Prompt** ธีม Dark Luxury & Gold
   - **เลือกบริการ**: ตัดผมวินเทจ, สระ-ไดร์-เซ็ตทรง, โกนหนวดสปาผ้าร้อน, ดัดผมวอลลุ่มเกาหลี, ย้อมสีผม, VIP Full Course
   - **เลือกช่างตัดผม**: ช่างเอก (Master), ช่างท็อป (Fade), ช่างบาส (Styling & Perm) หรือระบบเลือกให้อัตโนมัติ
   - **เลือกวันและเวลา**: ปุ่มลัด วันนี้ / พรุ่งนี้ / มะรืนนี้ พร้อมปฏิทินเลือกวันล่วงหน้า และรอบเวลาตั้งแต่ 10:00 - 19:00 น.
   - **ระบบสรุปและคำนวณราคาแบบเรียลไทม์**
   - **บัตรคิวดิจิทัล (Digital Ticket Slip)** พร้อมพิมพ์หรือบันทึกได้ทันที

2. **ระบบจัดการอัตโนมัติ (Google Apps Script Backend - `Code.gs`)**:
   - ตรวจสอบโฟลเดอร์ Google Drive `1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O` อัตโนมัติ
   - **สร้างไฟล์ Google Sheet ให้อัตโนมัติ** หากยังไม่มีไฟล์
   - จัดรูปแบบ Header สี Slate Blue เข้ม, ตัวหนา, Freeze แถวแรก, จัดขนาดคอลัมน์อัตโนมัติ
   - สร้าง Dropdown คอลัมน์ **สถานะคิว** (`รอยืนยัน`, `ยืนยันแล้ว`, `เสร็จสิ้น`, `ยกเลิก`)
   - ป้องกันการบันทึกคิวชนกันด้วย **Script Lock**
   - รองรับทั้งการเรียก API ภายนอก (CORS) และการเปิดเป็น Web App โดยตรง

---

## 🛠️ ขั้นตอนการ Deploy ผ่าน https://script.google.com/home

### ขั้นตอนที่ 1: สร้างโปรเจกต์ใน Google Apps Script
1. ไปที่ลิงก์ [https://script.google.com/home](https://script.google.com/home)
2. กดปุ่ม **"โครงการใหม่" (New Project)** ทางด้านซ้ายบน
3. ตั้งชื่อโครงการ เช่น `Barber-Booking-System`

### ขั้นตอนที่ 2: วางโค้ด Backend (`Code.gs`)
1. ในหน้าต่าง `Code.gs` ให้ลบโค้ดเดิมออกทั้งหมด
2. คัดลอกโค้ดจากไฟล์ `Code.gs` ในโปรเจกต์นี้มาวาง
3. กดปุ่ม **บันทึก (Ctrl + S)**

*(ทางเลือก: หากต้องการให้เปิดหน้าเว็บผ่าน Google Apps Script โดยตรงได้ทันที ให้กดเครื่องหมาย `+` ข้าง "ไฟล์" > เลือก **HTML** > ตั้งชื่อว่า `index` > คัดลอกโค้ดจาก `index.html` ทั้งหมดมาวาง)*

### ขั้นตอนที่ 3: สั่งสร้าง Google Sheet อัตโนมัติ (ครั้งแรก)
1. ในแถบเครื่องมือด้านบน เลือกฟังก์ชัน **`setupDatabase`**
2. กดปุ่ม **"เรียกใช้" (Run)**
3. Google จะขอสิทธิ์การเข้าถึง (Authorization):
   - กด **ตรวจสอบสิทธิ์ (Review Permissions)**
   - เลือกบัญชี Google ของท่าน
   - กด **ขั้นสูง (Advanced)** > กด **ไปที่ Barber-Booking-System (ไม่ปลอดภัย) / Go to ... (unsafe)**
   - กด **อนุญาต (Allow)**
4. ระบบจะทำการสร้างไฟล์ Google Sheet ชื่อ `ระบบจองคิวร้านตัดผม_Database` ในโฟลเดอร์ Google Drive: [1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O](https://drive.google.com/drive/u/0/folders/1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O) ทันที!

### ขั้นตอนที่ 4: การ Deploy เป็น Web App
1. กดปุ่มสีน้ำเงิน **"การทำให้ใช้งานได้" (Deploy)** ด้านบนขวา > เลือก **"การทำให้ใช้งานได้รายการใหม่" (New deployment)**
2. คลิกไอคอนรูปฟันเฟือง ⚙️ ด้านซ้าย > เลือก **"เว็บแอป" (Web app)**
3. กำหนดค่าดังนี้:
   - **คำอธิบาย (Description):** `Barber Booking v1.0`
   - **ดำเนินการในฐานะ (Execute as):** `ฉัน (Me - your email)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(สำคัญมาก เพื่อให้ลูกค้าสามารถจองคิวได้)*
4. กด **"การทำให้ใช้งานได้" (Deploy)**
5. ท่านจะได้รับ **URL เว็บแอป (Web App URL)** เช่น:
   `https://script.google.com/macros/s/AKfycb.../exec`

### ขั้นตอนที่ 5: นำ Web App URL ไปใส่ในหน้าเว็บ
1. เปิดไฟล์ `index.html` ในเบราว์เซอร์
2. กดปุ่ม **"ตั้งค่า Web App API"** ที่แถบด้านบน
3. นำ URL ที่ได้จากขั้นตอนที่ 4 มาวาง แล้วกด **"บันทึกการตั้งค่า"**
4. ทุกครั้งที่มีการจองคิว ข้อมูลจะถูกส่งตรงเข้าสู่ Google Sheet ทันที!
