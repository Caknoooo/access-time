# AccessTime Frontend

Modern React/Next.js frontend for Email Accessibility Scanner with real-time monitoring and intuitive UI.

## 🚀 Features

- **Modern React/Next.js Frontend** with intuitive UI for email testing
- **Real-time Email Monitoring** via Server-Sent Events
- **Automated Accessibility Scanning** using @axe-core/playwright
- **Test Sample Library** with pre-built accessibility test cases
- **Detailed Reporting** with styled and JSON output formats
- **Clean Architecture** with TypeScript and custom hooks
- **Tailwind CSS** for modern, responsive design

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended)
- Backend service running on port 3001

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd access-time
pnpm install
```

### 2. Environment Configuration

Create environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### Testing with Sample Emails

1. Open the application in your browser
2. Browse the available test samples in the "Test Samples" section
3. Click **"Test"** on any sample to:
   - Send the sample HTML to MailHog
   - Automatically detect the email via Server-Sent Events
   - Run accessibility scanning
   - Display detailed results

### Testing Custom Emails

1. Send HTML emails to the configured test address (`test@local.test`)
2. The application will automatically detect new emails via Server-Sent Events
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

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # App layout
│   └── page.tsx                  # Main UI component
├── components/                   # Reusable UI components
│   ├── ErrorDisplay.tsx          # Error message component
│   ├── JsonViewer.tsx            # JSON data viewer
│   ├── PreviewModal.tsx          # Email preview modal
│   ├── ProgressBar.tsx           # Progress indicator
│   ├── ScanResults.tsx           # Scan results display
│   ├── StatusIndicator.tsx       # Status indicator
│   └── TestSamples.tsx           # Test samples list
├── hooks/                        # Custom React hooks
│   └── useEmailMonitoring.ts     # Email monitoring logic
├── services/                      # API service layer
│   └── emailService.ts           # Email service with SSE
├── utils/                        # Utility functions
│   ├── apiClient.ts              # HTTP client with retry
│   ├── constants.ts              # Application constants
│   ├── errors.ts                 # Error handling utilities
│   └── logger.ts                 # Logging utility
├── types.ts                      # TypeScript definitions
└── tests/
    ├── email-samples/            # Test HTML files
    │   ├── basic-accessibility-issues.html
    │   ├── form-accessibility-errors.html
    │   ├── ecommerce-accessibility-problems.html
    │   └── comprehensive-accessibility-test.html
    └── index.json                # Test samples metadata
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
  "inapplicable": [...],
  "metadata": {
    "scanDuration": 1250,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "htmlLength": 65
  }
}
```

### Build for Production

```bash
pnpm build
pnpm start
```

## 🎯 Key Features

### Real-time Communication
- **Server-Sent Events**: Real-time email monitoring without polling
- **Event-driven Architecture**: Efficient resource usage
- **Automatic Reconnection**: Handles connection drops gracefully

### Modern UI/UX
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper focus states and keyboard navigation
- **Loading States**: Clear feedback during operations

### Error Handling
- **Custom Error Classes**: Proper error handling with HTTP status codes
- **Retry Logic**: Automatic retry for failed requests
- **User-friendly Messages**: Clear error messages for users

## 🔧 Development

### Scripts

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Custom Hooks

- **useEmailMonitoring**: Encapsulates email monitoring logic
- **Event Management**: Handles Server-Sent Events
- **State Management**: Manages application state