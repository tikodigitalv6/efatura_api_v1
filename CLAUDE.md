# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje Hakkında

Bu bir E-Fatura ve E-Arşiv API projesidir. AdonisJS framework'ü kullanılarak TypeScript ile geliştirilmiştir. GİB (Gelir İdaresi Başkanlığı) entegrasyonları, SOAP servisleri ve XML işlemleri içerir.

## Temel Komutlar

### Geliştirme
```bash
# Uygulamayı development modda başlat (auto-reload ile)
npm run dev

# Production için build al
npm run build

# Production modda başlat
npm start
```

### Rotaları Listele
```bash
node ace list:routes
```

### REPL (Interactive Console)
```bash
node ace repl
```

## Mimari Yapı

### Dizin Yapısı
- `app/Controllers/Http/` - HTTP controller'ları (SoapsController, EarsivsController, GibsController vb.)
- `app/Validators/` - Request validation sınıfları
- `app/Middleware/` - Token middleware
- `config/` - Uygulama konfigürasyonları
- `start/routes.ts` - Tüm API rotaları
- `public/` - XML şablonları ve JSON kod listeleri

### Ana Servisler

#### E-Fatura Servisleri
- Login/Logout
- Mükellef sorgulama ve listeleme
- Fatura gönderme, listeleme, görüntüleme
- Taslak yönetimi
- Fatura kabul/red işlemleri

#### E-Arşiv Servisleri
- E-Arşiv fatura kesme
- Fatura listeleme ve sorgulama
- Fatura indirme ve iptal

#### GİB Entegrasyonu
- VKN bilgi sorgulama
- Mükellefiyet sorgusu
- İnteraktif vergi dairesi entegrasyonu

### Önemli Konfigürasyonlar

#### Environment Variables (.env)
- `PORT=1000` - Uygulama portu
- `HOST=0.0.0.0` - Tüm IP'lerden erişime açık
- `XML_PATH`, `MAIN_PATH`, `OLCU_BIRIMLERI_PATH` - Dosya yolları

#### CORS
- Varsayılan olarak CORS **kapalı** (`config/cors.ts` içinde `enabled: false`)
- Firewall'da port 1000 açık

### Kritik Dosyalar
- `start/routes.ts` - Tüm API endpoint'leri
- `app/Controllers/Http/SoapsController.ts` - Ana SOAP işlemleri
- `app/Controllers/Http/xmlParser.ts` - XML parsing işlemleri

### AWS Entegrasyonu
Proje AWS SQS ve S3 servislerini kullanmaktadır. Credentials environment variable'lardan alınmalıdır.

## Test Komutları
```bash
# API'nin çalıştığını kontrol et
curl http://localhost:1000

# Rota listesini görüntüle
node ace list:routes
```

## Notlar
- Uygulama AdonisJS v5 kullanıyor
- TypeScript ile yazılmış
- XML işlemleri için multiple kütüphane kullanılıyor (fast-xml-parser, xml2js, libxmljs)
- Base64 encoding/decoding yoğun kullanılıyor
- SOAP servisleri için soap kütüphanesi kullanılıyor