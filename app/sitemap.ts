import type { MetadataRoute } from 'next';
import { getEnv } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const env = getEnv();
  const base = env.NEXT_PUBLIC_SITE_URL;
  const routes = ['', '/explore', '/apod', '/mars', '/neo', '/earth', '/collections', '/downloads', '/dashboard', '/about', '/login', '/signup'];
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: route === '' ? 1 : 0.8 }));
}
