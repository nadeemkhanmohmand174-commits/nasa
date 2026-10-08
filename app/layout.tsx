import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';
import { APP_NAME, APP_TAGLINE, SOCIAL_LINKS } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cosmos-vault.vercel.app'),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Explore NASA research media and data — APOD, Mars Rover photos, Near-Earth Objects, EPIC Earth imagery, the NASA Image Library, and Tech Transfer patents.',
  keywords: ['NASA', 'space', 'astronomy', 'Mars', 'NEO', 'EPIC', 'APOD', 'space exploration'],
  authors: [{ name: 'Cosmos Vault' }],
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: 'Explore NASA research media and data.',
    type: 'website',
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_TAGLINE,
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#05060F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--bg-base)] text-foreground antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
