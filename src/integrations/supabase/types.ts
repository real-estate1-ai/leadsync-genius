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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action_type: string
          agent_id: string
          created_at: string
          description: string | null
          id: string
          lead_id: string
        }
        Insert: {
          action_type: string
          agent_id: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
        }
        Update: {
          action_type?: string
          agent_id?: string
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agent_id: string
          budget_range: Database["public"]["Enums"]["budget_range"] | null
          campaign_name: string | null
          created_at: string
          email: string | null
          id: string
          lead_source_url: string | null
          location_preference: string | null
          name: string
          notes: string | null
          phone: string
          priority: Database["public"]["Enums"]["lead_priority"]
          property_interest: Database["public"]["Enums"]["property_type"] | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          agent_id: string
          budget_range?: Database["public"]["Enums"]["budget_range"] | null
          campaign_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_source_url?: string | null
          location_preference?: string | null
          name: string
          notes?: string | null
          phone: string
          priority?: Database["public"]["Enums"]["lead_priority"]
          property_interest?:
            | Database["public"]["Enums"]["property_type"]
            | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          agent_id?: string
          budget_range?: Database["public"]["Enums"]["budget_range"] | null
          campaign_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_source_url?: string | null
          location_preference?: string | null
          name?: string
          notes?: string | null
          phone?: string
          priority?: Database["public"]["Enums"]["lead_priority"]
          property_interest?:
            | Database["public"]["Enums"]["property_type"]
            | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          title: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aisensy_api_key: string | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          meta_ads_connected: boolean
          name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["agent_status"]
          subscription_expires_at: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          webhook_token: string
        }
        Insert: {
          aisensy_api_key?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          meta_ads_connected?: boolean
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          webhook_token?: string
        }
        Update: {
          aisensy_api_key?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          meta_ads_connected?: boolean
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          webhook_token?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_done: boolean
          lead_id: string
          note: string | null
          reminder_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_done?: boolean
          lead_id: string
          note?: string | null
          reminder_at: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_done?: boolean
          lead_id?: string
          note?: string | null
          reminder_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "pending" | "active" | "inactive"
      app_role: "admin" | "agent"
      budget_range: "under_20l" | "20_50l" | "50l_1cr" | "1cr_plus"
      lead_priority: "hot" | "warm" | "cold"
      lead_source: "whatsapp" | "meta_ads" | "manual" | "referral" | "other"
      lead_status:
        | "new"
        | "called"
        | "site_visit_scheduled"
        | "site_visit_done"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      property_type: "1bhk" | "2bhk" | "3bhk" | "villa" | "plot" | "commercial"
      subscription_plan: "trial" | "basic" | "pro"
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
      agent_status: ["pending", "active", "inactive"],
      app_role: ["admin", "agent"],
      budget_range: ["under_20l", "20_50l", "50l_1cr", "1cr_plus"],
      lead_priority: ["hot", "warm", "cold"],
      lead_source: ["whatsapp", "meta_ads", "manual", "referral", "other"],
      lead_status: [
        "new",
        "called",
        "site_visit_scheduled",
        "site_visit_done",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      property_type: ["1bhk", "2bhk", "3bhk", "villa", "plot", "commercial"],
      subscription_plan: ["trial", "basic", "pro"],
    },
  },
} as const
