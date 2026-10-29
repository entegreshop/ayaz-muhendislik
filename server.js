/**
 * AYAZ MÜHENDİSLİK - Production HTTP & RFQ API Server
 * Zero-dependency, ultra-fast Node.js server with Gzip compression,
 * security headers, static asset caching, and Quote (RFQ) persistence.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const activeAdminTokens = new Set();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(QUOTES_FILE)) {
  fs.writeFileSync(QUOTES_FILE, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
    phone: "+90 542 431 45 72",
    phone_mobile: "+90 542 431 45 72",
    whatsapp: "905424314572",
    email: "info@ayazmuhendislik.com",
    address: "Merkez Mah. Merter Sok. No:43 Güngören/İstanbul",
    hero_title: "Soğutma Hatlarında Kusursuz İzolasyon, Maksimum Enerji Verimliliği.",
    hero_subtitle: "Endüstriyel tesisler, soğuk hava depoları ve merkezi chiller santrallerinde sıfır yoğuşma garantili, termografik kaçak test onaylı elastomerik kauçuk ve hassas pres alüminyum sac kaplama (jacketing) mühendisliği.",
    admin_password: "ayazadmin2026"
  }, null, 2), 'utf-8');
}

function getSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function updateSettingsFile(newSettings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Security Headers
function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// Parse JSON Body Helper
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1024 * 1024) { // 1MB limit
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Save Quote to Storage
async function saveQuote(quoteData) {
  try {
    let quotes = [];
    if (fs.existsSync(QUOTES_FILE)) {
      const raw = fs.readFileSync(QUOTES_FILE, 'utf-8');
      quotes = JSON.parse(raw || '[]');
    }
    quotes.unshift(quoteData); // Add to beginning
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Storage Error] Failed to save quote:', err);
    return false;
  }
}

// Main Request Handler
const server = http.createServer(async (req, res) => {
  applySecurityHeaders(res);

  // CORS Headers for API calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // -----------------------------------------------------------
  // API ROUTE: Healthcheck
  // -----------------------------------------------------------
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Ayaz Mühendislik Production Platform'
    }));
    return;
  }

  // -----------------------------------------------------------
  // API ROUTE: RFQ (Request for Quote & Discovery)
  // -----------------------------------------------------------
  if (pathname === '/api/rfq' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const { name, company, phone, service, length, location, notes } = payload;

      if (!name || !phone) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Ad Soyad ve Telefon alanları zorunludur.'
        }));
        return;
      }

      // Generate Unique Ticket Reference
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      const ticketRef = `AYAZ-MÜH-${randomHex}`;

      const quoteRecord = {
        id: crypto.randomUUID(),
        ticket: ticketRef,
        createdAt: new Date().toISOString(),
        clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        name,
        company: company || 'Belirtilmedi',
        phone,
        service: service || 'Chiller ve Soğutma Grubu Boru İzolasyonu',
        estimatedLength: length || 'Belirtilmedi',
        location: location || 'Belirtilmedi',
        notes: notes || ''
      };

      await saveQuote(quoteRecord);
      console.log(`[RFQ Received] Ticket: ${ticketRef} | Customer: ${name} (${company || 'Bireysel'}) | Phone: ${phone}`);

      // Prepare WhatsApp Direct URL
      const waText = encodeURIComponent(
        `Merhaba Ayaz Mühendislik,\nWeb siteniz üzerinden yeni teklif/keşif talebi oluşturuldu.\nReferans: ${ticketRef}\nYetkili: ${name}\nFirma: ${company || '-'}\nTel: ${phone}\nHizmet: ${service || '-'}\nMetraj: ${length || '-'}\nLokasyon: ${location || '-'}\nNot: ${notes || '-'}`
      );
      // Read dynamic whatsapp from settings
      const settings = getSettings();
      const targetWa = (settings.whatsapp || '905424314572').replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${targetWa}?text=${waText}`;

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        ticket: ticketRef,
        message: 'Talebiniz başarıyla kaydedildi. Mühendislerimiz 2 saat içinde inceleyecektir.',
        whatsappUrl
      }));
    } catch (err) {
      console.error('[API Error] /api/rfq failed:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Sunucu hatası oluştu.' }));
    }
    return;
  }

  // -----------------------------------------------------------
  // ROUTE: Admin Dashboard Page
  // -----------------------------------------------------------
  if (pathname === '/admin' || pathname === '/admin/') {
    const adminPath = path.join(__dirname, 'admin.html');
    fs.readFile(adminPath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Admin HTML not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  // Helper: Verify Admin Token
  function verifyAdmin(req) {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    return activeAdminTokens.has(token);
  }

  // -----------------------------------------------------------
  // API ROUTE: Admin Login
  // -----------------------------------------------------------
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const settings = getSettings();
      const expectedPassword = settings.admin_password || process.env.ADMIN_PASSWORD || 'ayazadmin2026';

      if (payload.password === expectedPassword) {
        const token = crypto.randomBytes(24).toString('hex');
        activeAdminTokens.add(token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, token }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Hatalı şifre.' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Sunucu hatası.' }));
    }
    return;
  }

  // -----------------------------------------------------------
  // API ROUTE: Admin Quotes (List & Delete)
  // -----------------------------------------------------------
  if (pathname === '/api/admin/quotes' && req.method === 'GET') {
    if (!verifyAdmin(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Yetkisiz erişim.' }));
      return;
    }
    try {
      const quotes = JSON.parse(fs.readFileSync(QUOTES_FILE, 'utf-8') || '[]');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, quotes }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Kayıtlar okunamadı.' }));
    }
    return;
  }

  if (pathname.startsWith('/api/admin/quotes/') && req.method === 'DELETE') {
    if (!verifyAdmin(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Yetkisiz erişim.' }));
      return;
    }
    const idToDelete = pathname.split('/').pop();
    try {
      let quotes = JSON.parse(fs.readFileSync(QUOTES_FILE, 'utf-8') || '[]');
      quotes = quotes.filter(q => q.id !== idToDelete);
      fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Silinemedi.' }));
    }
    return;
  }

  // -----------------------------------------------------------
  // API ROUTE: Admin Settings (Get & Update)
  // -----------------------------------------------------------
  if (pathname === '/api/admin/settings' && req.method === 'GET') {
    if (!verifyAdmin(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Yetkisiz erişim.' }));
      return;
    }
    const s = getSettings();
    const safeSettings = { ...s };
    delete safeSettings.admin_password; // Never expose password in GET
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, settings: safeSettings }));
    return;
  }

  if (pathname === '/api/admin/settings' && req.method === 'POST') {
    if (!verifyAdmin(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Yetkisiz erişim.' }));
      return;
    }
    try {
      const payload = await parseJsonBody(req);
      const current = getSettings();
      const updated = {
        ...current,
        phone: payload.phone || current.phone,
        phone_mobile: payload.phone_mobile || current.phone_mobile,
        whatsapp: payload.whatsapp || current.whatsapp,
        email: payload.email || current.email,
        address: payload.address || current.address,
        hero_title: payload.hero_title || current.hero_title,
        hero_subtitle: payload.hero_subtitle || current.hero_subtitle
      };
      if (payload.new_password) {
        updated.admin_password = payload.new_password;
      }
      updateSettingsFile(updated);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Ayarlar güncellendi.' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Ayarlar güncellenemedi.' }));
    }
    return;
  }

  // Public Settings API for frontend sync
  if (pathname === '/api/settings' && req.method === 'GET') {
    const s = getSettings();
    const safeSettings = { ...s };
    delete safeSettings.admin_password;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(safeSettings));
    return;
  }

  // -----------------------------------------------------------
  // STATIC ASSET SERVING WITH CACHING & GZIP
  // -----------------------------------------------------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);

  // Security check: ensure path is within directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA routing if requested, or 404
      if (pathname.startsWith('/api/')) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
      } else {
        // Return index.html for smooth client navigation or 404
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Sayfa Bulunamadı</h1><p><a href="/">Ana Sayfaya Dön</a></p>');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Caching Strategy
    if (ext === '.html' || ext === '.js') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable'); // 30 days
    } else if (ext === '.css') {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    }

    // Gzip Compression for text, css, js, json, svg
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const compressible = ['.html', '.css', '.js', '.json', '.svg', '.txt'].includes(ext);

    if (compressible && acceptEncoding.includes('gzip')) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip'
      });
      const rawStream = fs.createReadStream(filePath);
      const gzipStream = zlib.createGzip();
      rawStream.pipe(gzipStream).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': stats.size });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(' AYAZ MÜHENDİSLİK - CANLI PRODUCTION PLATFORMU');
  console.log(` Sunucu Aktif: http://${HOST}:${PORT}`);
  console.log(` API Endpoint: http://${HOST}:${PORT}/api/rfq`);
  console.log(` Sağlık Kontrolü: http://${HOST}:${PORT}/api/health`);
  console.log('====================================================');
});

// Process Exit Handling
process.on('SIGTERM', () => {
  console.log('[System] SIGTERM sinyali alındı, sunucu kapatılıyor...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[System] SIGINT sinyali alındı, sunucu kapatılıyor...');
  server.close(() => process.exit(0));
});
