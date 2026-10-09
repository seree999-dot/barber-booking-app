/**
 * =========================================================================
 * ระบบจองคิวร้านตัดผมอัตโนมัติ (Barber Shop Automated Booking System)
 * เชื่อมต่อ Google Sheet ID: 1RUpnrlhJewy8ghrL_Qd_pCCtqeOpguu8GOowkplQNFk
 * โฟลเดอร์ Google Drive: 1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O
 * =========================================================================
 */

// รหัส Google Sheet ที่สร้างไว้
const SPREADSHEET_ID = "1RUpnrlhJewy8ghrL_Qd_pCCtqeOpguu8GOowkplQNFk";
const TARGET_FOLDER_ID = "1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O";
const SHEET_NAME = "รายการจองคิว";

/**
 * 1. ฟังก์ชันตั้งค่าและจัดรูปแบบ Google Sheet อัตโนมัติ
 * กดปุ่ม "เรียกใช้" (Run) ที่ฟังก์ชันนี้ได้ทันที
 */
function setupDatabase() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // ตั้งชื่อไฟล์สเปรดชีตให้สวยงาม
    spreadsheet.rename("ระบบจองคิวร้านตัดผม_Database");

    // ตรวจสอบแผ่นงาน
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.getActiveSheet();
      sheet.setName(SHEET_NAME);
    }

    // กำหนดหัวตาราง (Headers)
    const headers = [
      ["รหัสการจอง", "วัน-เวลาที่ทำรายการ", "ชื่อลูกค้า", "เบอร์โทรศัพท์", "LINE ID", "บริการ", "ช่างตัดผม", "วันที่นัดหมาย", "เวลานัดหมาย", "ราคา (บาท)", "สถานะคิว", "หมายเหตุเพิ่มเติม"]
    ];

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    } else {
      // เขียนทับแถวแรกเพื่อให้แน่ใจว่าหัวตารางถูกต้อง
      sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    }

    // ตกแต่ง Header (สี Slate-800 พรีเมียม, อักษรสีขาว ตัวหนา กึ่งกลาง)
    const headerRange = sheet.getRange(1, 1, 1, headers[0].length);
    headerRange.setBackground("#1E293B");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1);

    // กำหนดความกว้างคอลัมน์ให้อ่านง่าย
    const colWidths = [150, 160, 160, 130, 120, 190, 140, 130, 110, 110, 130, 200];
    for (let i = 0; i < colWidths.length; i++) {
      sheet.setColumnWidth(i + 1, colWidths[i]);
    }

    // สร้าง Dropdown คอลัมน์สถานะคิว (คอลัมน์ K)
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["รอยืนยัน", "ยืนยันแล้ว", "เสร็จสิ้น", "ยกเลิก"], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange("K2:K1000").setDataValidation(statusRule);

    // จัดตำแหน่งข้อมูลในแต่ละคอลัมน์
    sheet.getRange("A2:A1000").setHorizontalAlignment("center");
    sheet.getRange("B2:B1000").setHorizontalAlignment("center");
    sheet.getRange("D2:D1000").setHorizontalAlignment("center");
    sheet.getRange("H2:I1000").setHorizontalAlignment("center");
    sheet.getRange("J2:J1000").setHorizontalAlignment("right");
    sheet.getRange("K2:K1000").setHorizontalAlignment("center");

    const url = spreadsheet.getUrl();
    Logger.log("✅ ติดตั้งและจัดรูปแบบ Google Sheet สำเร็จเรียบร้อยแล้ว!");
    Logger.log("🔗 ลิงก์ Google Sheet: " + url);

    return {
      status: "success",
      message: "ติดตั้งระบบฐานข้อมูลสำเร็จ",
      sheetUrl: url
    };
  } catch (error) {
    Logger.log("❌ Error in setupDatabase: " + error.toString());
    throw error;
  }
}

/**
 * 2. รับคำขอจองคิวจากหน้าเว็บ (POST) และบันทึกลง Google Sheet ทันที
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    if (!data.customerName || !data.customerPhone || !data.bookingDate || !data.bookingTime) {
      return createJsonResponse({
        status: "error",
        message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน"
      });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.getActiveSheet();
    }

    // สร้างรหัสการจอง
    const now = new Date();
    const dateStr = Utilities.formatDate(now, "GMT+7", "yyyyMMdd");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = "BK-" + dateStr + "-" + randomSuffix;
    const timestampFormatted = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss");

    // แถวข้อมูลใหม่
    const newRow = [
      bookingId,
      timestampFormatted,
      data.customerName,
      "'" + String(data.customerPhone),
      data.lineId || "-",
      data.serviceName || "ตัดผมทั่วไป",
      data.barberName || "ช่างคนไหนก็ได้",
      data.bookingDate,
      data.bookingTime,
      Number(data.price) || 0,
      "รอยืนยัน",
      data.notes || "-"
    ];

    sheet.appendRow(newRow);

    const lastRow = sheet.getLastRow();
    sheet.setRowHeight(lastRow, 30);

    return createJsonResponse({
      status: "success",
      message: "บันทึกการจองคิวลง Google Sheet สำเร็จเรียบร้อยแล้ว",
      bookingId: bookingId,
      customerName: data.customerName,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      serviceName: data.serviceName,
      barberName: data.barberName,
      price: data.price,
      sheetUrl: spreadsheet.getUrl(),
      folderUrl: "https://drive.google.com/drive/u/0/folders/" + TARGET_FOLDER_ID
    });

  } catch (err) {
    Logger.log("Error: " + err.toString());
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * 3. รับคำขอ GET (สำหรับทดสอบ หรือเปิดดูหน้า Web App)
 */
function doGet(e) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  try {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('ระบบจองคิวร้านตัดผม | Barber Booking')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return HtmlService.createHtmlOutput(
      "<div style='font-family: sans-serif; padding: 24px;'>" +
      "<h2>💈 ระบบจองคิวร้านตัดผม เชื่อมต่อกับ Google Sheet สำเร็จแล้ว!</h2>" +
      "<p>📄 <strong>Google Sheet URL:</strong> <a href='" + spreadsheet.getUrl() + "' target='_blank'>" + spreadsheet.getUrl() + "</a></p>" +
      "<p>📁 <strong>Google Drive:</strong> <a href='https://drive.google.com/drive/u/0/folders/" + TARGET_FOLDER_ID + "' target='_blank'>เปิดโฟลเดอร์ Google Drive</a></p>" +
      "</div>"
    );
  }
}

function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
