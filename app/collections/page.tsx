'use client';
import { useState } from 'react';
import { FolderOpen, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from '@/lib/env';
import { formatDatePretty } from '@/lib/utils';

interface DemoCollection { id: string; name: string; description: string; slug: string; is_public: boolean; item_count: number; created_at: string; }

const demoCollections: DemoCollection[] = [
  { id: '1', name: 'Best of APOD', description: 'My favorite astronomy pictures', slug: 'best-of-apod', is_public: true, item_count: 24, created_at: '2026-09-01' },
  { id: '2', name: 'Mars Highlights', description: 'Top photos from Curiosity and Perseverance', slug: 'mars-highlights', is_public: true, item_count: 18, created_at: '2026-09-15' },
  { id: '3', name: 'Hazardous NEOs', description: 'Potentially hazardous asteroid tracking', slug: 'hazardous-neos', is_public: false, item_count: 7, created_at: '2026-09-28' },
];

export default function CollectionsPage() {
  const { toast } = useToast();
  const [collections, setCollections] = useState(demoCollections);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const configured = isSupabaseConfigured();

  function createCollection() {
    if (!name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    const newCol: DemoCollection = { id: Date.now().toString(), name, description: desc, slug: name.toLowerCase().replace(/\s+/g, '-'), is_public: isPublic, item_count: 0, created_at: new Date().toISOString().split('T')[0]! };
    setCollections([...collections, newCol]);
    setName(''); setDesc(''); setIsPublic(true); setOpen(false);
    toast({ title: 'Collection created', variant: 'success' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Collections</h1>
          <p className="mt-1 text-muted-foreground">{configured ? 'Curate and organize your favorite NASA media.' : 'Demo mode — connect Supabase to save collections.'}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gradient"><Plus className="h-4 w-4" /> New Collection</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Collection</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="mb-1.5 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Space Collection" /></div>
              <div><Label className="mb-1.5 block">Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="A brief description..." /></div>
              <div className="flex items-center gap-2"><Switch checked={isPublic} onCheckedChange={setIsPublic} id="public" /><Label htmlFor="public">Public</Label></div>
            </div>
            <DialogFooter><Button variant="gradient" onClick={createCollection}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? <EmptyState title="No collections yet" description="Create your first collection to organize NASA media" action={<Button variant="gradient" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Collection</Button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Card key={c.id} className="glass-card group cursor-pointer transition-all hover:border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FolderOpen className="h-8 w-8 text-nebula-violet" />
                  {!c.is_public && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <CardTitle className="text-base">{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{c.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.item_count} items</span>
                  <span>{formatDatePretty(c.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
