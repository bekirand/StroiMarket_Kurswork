import type { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider';
import '@/styles/globals.css';

// Метаданные сайта (SEO)
export const metadata: Metadata = {
  title: {
    default: 'СтройМаркет — Строительные материалы',
    template: '%s | СтройМаркет',
  },
  description: 'Широкий выбор строительных материалов с доставкой. Качественные товары по лучшим ценам.',
  keywords: ['строительные материалы', 'стройматериалы', 'строймаркет', 'доставка'],
  authors: [{ name: 'СтройМаркет' }],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'СтройМаркет',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
