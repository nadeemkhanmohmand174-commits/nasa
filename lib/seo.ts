import type { Metadata } from 'next';
import { getEnv } from '@/lib/env';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

/** Build consistent metadata for a page */
export function buildMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const env = getEnv();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const title = `${opts.title} · ${APP_NAME}`;
  const description = opts.description ?? APP_TAGLINE;
  const url = opts.path ? `${baseUrl}${opts.path}` : baseUrl;
  const image = opts.image ?? `${baseUrl}/api/og`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
