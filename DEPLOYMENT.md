# AYAZ MÜHENDİSLİK - CANLI SUNUCUYA ALMA VE ALAN ADI BAĞLAMA REHBERİ

Bu kılavuz, projenizi canlı bir sunucuya (VPS / Ubuntu / Debian / Docker) aktararak kendi alan adınıza (`ayazmuhendislik.com` vb.) bağlamanız ve canlı sunucu üzerinden doğrudan düzenlemeler yapabilmeniz için adım adım hazırlanmıştır.

---

## 🧭 Genel Mimari

```
[ Alan Adı (DNS: A Kaydı) ]
           │
           ▼
[ Nginx Reverse Proxy (Port 80/443 SSL) ]
           │
           ▼
[ Node.js Production Server (Port 3000) ]
   ├── Frontend (HTML5, Tailwind, 3D Canvas, Galeri)
   └── Backend API (/api/rfq, /api/health, quotes.json arşivi)
```

---

## ADIM 1: Alan Adı (DNS) Yönlendirmesi

Alan adı firmanızın (GoDaddy, Natro, İsimtescil, Cloudflare vb.) DNS yönetim paneline girin:

1. **A Kaydı (Root):**
   * **Ad:** `@` (veya boş)
   * **Tip:** `A`
   * **Değer / Hedef IP:** `SUNUCUNUZUN_STATIK_IP_ADRESI`
   * **TTL:** `Otomatik` veya `300` sn
2. **A Kaydı (WWW):**
   * **Ad:** `www`
   * **Tip:** `CNAME` veya `A`
   * **Değer:** `@` veya `SUNUCUNUZUN_STATIK_IP_ADRESI`

*(DNS yönlendirmesinin tüm dünyada oturması 5 - 30 dakika sürebilir).*

---

## ADIM 2: Sunucuya Dosyaları Yükleme

Yerel bilgisayarınızdaki `ayaz-muhendislik` klasörünü sunucunuza aktarın. Örneğin SCP veya Git ile:

```bash
# SCP ile sunucuya yükleme örneği:
scp -r ./ayaz-muhendislik root@SUNUCU_IP_ADRESI:/var/www/ayaz-muhendislik
```

Sunucunuza SSH ile bağlanın:
```bash
ssh root@SUNUCU_IP_ADRESI
cd /var/www/ayaz-muhendislik
```

---

## ADIM 3: Dağıtım Seçeneği A (Önerilen: PM2 + Nginx)

Sunucunuzda Node.js yüklü ise:

### 1. Uygulamayı Başlatma (PM2 ile)
```bash
# PM2 yoksa kurun:
npm install -g pm2

# Ayaz Mühendislik sunucusunu başlatın:
pm2 start ecosystem.config.cjs

# Sunucu yeniden başlatıldığında otomatik açılması için:
pm2 save
pm2 startup
```

Uygulamanız arka planda `http://127.0.0.1:3000` portunda kesintisiz çalışacaktır.

### 2. Nginx ve Ücretsiz SSL (Let's Encrypt) Kurulumu
```bash
# Nginx ve Certbot kurulumu:
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Nginx ayar dosyasını kopyalayın:
sudo cp nginx.conf /etc/nginx/sites-available/ayazmuhendislik.com

# Dosyayı açıp alan adınızı güncelleyin (ayazmuhendislik.com yerine kendi alan adınız):
sudo nano /etc/nginx/sites-available/ayazmuhendislik.com

# Siteyi aktif edin ve Nginx'i yeniden başlatın:
sudo ln -s /etc/nginx/sites-available/ayazmuhendislik.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Tek komutla SSL sertifikası alın:
sudo certbot --nginx -d ayazmuhendislik.com -d www.ayazmuhendislik.com
```

---

## ADIM 4: Dağıtım Seçeneği B (Docker / Docker Compose ile)

Docker ve Docker Compose kullanıyorsanız, tek bir komutla canlıya alabilirsiniz:

```bash
cd /var/www/ayaz-muhendislik
docker compose up -d --build
```

`docker-compose.yml` içinde `index.html`, `css/` ve `js/` klasörleri volume olarak bağlı olduğu için, sunucuda yapılan değişiklikler konteyneri baştan derlemeden **anında canlıya yansır**.

---

## 🛠️ Canlı Sunucu Üzerinde Düzeltme Yapma Rehberi

Canlıya aldıktan sonra metin, fiyat, görsel veya teknik özellikleri değiştirmek istediğinizde:

1. **HTML veya Metin Değişikliği:**
   ```bash
   nano /var/www/ayaz-muhendislik/index.html
   ```
   Kaydedip çıktığınız anda (`Ctrl + O`, `Enter`, `Ctrl + X`) ziyaretçiler anında yeni metinleri görür (Sayfa yenilendiğinde).

2. **Stil veya Animasyon Değişikliği:**
   ```bash
   nano /var/www/ayaz-muhendislik/css/style.css
   ```

3. **Hesaplayıcı veya JS Mantığı:**
   ```bash
   nano /var/www/ayaz-muhendislik/js/app.js
   ```

4. **Gelen Teklifleri (RFQ) İnceleme:**
   Web sitesi üzerinden form dolduran müşterilerin teklif talepleri sunucuda arşivlenir:
   ```bash
   cat /var/www/ayaz-muhendislik/data/quotes.json
   ```

5. **Backend Server Mantığını Değiştirdiğinizde (Yeniden Başlatma):**
   ```bash
   pm2 restart ayaz-muhendislik-app
   # veya Docker kullanıyorsanız:
   docker compose restart
   ```

---

## 🔒 Güvenlik ve Canlı Durum Doğrulaması

Sunucunuzun çalıştığını kontrol etmek için:
```bash
curl http://127.0.0.1:3000/api/health
```

Beklenen çıktı:
```json
{
  "status": "UP",
  "uptime": 1284.5,
  "service": "Ayaz Mühendislik Production Platform"
}
```
