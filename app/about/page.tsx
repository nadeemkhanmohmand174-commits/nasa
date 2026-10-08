import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Telescope, Globe, Database, Accessibility, Code, Shield } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <Telescope className="mx-auto h-12 w-12 text-nebula-violet" />
        <h1 className="mt-4 font-heading text-4xl font-bold gradient-heading">About Cosmos Vault</h1>
        <p className="mt-3 text-muted-foreground">A NASA research media and data exploration platform built with modern web technologies.</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Mission</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Cosmos Vault unifies six NASA data APIs into a single, searchable, exportable platform. Whether you're an educator, researcher, or space enthusiast, Cosmos Vault makes NASA's vast media archive accessible, browsable, and downloadable in multiple formats.</p>
          <p>Every image, dataset, and document you find here comes directly from NASA's public APIs. All NASA imagery is in the public domain unless otherwise noted.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Database, title: 'Data Sources', desc: 'APOD, Mars Rover Photos, NEO Feed, EPIC Earth, NASA Image Library, and Tech Transfer — all via api.nasa.gov.' },
          { icon: Globe, title: 'Export Formats', desc: 'Download as PDF reports, Excel spreadsheets, CSV, JSON, or ZIP archives with bundled images and metadata.' },
          { icon: Code, title: 'Tech Stack', desc: 'Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, TanStack Query, Supabase, Cloudinary.' },
          { icon: Shield, title: 'Privacy', desc: 'Your data stays yours. Auth via Supabase, images cached via Cloudinary, no tracking beyond essential analytics.' },
          { icon: Accessibility, title: 'Accessibility', desc: 'WCAG AA compliant, keyboard navigation, screen reader support, reduced motion preferences, skip-to-content link.' },
          { icon: Telescope, title: 'Open Data', desc: 'All NASA data is public domain. Cosmos Vault is an independent project not affiliated with NASA.' },
        ].map((f) => (
          <Card key={f.title} className="glass-card">
            <CardHeader><f.icon className="h-6 w-6 text-nebula-violet" /><CardTitle className="text-base">{f.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{f.desc}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Credits & Links</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><a href={SOCIAL_LINKS.nasaApi} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NASA API Portal</a> — Get your own API key</p>
          <p><a href={SOCIAL_LINKS.nasaImages} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NASA Image and Video Library</a></p>
          <p><a href={SOCIAL_LINKS.nasa} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NASA.gov</a></p>
          <p className="pt-2 text-xs text-muted-foreground">Cosmos Vault is an independent project. NASA does not endorse this application. All imagery © NASA/JPL-Caltech/GSFC.</p>
        </CardContent>
      </Card>
    </div>
  );
}
