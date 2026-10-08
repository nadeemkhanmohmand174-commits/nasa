import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cosmos Vault',
    short_name: 'CosmosVault',
    description: 'NASA research media and data exploration platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#05060F',
    theme_color: '#05060F',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
