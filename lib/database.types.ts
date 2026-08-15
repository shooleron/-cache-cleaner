export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_name: string
          error: string | null
          finished_at: string | null
          id: string
          input: Json
          job_type: string
          output: Json
          started_at: string
          status: string
        }
        Insert: {
          agent_name: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          job_type: string
          output?: Json
          started_at?: string
          status: string
        }
        Update: {
          agent_name?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          job_type?: string
          output?: Json
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          anonymous_id: string | null
          article_id: string | null
          created_at: string
          event_name: string
          id: number
          metadata: Json
          referrer: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          anonymous_id?: string | null
          article_id?: string | null
          created_at?: string
          event_name: string
          id?: never
          metadata?: Json
          referrer?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          anonymous_id?: string | null
          article_id?: string | null
          created_at?: string
          event_name?: string
          id?: never
          metadata?: Json
          referrer?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_entities: {
        Row: {
          article_id: string
          entity_id: string
          relevance: number
        }
        Insert: {
          article_id: string
          entity_id: string
          relevance?: number
        }
        Update: {
          article_id?: string
          entity_id?: string
          relevance?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_entities_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_entities_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      article_reactions: {
        Row: {
          anonymous_id: string | null
          article_id: string | null
          created_at: string
          external_article_id: string | null
          feedback: string | null
          id: string
          reaction: boolean
        }
        Insert: {
          anonymous_id?: string | null
          article_id?: string | null
          created_at?: string
          external_article_id?: string | null
          feedback?: string | null
          id?: string
          reaction: boolean
        }
        Update: {
          anonymous_id?: string | null
          article_id?: string | null
          created_at?: string
          external_article_id?: string | null
          feedback?: string | null
          id?: string
          reaction?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "article_reactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_comments: {
        Row: {
          anonymous_id: string | null
          body: string
          created_at: string
          display_name: string
          external_article_id: string
          id: string
          moderated_at: string | null
          status: string
        }
        Insert: {
          anonymous_id?: string | null
          body: string
          created_at?: string
          display_name: string
          external_article_id: string
          id?: string
          moderated_at?: string | null
          status?: string
        }
        Update: {
          anonymous_id?: string | null
          body?: string
          created_at?: string
          display_name?: string
          external_article_id?: string
          id?: string
          moderated_at?: string | null
          status?: string
        }
        Relationships: []
      }
      article_sources: {
        Row: {
          article_id: string
          citation_label: string | null
          is_primary: boolean
          source_id: string
          source_url: string
        }
        Insert: {
          article_id: string
          citation_label?: string | null
          is_primary?: boolean
          source_id: string
          source_url: string
        }
        Update: {
          article_id?: string
          citation_label?: string | null
          is_primary?: boolean
          source_id?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          body: string
          category: string
          cover_image_url: string | null
          created_at: string
          evidence_level: string | null
          id: string
          ingestion_item_id: string | null
          original_language: string | null
          original_published_at: string | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          scientific_confidence: number | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          category: string
          cover_image_url?: string | null
          created_at?: string
          evidence_level?: string | null
          id?: string
          ingestion_item_id?: string | null
          original_language?: string | null
          original_published_at?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          scientific_confidence?: number | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          cover_image_url?: string | null
          created_at?: string
          evidence_level?: string | null
          id?: string
          ingestion_item_id?: string | null
          original_language?: string | null
          original_published_at?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          scientific_confidence?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_ingestion_item_id_fkey"
            columns: ["ingestion_item_id"]
            isOneToOne: true
            referencedRelation: "ingestion_items"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          active: boolean
          alt_text: string
          campaign_id: string | null
          category: string | null
          id: string
          image_url: string
          placement: string
          target_url: string
          weight: number
        }
        Insert: {
          active?: boolean
          alt_text: string
          campaign_id?: string | null
          category?: string | null
          id?: string
          image_url: string
          placement: string
          target_url: string
          weight?: number
        }
        Update: {
          active?: boolean
          alt_text?: string
          campaign_id?: string | null
          category?: string | null
          id?: string
          image_url?: string
          placement?: string
          target_url?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "banners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          name: string
          starts_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          name: string
          starts_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          name?: string
          starts_at?: string | null
          status?: string
        }
        Relationships: []
      }
      editor_profiles: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          role: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      entities: {
        Row: {
          aliases: string[]
          body: string
          created_at: string
          evidence_notes: string | null
          id: string
          name_en: string | null
          name_he: string
          published: boolean
          reviewed_at: string | null
          seo_description: string | null
          seo_title: string | null
          short_definition: string
          slug: string
          type: Database["public"]["Enums"]["entity_type"]
          updated_at: string
        }
        Insert: {
          aliases?: string[]
          body: string
          created_at?: string
          evidence_notes?: string | null
          id?: string
          name_en?: string | null
          name_he: string
          published?: boolean
          reviewed_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_definition: string
          slug: string
          type: Database["public"]["Enums"]["entity_type"]
          updated_at?: string
        }
        Update: {
          aliases?: string[]
          body?: string
          created_at?: string
          evidence_notes?: string | null
          id?: string
          name_en?: string | null
          name_he?: string
          published?: boolean
          reviewed_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_definition?: string
          slug?: string
          type?: Database["public"]["Enums"]["entity_type"]
          updated_at?: string
        }
        Relationships: []
      }
      ingestion_items: {
        Row: {
          agent_score: number | null
          discovered_at: string
          duplicate_of: string | null
          id: string
          image_url: string | null
          language: string | null
          published_at: string | null
          quality_details: Json
          raw_content: string | null
          raw_title: string | null
          rejection_reason: string | null
          source_id: string | null
          source_url: string
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          agent_score?: number | null
          discovered_at?: string
          duplicate_of?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          published_at?: string | null
          quality_details?: Json
          raw_content?: string | null
          raw_title?: string | null
          rejection_reason?: string | null
          source_id?: string | null
          source_url: string
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          agent_score?: number | null
          discovered_at?: string
          duplicate_of?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          published_at?: string | null
          quality_details?: Json
          raw_content?: string | null
          raw_title?: string | null
          rejection_reason?: string | null
          source_id?: string | null
          source_url?: string
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_items_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "ingestion_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          active: boolean
          auto_publish: boolean
          created_at: string
          feed_url: string | null
          id: string
          items_last_scan: number
          language: string
          last_scan_error: string | null
          last_scan_status: string | null
          last_scanned_at: string | null
          name: string
          scan_interval_hours: number
          source_type: string
          topics: string[]
          trust_score: number
          url: string
        }
        Insert: {
          active?: boolean
          auto_publish?: boolean
          created_at?: string
          feed_url?: string | null
          id?: string
          items_last_scan?: number
          language?: string
          last_scan_error?: string | null
          last_scan_status?: string | null
          last_scanned_at?: string | null
          name: string
          scan_interval_hours?: number
          source_type?: string
          topics?: string[]
          trust_score?: number
          url: string
        }
        Update: {
          active?: boolean
          auto_publish?: boolean
          created_at?: string
          feed_url?: string | null
          id?: string
          items_last_scan?: number
          language?: string
          last_scan_error?: string | null
          last_scan_status?: string | null
          last_scanned_at?: string | null
          name?: string
          scan_interval_hours?: number
          source_type?: string
          topics?: string[]
          trust_score?: number
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_status:
        | "collected"
        | "reviewing"
        | "draft"
        | "scheduled"
        | "published"
        | "rejected"
      entity_type: "term" | "brand" | "person" | "institution"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_status: [
        "collected",
        "reviewing",
        "draft",
        "scheduled",
        "published",
        "rejected",
      ],
      entity_type: ["term", "brand", "person", "institution"],
    },
  },
} as const
