'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Telescope, Star, Orbit, Globe, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Starfield } from '@/components/shared/starfield';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { SectionHeading } from '@/components/shared/section-heading';
import { MediaCard } from '@/components/media/media-card';

async function fetchApod() {
  const res = await fetch('/api/nasa/apod');
  if (!res.ok) throw new Error('Failed to fetch APOD');
  const json = await res.json();
  return json.data;
}

async function fetchApodRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const res = await fetch(`/api/nasa/apod/range?start_date=${fmt(start)}&end_date=${fmt(end)}`);
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

const features = [
  { icon: Star, title: 'Astronomy Picture of the Day', description: 'Browse NASA\'s daily astronomical images with calendar heatmap, range explorer, and random discovery.', href: '/apod', color: 'text-nebula-violet' },
  { icon: Orbit, title: 'Mars Rover Photos', description: 'Explore photos from Curiosity, Opportunity, Spirit, and Perseverance filtered by sol and camera.', href: '/mars', color: 'text-source-mars' },
  { icon: Globe , title: 'Near-Earth Objects', description: 'Track asteroids with size-distance scatter plots, hazard color-coding, and orbital data.', href: '/neo', color: 'text-source-neo' },
  { icon: Globe, title: 'EPIC Earth Imagery', description: 'Watch animated Earth sequences from DSCOVR and lookup satellite imagery by coordinates.', href: '/earth', color: 'text-source-epic' },
];

export default function HomePage() {
  const { data: apod, isLoading } = useQuery({ queryKey: ['apod'], queryFn: fetchApod });
  const { data: recent } = useQuery({ queryKey: ['apod-range'], queryFn: fetchApodRange });

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <Starfield density={150} />
        <div className="aurora-bg" />
        {apod?.fullUrl && (
          <div className="absolute inset-0 z-0 opacity-20">
            <img src={apod.fullUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="container relative z-10 mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-nebula-violet/30 bg-nebula-violet/10 px-4 py-1.5 text-sm text-nebula-violet">
              <Sparkles className="h-4 w-4" />
              Powered by NASA APIs
            </div>
            <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              <span className="gradient-heading">COSMOS</span>
              <br />
              <span className="text-foreground">VAULT</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Explore NASA\'s vast research media archive — from daily astronomy pictures and Mars rover photos to near-Earth objects and EPIC Earth imagery. Search, filter, collect, and export mission data.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="gradient" size="lg" asChild>
                <Link href="/explore"><Zap className="h-5 w-5" /> Start Exploring <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/apod"><Star className="h-5 w-5" /> Today\'s APOD</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-[var(--bg-elevated)] py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {[
            { label: 'NASA Data Sources', value: 6, suffix: '' },
            { label: 'Mars Rover Photos', value: 1000000, suffix: '+' },
            { label: 'NEO Tracked', value: 30000, suffix: '+' },
            { label: 'Export Formats', value: 6, suffix: '' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl font-bold gradient-heading md:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's APOD */}
      {apod && (
        <section className="container mx-auto px-4 py-16">
          <SectionHeading title="Today's Picture" subtitle="Astronomy Picture of the Day from NASA" />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="glass-card overflow-hidden rounded-2xl">
              {apod.fullUrl && <img src={apod.fullUrl} alt={apod.title} className="aspect-video w-full object-cover" />}
            </div>
            <div className="flex flex-col justify-center">
              <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-nebula-violet/10 px-3 py-1 text-xs text-nebula-violet">APOD · {apod.date}</div>
              <h3 className="font-heading text-2xl font-bold">{apod.title}</h3>
              <p className="mt-3 line-clamp-6 text-sm text-muted-foreground">{apod.description}</p>
              <Button variant="gradient" className="mt-6 w-fit" asChild>
                <Link href={`/asset/${apod.id}`}>View Details <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </section>
      )}

      {/* Feature cards */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeading title="Explore the Cosmos" subtitle="Six powerful data exploration modules backed by real NASA APIs" centered />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link href={feature.href}>
                <Card className="group glass-card h-full transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <feature.icon className={`h-10 w-10 ${feature.color}`} />
                    <CardTitle className="mt-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest strip */}
      {recent && recent.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <SectionHeading title="Latest from APOD" subtitle="The last 7 days of astronomy pictures" />
            <Button variant="outline" asChild className="hidden sm:flex"><Link href="/apod">View All <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {recent.slice(0, 6).map((asset: any, i: number) => (
              <MediaCard key={asset.id} asset={asset} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="conic-border relative overflow-hidden rounded-2xl p-8 text-center md:p-16">
          <Telescope className="mx-auto h-12 w-12 text-nebula-violet" />
          <h2 className="mt-4 font-heading text-3xl font-bold">Ready to explore the universe?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Search across NASA's entire media archive, build collections, and export data in six formats.</p>
          <Button variant="gradient" size="lg" className="mt-6" asChild>
            <Link href="/explore">Launch Explorer <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
