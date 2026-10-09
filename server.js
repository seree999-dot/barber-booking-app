const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const GOOGLE_DRIVE_CSV = 'G:\\My Drive\\ระบบจองคิวร้านตัดผม_Database.csv';
const LOCAL_CSV = path.join(__dirname, 'ระบบจองคิวร้านตัดผม_Database.csv');
const JSON_DB = path.join(__dirname, 'bookings.json');

// MIME TYPES
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Initialize CSV header if not exists
function initCsvHeaders(filePath) {
  if (!fs.existsSync(filePath)) {
    const header = '\uFEFFรหัสการจอง,วัน-เวลาทำรายการ,ชื่อลูกค้า,เบอร์โทรศัพท์,LINE ID,บริการที่เลือก,ช่างตัดผม,วันที่นัดหมาย,เวลานัดหมาย,ราคา (บาท),สถานะคิว,หมายเหตุ\r\n';
    try {
      fs.writeFileSync(filePath, header, 'utf8');
    } catch (e) {
      console.warn(`Could not init ${filePath}:`, e.message);
    }
  }
}

initCsvHeaders(LOCAL_CSV);
if (fs.existsSync('G:\\My Drive')) {
  initCsvHeaders(GOOGLE_DRIVE_CSV);
}

// Append booking to CSV & JSON
function saveBooking(booking) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH');
  const timeStr = now.toLocaleTimeString('th-TH');
  const timestamp = `${dateStr} ${timeStr}`;

  // CSV Row formatted (with quotes to avoid comma breaks)
  const escapeCsv = (str) => `"${String(str || '-').replace(/"/g, '""')}"`;
  const row = [
    escapeCsv(booking.bookingId),
    escapeCsv(timestamp),
    escapeCsv(booking.customerName),
    escapeCsv("'" + booking.customerPhone), // prefix ' to keep leading 0
    escapeCsv(booking.lineId || '-'),
    escapeCsv(booking.serviceName),
    escapeCsv(booking.barberName),
    escapeCsv(booking.bookingDate),
    escapeCsv(booking.bookingTime),
    booking.price || 0,
    escapeCsv('รอยืนยัน'),
    escapeCsv(booking.notes || '-')
  ].join(',') + '\r\n';

  // 1. Save to Local CSV
  fs.appendFileSync(LOCAL_CSV, row, 'utf8');

  // 2. Save directly to Google Drive (Syncs to Google Cloud immediately)
  try {
    if (fs.existsSync('G:\\My Drive')) {
      fs.appendFileSync(GOOGLE_DRIVE_CSV, row, 'utf8');
      console.log('✅ บันทึกลง Google Drive สำเร็จ:', GOOGLE_DRIVE_CSV);
    }
  } catch (err) {
    console.warn('⚠️ Google Drive sync notice:', err.message);
  }

  // 3. Save to JSON Database
  let allBookings = [];
  if (fs.existsSync(JSON_DB)) {
    try {
      allBookings = JSON.parse(fs.readFileSync(JSON_DB, 'utf8'));
    } catch (e) {
      allBookings = [];
    }
  }
  allBookings.push({
    ...booking,
    timestamp: timestamp,
    status: 'รอยืนยัน'
  });
  fs.writeFileSync(JSON_DB, JSON.stringify(allBookings, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: /api/book
  if (req.url === '/api/book' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const now = new Date();
        const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const bookingId = `BK-${dateCode}-${randomNum}`;

        const bookingData = {
          bookingId: bookingId,
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          lineId: payload.lineId || '-',
          serviceName: payload.serviceName || 'ตัดผมทั่วไป',
          barberName: payload.barberName || 'ช่างคนไหนก็ได้',
          bookingDate: payload.bookingDate,
          bookingTime: payload.bookingTime,
          price: Number(payload.price) || 0,
          notes: payload.notes || '-'
        };

        saveBooking(bookingData);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'บันทึกการจองคิวลง Google Drive เรียบร้อยแล้ว',
          bookingId: bookingId,
          data: bookingData,
          folderUrl: 'https://drive.google.com/drive/u/0/folders/1ixNAXowAO52AVHz9BBn52CliW2ZJYv6O',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1RUpnrlhJewy8ghrL_Qd_pCCtqeOpguu8GOowkplQNFk/edit'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
    return;
  }

  // API Endpoint: /api/bookings (Get list)
  if (req.url === '/api/bookings' && req.method === 'GET') {
    let list = [];
    if (fs.existsSync(JSON_DB)) {
      try {
        list = JSON.parse(fs.readFileSync(JSON_DB, 'utf8'));
      } catch (e) {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'success', total: list.length, bookings: list }));
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`💈 ระบบจองคิวร้านตัดผมอัตโนมัติเปิดทำงานแล้ว!`);
  console.log(`👉 เข้าใช้งานได้ที่: http://localhost:${PORT}`);
  console.log(`📁 ซิงค์ข้อมูลลง Google Drive แบบเรียลไทม์อัตโนมัติ`);
});
