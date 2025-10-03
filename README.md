# AccessTime - Email Accessibility Scanner

A comprehensive email accessibility testing tool that automatically scans HTML email content for accessibility issues using Playwright and axe-core.

## 📺 Demo Application

[![Watch the demo](https://img.youtube.com/vi/nunkJdQTVKo/maxresdefault.jpg)](https://youtu.be/nunkJdQTVKo)

*Click the image above to watch the demo video*  

## 🚀 Features

- **Modern React/Next.js Frontend** with intuitive UI for email testing
- **Real-time Email Detection** via MailHog integration
- **Automated Accessibility Scanning** using Playwright + axe-core
- **Test Sample Library** with pre-built accessibility test cases
- **Detailed Reporting** with HTML and JSON output formats
- **Environment-based Configuration** for flexible deployment
- **Docker Support** for easy MailHog setup

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Docker & Docker Compose
- Playwright browsers

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd access-time
pnpm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# MailHog Configuration
MAILHOG_HOST=localhost
MAILHOG_SMTP_PORT=1025
MAILHOG_WEB_PORT=8025

# Email Configuration
DEFAULT_FROM_EMAIL=scanner@access-time.local
DEFAULT_TO_EMAIL=report@access-time.local
TEST_FROM_EMAIL=test@example.com
TEST_TO_EMAIL=test@local.test

# SMTP Configuration
SMTP_SECURE=false
SMTP_IGNORE_TLS=true

# Application Configuration
DEFAULT_TIMEOUT=1000
```

### 3. Setup MailHog

Start MailHog using Docker Compose:

```bash
docker-compose up -d
```

MailHog will be available at:
- **SMTP Server**: `localhost:1025`
- **Web UI**: `http://localhost:8025`

### 4. Install Playwright Browsers

```bash
npx playwright install
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### Testing with Sample Emails

1. Open the application in your browser
2. Browse the available test samples in the "Test Samples" section
3. Click **"Test Scan"** on any sample to:
   - Send the sample HTML to MailHog
   - Automatically detect the email
   - Run accessibility scanning
   - Display detailed results

### Testing Custom Emails

1. Send HTML emails to the configured test address (`test@local.test`)
2. The application will automatically detect new emails
3. Processing indicator will show during scanning
4. Results will be displayed with detailed accessibility violations

### Sample HTML Email

Send emails with HTML content like this:

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
    <button>Click me</button>
</body>
</html>
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test-samples` | GET | Get available test samples |
| `/api/test-samples` | POST | Send sample to MailHog |
| `/api/emails` | GET | Check for new emails in MailHog |
| `/api/scan` | POST | Scan HTML for accessibility issues |

### API Examples

**Get Test Samples:**
```bash
curl http://localhost:3000/api/test-samples
```

**Send Sample to MailHog:**
```bash
curl -X POST http://localhost:3000/api/test-samples \
  -H "Content-Type: application/json" \
  -d '{"sampleId": "basic", "action": "send"}'
```

**Scan HTML Content:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>...</html>", "sendEmail": false}'
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── emails/
│   │   │   └── route.ts          # Email detection from MailHog
│   │   ├── scan/
│   │   │   └── route.ts          # Accessibility scanning logic
│   │   └── test-samples/
│   │       └── route.ts          # Test sample management
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # App layout
│   └── page.tsx                  # Main UI component
├── tests/
│   ├── email-samples/            # Test HTML files
│   │   ├── basic-accessibility-issues.html
│   │   ├── form-accessibility-errors.html
│   │   ├── ecommerce-accessibility-problems.html
│   │   └── comprehensive-accessibility-test.html
│   └── index.json                # Test samples metadata
├── docker-compose.yml            # MailHog configuration
├── .env.example                  # Environment variables template
└── README.md
```

## 🧪 Test Samples

The application includes pre-built test samples covering various accessibility issues:

- **Basic Accessibility Issues** - Common problems like missing alt text, form labels
- **Form Accessibility Errors** - Complex form accessibility violations
- **E-commerce Accessibility Problems** - Real-world e-commerce page issues
- **Comprehensive Accessibility Test** - Extensive test covering all issue types

## 📊 Sample Output

Accessibility scan results include detailed JSON output:

```json
{
  "violations": [
    {
      "id": "image-alt",
      "impact": "critical",
      "tags": ["cat.text-alternatives", "wcag2a", "wcag111"],
      "description": "Ensures images have alternate text",
      "help": "Images must have alternate text",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.0/image-alt",
      "nodes": [
        {
          "target": ["img"],
          "failureSummary": "Fix any of the following: Element does not have an alt attribute"
        }
      ]
    }
  ],
  "passes": [...],
  "incomplete": [...],
  "inapplicable": [...]
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAILHOG_HOST` | MailHog server hostname | `localhost` |
| `MAILHOG_SMTP_PORT` | MailHog SMTP port | `1025` |
| `MAILHOG_WEB_PORT` | MailHog web UI port | `8025` |
| `DEFAULT_FROM_EMAIL` | Default sender email | `scanner@access-time.local` |
| `DEFAULT_TO_EMAIL` | Default recipient email | `report@access-time.local` |
| `TEST_FROM_EMAIL` | Test sender email | `test@example.com` |
| `TEST_TO_EMAIL` | Test recipient email | `test@local.test` |
| `SMTP_SECURE` | Use SSL/TLS for SMTP | `false` |
| `SMTP_IGNORE_TLS` | Ignore TLS certificate errors | `true` |
| `DEFAULT_TIMEOUT` | Default timeout in milliseconds | `1000` |

## 🐛 Troubleshooting

### MailHog Issues

**MailHog not running:**
```bash
docker-compose down
docker-compose up -d
```

**Check MailHog status:**
```bash
docker-compose ps
```

### Playwright Issues

**Browser installation problems:**
```bash
npx playwright install --force
```

**Clear Playwright cache:**
```bash
npx playwright install --with-deps
```

### Port Conflicts

**Port already in use:**
- Change ports in `docker-compose.yml`
- Or stop services using ports 1025/8025

### Environment Issues

**Missing environment variables:**
- Ensure `.env.local` exists and is properly configured
- Check that all required variables are set
- Restart the development server after changes

## 🚀 Deployment

### Production Environment

1. Set up production environment variables
2. Configure proper SMTP settings
3. Use production-grade MailHog or SMTP server
4. Build the application:

```bash
pnpm build
pnpm start
```

### Docker Deployment

Create a `Dockerfile` for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Links

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Documentation](https://playwright.dev/)
- [MailHog Documentation](https://github.com/mailhog/MailHog)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)