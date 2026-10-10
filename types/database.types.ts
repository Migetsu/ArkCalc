export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string
          end_date: string | null
          featured_operators: Json
          id: string
          image_url: string | null
          name: string
          rateup_operators: Json
          server: string
          start_date: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          featured_operators?: Json
          id?: string
          image_url?: string | null
          name: string
          rateup_operators?: Json
          server?: string
          start_date?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          featured_operators?: Json
          id?: string
          image_url?: string | null
          name?: string
          rateup_operators?: Json
          server?: string
          start_date?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      planner_targets: {
        Row: {
          created_at: string
          current_elite: number
          current_level: number
          current_masteries: Json
          current_modules: Json
          current_skill_level: number
          id: string
          is_completed: boolean
          notes: string | null
          operator_id: string
          priority: number
          target_elite: number
          target_level: number
          target_masteries: Json
          target_modules: Json
          target_skill_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_elite?: number
          current_level?: number
          current_masteries?: Json
          current_modules?: Json
          current_skill_level?: number
          id?: string
          is_completed?: boolean
          notes?: string | null
          operator_id: string
          priority?: number
          target_elite?: number
          target_level?: number
          target_masteries?: Json
          target_modules?: Json
          target_skill_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_elite?: number
          current_level?: number
          current_masteries?: Json
          current_modules?: Json
          current_skill_level?: number
          id?: string
          is_completed?: boolean
          notes?: string | null
          operator_id?: string
          priority?: number
          target_elite?: number
          target_level?: number
          target_masteries?: Json
          target_modules?: Json
          target_skill_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          doctor_id: string | null
          id: string
          level: number | null
          server: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          doctor_id?: string | null
          id: string
          level?: number | null
          server?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          level?: number | null
          server?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_inventories: {
        Row: {
          created_at: string
          id: string
          item_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rosters: {
        Row: {
          created_at: string
          elite: number
          id: string
          is_favorite: boolean
          level: number
          masteries: Json
          modules: Json
          operator_id: string
          potential: number
          skill_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          elite?: number
          id?: string
          is_favorite?: boolean
          level?: number
          masteries?: Json
          modules?: Json
          operator_id: string
          potential?: number
          skill_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          elite?: number
          id?: string
          is_favorite?: boolean
          level?: number
          masteries?: Json
          modules?: Json
          operator_id?: string
          potential?: number
          skill_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          language: string
          preferences: Json
          server: string
          show_unreleased: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          preferences?: Json
          server?: string
          show_unreleased?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          preferences?: Json
          server?: string
          show_unreleased?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
