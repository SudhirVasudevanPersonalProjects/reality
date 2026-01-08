export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      care_dependencies: {
        Row: {
          care_id: string
          depends_on_care_id: string
        }
        Insert: {
          care_id: string
          depends_on_care_id: string
        }
        Update: {
          care_id?: string
          depends_on_care_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_dependencies_care_id_fkey"
            columns: ["care_id"]
            isOneToOne: false
            referencedRelation: "cares"
            referencedColumns: ["something_id"]
          },
          {
            foreignKeyName: "care_dependencies_depends_on_care_id_fkey"
            columns: ["depends_on_care_id"]
            isOneToOne: false
            referencedRelation: "cares"
            referencedColumns: ["something_id"]
          },
        ]
      }
      cares: {
        Row: {
          fulfilled: boolean | null
          fulfilled_at: string | null
          fulfilled_by_reality_id: string | null
          intensity: number | null
          something_id: string
          why: string | null
        }
        Insert: {
          fulfilled?: boolean | null
          fulfilled_at?: string | null
          fulfilled_by_reality_id?: string | null
          intensity?: number | null
          something_id: string
          why?: string | null
        }
        Update: {
          fulfilled?: boolean | null
          fulfilled_at?: string | null
          fulfilled_by_reality_id?: string | null
          intensity?: number | null
          something_id?: string
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cares_fulfilled_by_reality_id_fkey"
            columns: ["fulfilled_by_reality_id"]
            isOneToOne: false
            referencedRelation: "my_reality"
            referencedColumns: ["something_id"]
          },
          {
            foreignKeyName: "cares_something_id_fkey"
            columns: ["something_id"]
            isOneToOne: true
            referencedRelation: "somethings"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          depth: number | null
          domain: string | null
          full_path: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          depth?: number | null
          domain?: string | null
          full_path: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          depth?: number | null
          domain?: string | null
          full_path?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          created_by: string | null
          from_something_id: string
          id: string
          meaning: string | null
          notes: string | null
          relationship_type: string | null
          strength: number | null
          to_something_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          from_something_id: string
          id?: string
          meaning?: string | null
          notes?: string | null
          relationship_type?: string | null
          strength?: number | null
          to_something_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          from_something_id?: string
          id?: string
          meaning?: string | null
          notes?: string | null
          relationship_type?: string | null
          strength?: number | null
          to_something_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_from_something_id_fkey"
            columns: ["from_something_id"]
            isOneToOne: false
            referencedRelation: "somethings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_to_something_id_fkey"
            columns: ["to_something_id"]
            isOneToOne: false
            referencedRelation: "somethings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          color: string | null
          created_at: string | null
          display_name: string
          domain_name: string
          icon: string | null
          id: string
          includes_realms: string[] | null
          is_default: boolean | null
          sort_order: number
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          display_name: string
          domain_name: string
          icon?: string | null
          id?: string
          includes_realms?: string[] | null
          is_default?: boolean | null
          sort_order: number
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          display_name?: string
          domain_name?: string
          icon?: string | null
          id?: string
          includes_realms?: string[] | null
          is_default?: boolean | null
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      my_reality: {
        Row: {
          latitude: number | null
          location_name: string | null
          longitude: number | null
          quality_score: number | null
          something_id: string
        }
        Insert: {
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          quality_score?: number | null
          something_id: string
        }
        Update: {
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          quality_score?: number | null
          something_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "my_reality_something_id_fkey"
            columns: ["something_id"]
            isOneToOne: true
            referencedRelation: "somethings"
            referencedColumns: ["id"]
          },
        ]
      }
      something_tags: {
        Row: {
          created_at: string | null
          something_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          something_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          something_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "something_tags_something_id_fkey"
            columns: ["something_id"]
            isOneToOne: false
            referencedRelation: "somethings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "something_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      somethings: {
        Row: {
          attributes: Json | null
          captured_at: string
          care: number | null
          care_frequency: number | null
          category_path: string | null
          content_type: string
          created_at: string | null
          domain: string | null
          formatted_address: string | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          media_url: string | null
          metadata: Json | null
          parent_id: string | null
          realm: string | null
          text_content: string | null
          updated_at: string | null
          user_id: string
          visited: boolean | null
        }
        Insert: {
          attributes?: Json | null
          captured_at: string
          care?: number | null
          care_frequency?: number | null
          category_path?: string | null
          content_type: string
          created_at?: string | null
          domain?: string | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          media_url?: string | null
          metadata?: Json | null
          parent_id?: string | null
          realm?: string | null
          text_content?: string | null
          updated_at?: string | null
          user_id: string
          visited?: boolean | null
        }
        Update: {
          attributes?: Json | null
          captured_at?: string
          care?: number | null
          care_frequency?: number | null
          category_path?: string | null
          content_type?: string
          created_at?: string | null
          domain?: string | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          media_url?: string | null
          metadata?: Json | null
          parent_id?: string | null
          realm?: string | null
          text_content?: string | null
          updated_at?: string | null
          user_id?: string
          visited?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "captures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "somethings_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "somethings"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      thoughts: {
        Row: {
          care_id: string | null
          parent_thought_id: string | null
          reality_id: string | null
          something_id: string
          thought_type: string | null
        }
        Insert: {
          care_id?: string | null
          parent_thought_id?: string | null
          reality_id?: string | null
          something_id: string
          thought_type?: string | null
        }
        Update: {
          care_id?: string | null
          parent_thought_id?: string | null
          reality_id?: string | null
          something_id?: string
          thought_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thoughts_care_id_fkey"
            columns: ["care_id"]
            isOneToOne: false
            referencedRelation: "cares"
            referencedColumns: ["something_id"]
          },
          {
            foreignKeyName: "thoughts_parent_thought_id_fkey"
            columns: ["parent_thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["something_id"]
          },
          {
            foreignKeyName: "thoughts_reality_id_fkey"
            columns: ["reality_id"]
            isOneToOne: false
            referencedRelation: "my_reality"
            referencedColumns: ["something_id"]
          },
          {
            foreignKeyName: "thoughts_something_id_fkey"
            columns: ["something_id"]
            isOneToOne: true
            referencedRelation: "somethings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string | null
          created_at: string | null
          id: string
          max_somethings_bound: number | null
          name: string | null
          phone_number: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          id?: string
          max_somethings_bound?: number | null
          name?: string | null
          phone_number?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          id?: string
          max_somethings_bound?: number | null
          name?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_connection_count: {
        Args: { something_id_param: string }
        Returns: number
      }
      seed_default_domains: {
        Args: { target_user_id: string }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

