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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle browser extensions that modify the DOM
              if (typeof window !== 'undefined') {
                // Remove attributes added by browser extensions after hydration
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                      const target = mutation.target;
                      if (target === document.body) {
                        // Check if Grammarly or other extensions added attributes
                        if (target.hasAttribute('data-gr-ext-installed') || 
                            target.hasAttribute('data-new-gr-c-s-check-loaded')) {
                          // These attributes are expected and don't affect functionality
                          return;
                        }
                      }
                    }
                  });
                });
                
                // Start observing after DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', () => {
                    observer.observe(document.body, { attributes: true });
                  });
                } else {
                  observer.observe(document.body, { attributes: true });
                }
              }
            `,
          }}
        />
      </head>
      <body 
        className="h-full bg-gray-50 antialiased"
        suppressHydrationWarning={true}
      >
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}
