# Email Accessibility Scanner POC

Proof of concept untuk memindai aksesibilitas email HTML menggunakan Playwright dan axe-core.

## Fitur

- **Frontend React/Next.js** yang menampilkan alamat email test
- **Processing indicator** saat menunggu hasil scan
- **Backend API** yang mendengarkan email masuk via MailHog
- **Automatic scanning** menggunakan Playwright + axe-core
- **Real-time updates** menggunakan Server-Sent Events (SSE)
- **Raw JSON output** hasil scan aksesibilitas

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup MailHog

Jalankan MailHog menggunakan Docker:

```bash
docker-compose up -d
```

MailHog akan berjalan di:
- SMTP Server: `localhost:1025`
- Web UI: `http://localhost:8025`

### 3. Environment Variables

Buat file `.env.local`:

```env
TEST_EMAIL=test@local.test
MAILHOG_API_URL=http://localhost:8025/api/v2
MAILHOG_SMTP_HOST=localhost
MAILHOG_SMTP_PORT=1025
NEXT_PUBLIC_TEST_EMAIL=test@local.test
```

### 4. Install Playwright Browsers

```bash
npx playwright install
```

### 5. Run Development Server

```bash
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Cara Penggunaan

1. Buka aplikasi di browser
2. Kirim email HTML ke alamat yang ditampilkan (`test@local.test`)
3. Aplikasi akan otomatis mendeteksi email baru
4. Processing indicator akan muncul saat scanning
5. Hasil scan aksesibilitas akan ditampilkan sebagai JSON

## Contoh Email HTML

Kirim email dengan konten HTML seperti ini:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Email</title>
</head>
<body>
    <h1>Welcome</h1>
    <p>This is a test email for accessibility scanning.</p>
    <img src="test.jpg" alt="Test image">
    <a href="https://example.com">Visit our website</a>
</body>
</html>
```

## API Endpoints

- `GET /api/emails` - Cek email baru dari MailHog
- `POST /api/scan` - Scan HTML menggunakan Playwright + axe-core
- `GET /api/stream` - SSE endpoint untuk real-time updates

## Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── emails/route.ts    # Email detection
│   │   ├── scan/route.ts      # Accessibility scanning
│   │   └── stream/route.ts    # SSE streaming
│   ├── layout.tsx
│   ├── page.tsx               # Main UI
│   └── globals.css
├── docker-compose.yml         # MailHog setup
└── README.md
```

## Troubleshooting

### MailHog tidak berjalan
```bash
docker-compose down
docker-compose up -d
```

### Playwright browser error
```bash
npx playwright install --force
```

### Port sudah digunakan
Ubah port di `docker-compose.yml` atau hentikan service yang menggunakan port 1025/8025.

## Sample Output

Hasil scan akan menampilkan JSON seperti:

```json
{
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "tags": ["cat.color", "wcag2aa", "wcag143"],
      "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
      "help": "Elements must have sufficient color contrast",
      "nodes": [...]
    }
  ],
  "passes": [...],
  "incomplete": [...],
  "inapplicable": [...]
}
```
