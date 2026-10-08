import type { MetadataRoute } from 'next';
import { getEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const env = getEnv();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard/'] },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
