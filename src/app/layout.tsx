import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Email Accessibility Scanner',
  description: 'POC for scanning email HTML accessibility',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 antialiased">
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}
