@echo off
chcp 65001 >nul
echo ========================================================
echo   💈 กำลังเปิดระบบจองคิวร้านตัดผมและเตรียมการอัตโนมัติ...
echo ========================================================

REM 1. คัดลอกโค้ด Code.gs ลงใน Clipboard ทันที (พร้อมกด Ctrl+V วางได้เลย)
powershell.exe -NoProfile -Command "Get-Content -Path '%~dp0Code.gs' -Raw -Encoding UTF8 | Set-Clipboard"
echo [OK] โค้ด Backend (Code.gs) ถูกคัดลอกลงใน Clipboard เรียบร้อยแล้ว! (กด Ctrl + V วางได้ทันที)

REM 2. เปิดหน้าสร้าง Google Apps Script ทันที
start https://script.google.com/create

REM 3. เปิดโฟลเดอร์ Google Drive ปลายทาง
start https://drive.google.com/drive/u/0/folders/1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O

REM 4. เปิดหน้าเว็บจองคิว HTML
start "" "%~dp0index.html"

echo ========================================================
echo   เปิดหน้าต่างที่จำเป็นทั้งหมดเรียบร้อยแล้ว!
echo ========================================================
