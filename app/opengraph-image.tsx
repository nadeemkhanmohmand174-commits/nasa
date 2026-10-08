import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div style={{ background: 'linear-gradient(135deg, #05060F 0%, #0B0F1F 100%)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ fontSize: 72, fontWeight: 700, background: 'linear-gradient(135deg, #7C3AED, #22D3EE)', backgroundClip: 'text', color: 'transparent' }}>COSMOS VAULT</div>
      <div style={{ fontSize: 28, color: '#94A3B8', marginTop: 16 }}>NASA Research Media & Data Exploration</div>
    </div>,
    size
  );
}
