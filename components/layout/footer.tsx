import Link from 'next/link';
import { Telescope } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-[var(--bg-elevated)] py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-heading font-bold">
              <Telescope className="h-5 w-5 text-nebula-violet" />
              <span className="gradient-heading">COSMOS VAULT</span>
            </div>
            <p className="text-sm text-muted-foreground">NASA research media and data exploration platform.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-foreground">All Media</Link></li>
              <li><Link href="/apod" className="hover:text-foreground">APOD</Link></li>
              <li><Link href="/mars" className="hover:text-foreground">Mars Rovers</Link></li>
              <li><Link href="/neo" className="hover:text-foreground">Near-Earth Objects</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href={SOCIAL_LINKS.nasaApi} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">NASA API Portal</a></li>
              <li><a href={SOCIAL_LINKS.nasaImages} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">NASA Image Library</a></li>
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>NASA data is public domain</li>
              <li>Images © NASA/JPL</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
          <p>Built with Next.js, Tailwind CSS, Supabase & Cloudinary. Data provided by NASA APIs.</p>
        </div>
      </div>
    </footer>
  );
}
