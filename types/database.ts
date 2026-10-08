/**
 * Generated database types for Supabase.
 * In production, these would be generated via `supabase gen types typescript`.
 * Here we provide hand-written types matching our migration schema.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          slug: string;
          is_public: boolean;
          cover_asset_id: string | null;
          item_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          slug: string;
          is_public?: boolean;
          cover_asset_id?: string | null;
          item_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_public?: boolean;
          cover_asset_id?: string | null;
          item_count?: number;
          updated_at?: string;
        };
      };
      collection_items: {
        Row: {
          id: string;
          collection_id: string;
          asset_id: string;
          asset_snapshot: unknown;
          position: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          asset_id: string;
          asset_snapshot: unknown;
          position?: number;
          added_at?: string;
        };
        Update: {
          position?: number;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          asset_id: string;
          asset_snapshot: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_id: string;
          asset_snapshot: unknown;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      downloads: {
        Row: {
          id: string;
          user_id: string | null;
          asset_id: string;
          format: 'image' | 'pdf' | 'xlsx' | 'csv' | 'json' | 'zip';
          item_count: number;
          byte_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          asset_id: string;
          format: 'image' | 'pdf' | 'xlsx' | 'csv' | 'json' | 'zip';
          item_count: number;
          byte_size: number;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      search_history: {
        Row: {
          id: string;
          user_id: string | null;
          query: string;
          filters: unknown;
          source: string;
          result_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          query: string;
          filters?: unknown;
          source: string;
          result_count: number;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          asset_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_id: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          updated_at?: string;
        };
      };
      asset_cache: {
        Row: {
          asset_id: string;
          source: string;
          cloudinary_public_id: string;
          cloudinary_url: string;
          raw: unknown;
          cached_at: string;
        };
        Insert: {
          asset_id: string;
          source: string;
          cloudinary_public_id: string;
          cloudinary_url: string;
          raw?: unknown;
          cached_at?: string;
        };
        Update: {
          cloudinary_public_id?: string;
          cloudinary_url?: string;
          raw?: unknown;
          cached_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
