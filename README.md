# Email Accessibility Scanner POC

Proof of Concept aplikasi web untuk scan aksesibilitas email HTML secara otomatis menggunakan Playwright + axe-core.

## Overview

Aplikasi ini mendeteksi email HTML yang masuk ke alamat test khusus, menjalankan scan aksesibilitas menggunakan axe-core, dan menampilkan hasil JSON secara real-time di browser.

## Prerequisites

- Node.js 18+
- pnpm (atau npm/yarn)
- MailHog untuk testing email

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Setup dengan Docker (Recommended)

#### Option A: Docker Compose (Full Stack)
```bash
# Jalankan semua services (MailHog + App)
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: MailHog Only
```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

#### Option C: Binary Download
```bash
# macOS
brew install mailhog

# Linux
wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64
chmod +x MailHog_linux_amd64
./MailHog_linux_amd64
```

### 4. Environment Variables

#### Untuk Docker Compose
Environment variables sudah di-set di `docker-compose.yml`, tidak perlu file `.env.local`.

#### Untuk Development Manual
Buat file `.env.local`:

```env
TEST_EMAIL=test@local.test
MAILHOG_API_URL=http://localhost:8025/api/v2
NEXT_PUBLIC_TEST_EMAIL=test@local.test
```

### 5. Run Application

#### Dengan Docker Compose
```bash
docker-compose up -d
```

#### Manual Development
```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Usage

1. **Start Listening**: Klik tombol "Start Listening" di UI
2. **Send Test Email**: Kirim email HTML ke `test@local.test` menggunakan MailHog SMTP (port 1025)
3. **View Results**: Hasil scan aksesibilitas akan muncul secara otomatis dalam format JSON

### Contoh Email HTML untuk Testing

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Email</title>
</head>
<body>
    <h1>Welcome</h1>
    <img src="image.jpg" alt="Test image">
    <p>This is a test email for accessibility scanning.</p>
    <a href="https://example.com">Visit our website</a>
</body>
</html>
```

### Mengirim Email via MailHog

#### Menggunakan SMTP Client
- SMTP Host: `localhost`
- SMTP Port: `1025`
- To: `test@local.test`
- Subject: `Test Accessibility Scan`

#### Menggunakan MailHog Web UI
1. Buka [http://localhost:8025](http://localhost:8025)
2. Klik "New Message"
3. To: `test@local.test`
4. Paste HTML content di body
5. Send

## API Endpoints

### GET /api/scan
Server-Sent Events endpoint untuk real-time scan results.

### GET /api/status
Check status koneksi ke MailHog dan info email terbaru.

## Output Format

Hasil scan mengembalikan JSON dengan struktur:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
      "nodes": [...]
    }
  ],
  "summary": {
    "totalViolations": 1,
    "critical": 0,
    "serious": 1,
    "moderate": 0,
    "minor": 0
  }
}
```

## Troubleshooting

### MailHog Connection Error
- Pastikan MailHog berjalan di port 8025
- Check environment variable `MAILHOG_API_URL`

### Playwright Error
- Jalankan `npx playwright install` untuk install browser
- Pastikan Playwright dependencies terinstall

### No Email Detected
- Pastikan email dikirim ke alamat yang benar (`test@local.test`)
- Check MailHog web UI untuk memastikan email diterima
- Restart listening jika perlu

## Docker Services

### MailHog Service
- **Image**: `mailhog/mailhog:latest`
- **SMTP Port**: 1025
- **Web UI Port**: 8025
- **Storage**: Persistent volume untuk email data

### App Service
- **Base Image**: `node:18-alpine`
- **Port**: 3000
- **Features**: 
  - Pre-installed Chromium untuk Playwright
  - Optimized untuk production build
  - Volume mounting untuk development

## Architecture

```
Frontend (React/Next.js)
    ↓ SSE
Backend API (/api/scan)
    ↓ Polling
MailHog API
    ↓ HTML Extraction
Playwright + axe-core
    ↓ Results
JSON Output
```

## Success Criteria

✅ User dapat mengirim email HTML ke alamat test  
✅ UI menampilkan processing indicator  
✅ Backend otomatis mendeteksi email baru  
✅ Accessibility scan berjalan menggunakan axe-core  
✅ Hasil JSON ditampilkan di browser secara real-time  

## Limitations (POC Scope)

- Basic error handling
- Single email processing at a time
- No email content validation
- No persistent storage
- Limited to local MailHog setup
