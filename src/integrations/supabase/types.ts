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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ad_billing: {
        Row: {
          ad_id: string
          billing_day: number
          company_name: string
          created_at: string
          id: string
          metrics_reset_at: string | null
          monthly_fee: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          ad_id: string
          billing_day: number
          company_name: string
          created_at?: string
          id?: string
          metrics_reset_at?: string | null
          monthly_fee?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          ad_id?: string
          billing_day?: number
          company_name?: string
          created_at?: string
          id?: string
          metrics_reset_at?: string | null
          monthly_fee?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_billing_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: true
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_billing_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: true
            referencedRelation: "ads_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_billing_payments: {
        Row: {
          billing_id: string
          created_at: string
          id: string
          notes: string | null
          paid_at: string
          reference_month: number
          reference_year: number
        }
        Insert: {
          billing_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string
          reference_month: number
          reference_year: number
        }
        Update: {
          billing_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string
          reference_month?: number
          reference_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_billing_payments_billing_id_fkey"
            columns: ["billing_id"]
            isOneToOne: false
            referencedRelation: "ad_billing"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          category: string
          click_target: string | null
          click_type: string
          created_at: string
          id: string
          image_url_home: string | null
          image_url_search: string | null
          is_active: boolean
          link: string | null
          slug: string | null
          title: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          category: string
          click_target?: string | null
          click_type?: string
          created_at?: string
          id?: string
          image_url_home?: string | null
          image_url_search?: string | null
          is_active?: boolean
          link?: string | null
          slug?: string | null
          title: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          category?: string
          click_target?: string | null
          click_type?: string
          created_at?: string
          id?: string
          image_url_home?: string | null
          image_url_search?: string | null
          is_active?: boolean
          link?: string | null
          slug?: string | null
          title?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          click_target: string | null
          click_type: string
          created_at: string
          id: string
          image_desktop: string | null
          image_mobile: string | null
          image_url: string
          is_active: boolean
          position: number
          whatsapp_number: string | null
        }
        Insert: {
          click_target?: string | null
          click_type?: string
          created_at?: string
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          image_url: string
          is_active?: boolean
          position?: number
          whatsapp_number?: string | null
        }
        Update: {
          click_target?: string | null
          click_type?: string
          created_at?: string
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          image_url?: string
          is_active?: boolean
          position?: number
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cars: {
        Row: {
          brand_id: string
          category: string
          code: string
          color: string
          condition: string | null
          cooling_type: string | null
          created_at: string
          description: string | null
          doors: number | null
          engine_cc: number | null
          fuel: Database["public"]["Enums"]["fuel_type"]
          garage_id: string
          garage_is_active: boolean
          id: string
          is_featured: boolean
          mileage: number | null
          model: string
          model_year: number | null
          motorcycle_category: string | null
          photos: string[] | null
          price: number
          slug: string | null
          sold_at: string | null
          sold_reason: string | null
          status: Database["public"]["Enums"]["car_status"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at: string
          version: string | null
          year: number
        }
        Insert: {
          brand_id: string
          category?: string
          code: string
          color: string
          condition?: string | null
          cooling_type?: string | null
          created_at?: string
          description?: string | null
          doors?: number | null
          engine_cc?: number | null
          fuel: Database["public"]["Enums"]["fuel_type"]
          garage_id: string
          garage_is_active?: boolean
          id?: string
          is_featured?: boolean
          mileage?: number | null
          model: string
          model_year?: number | null
          motorcycle_category?: string | null
          photos?: string[] | null
          price: number
          slug?: string | null
          sold_at?: string | null
          sold_reason?: string | null
          status?: Database["public"]["Enums"]["car_status"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          version?: string | null
          year: number
        }
        Update: {
          brand_id?: string
          category?: string
          code?: string
          color?: string
          condition?: string | null
          cooling_type?: string | null
          created_at?: string
          description?: string | null
          doors?: number | null
          engine_cc?: number | null
          fuel?: Database["public"]["Enums"]["fuel_type"]
          garage_id?: string
          garage_is_active?: boolean
          id?: string
          is_featured?: boolean
          mileage?: number | null
          model?: string
          model_year?: number | null
          motorcycle_category?: string | null
          photos?: string[] | null
          price?: number
          slug?: string | null
          sold_at?: string | null
          sold_reason?: string | null
          status?: Database["public"]["Enums"]["car_status"]
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          version?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      consortium_leads: {
        Row: {
          birth_date: string
          cpf: string
          created_at: string
          email: string
          id: string
          is_archived: boolean
          name: string
          phone: string
          status: Database["public"]["Enums"]["consortium_lead_status"]
          updated_at: string
          vehicle_id: string | null
          vehicle_info: string | null
        }
        Insert: {
          birth_date: string
          cpf: string
          created_at?: string
          email: string
          id?: string
          is_archived?: boolean
          name: string
          phone: string
          status?: Database["public"]["Enums"]["consortium_lead_status"]
          updated_at?: string
          vehicle_id?: string | null
          vehicle_info?: string | null
        }
        Update: {
          birth_date?: string
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          is_archived?: boolean
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["consortium_lead_status"]
          updated_at?: string
          vehicle_id?: string | null
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consortium_leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      consortium_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      garages: {
        Row: {
          address: string | null
          can_add_vehicles: boolean
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          can_add_vehicles?: boolean
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          can_add_vehicles?: boolean
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garages_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          name: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_history: {
        Row: {
          car_id: string
          car_snapshot: Json
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          garage_id: string
          id: string
          is_suspicious: boolean | null
          notes: string | null
          sold_at: string
          sold_reason: string | null
        }
        Insert: {
          car_id: string
          car_snapshot: Json
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          garage_id: string
          id?: string
          is_suspicious?: boolean | null
          notes?: string | null
          sold_at?: string
          sold_reason?: string | null
        }
        Update: {
          car_id?: string
          car_snapshot?: Json
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          garage_id?: string
          id?: string
          is_suspicious?: boolean | null
          notes?: string | null
          sold_at?: string
          sold_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_history_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_history_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
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
      whatsapp_logs: {
        Row: {
          ai_response: string
          created_at: string
          id: string
          message: string
          phone_number: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          id?: string
          message: string
          phone_number: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          id?: string
          message?: string
          phone_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      ads_public: {
        Row: {
          category: string | null
          click_target: string | null
          click_type: string | null
          created_at: string | null
          id: string | null
          image_url_home: string | null
          image_url_search: string | null
          is_active: boolean | null
          link: string | null
          slug: string | null
          title: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          category?: string | null
          click_target?: string | null
          click_type?: string | null
          created_at?: string | null
          id?: string | null
          image_url_home?: string | null
          image_url_search?: string | null
          is_active?: boolean | null
          link?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          category?: string | null
          click_target?: string | null
          click_type?: string | null
          created_at?: string | null
          id?: string | null
          image_url_home?: string | null
          image_url_search?: string | null
          is_active?: boolean | null
          link?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_car_slug: {
        Args: {
          p_brand_name: string
          p_model: string
          p_version: string
          p_year: number
        }
        Returns: string
      }
      get_active_cities: {
        Args: never
        Returns: {
          city: string
          state: string
        }[]
      }
      get_garage_ids_by_location: {
        Args: { p_city?: string; p_state?: string }
        Returns: string[]
      }
      get_user_garage_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_garage: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      normalize_slug: { Args: { input_text: string }; Returns: string }
      search_cars_ranked:
        | {
            Args: {
              p_brand_id?: string
              p_category?: string
              p_color?: string
              p_condition?: string
              p_cooling_type?: string
              p_doors?: number
              p_fuel?: string
              p_garage_ids?: string[]
              p_limit?: number
              p_motorcycle_category?: string
              p_offset?: number
              p_price_max?: number
              p_price_min?: number
              p_search?: string
              p_transmission?: string
              p_year_from?: number
              p_year_to?: number
            }
            Returns: {
              brand_logo_url: string
              brand_name: string
              car_brand_id: string
              car_category: string
              car_code: string
              car_color: string
              car_condition: string
              car_cooling_type: string
              car_created_at: string
              car_doors: number
              car_engine_cc: number
              car_fuel: string
              car_id: string
              car_is_featured: boolean
              car_mileage: number
              car_model: string
              car_model_year: number
              car_motorcycle_category: string
              car_photos: string[]
              car_price: number
              car_slug: string
              car_transmission: string
              car_version: string
              car_year: number
              relevance_score: number
              total_count: number
            }[]
          }
        | {
            Args: {
              p_brand_id?: string
              p_category?: string
              p_color?: string
              p_condition?: string
              p_cooling_type?: string
              p_doors?: number
              p_fuel?: string
              p_garage_ids?: string[]
              p_limit?: number
              p_motorcycle_category?: string
              p_offset?: number
              p_price_max?: number
              p_price_min?: number
              p_search?: string
              p_transmission?: string
              p_version?: string
              p_year_from?: number
              p_year_to?: number
            }
            Returns: {
              brand_logo_url: string
              brand_name: string
              car_brand_id: string
              car_category: string
              car_code: string
              car_color: string
              car_condition: string
              car_cooling_type: string
              car_created_at: string
              car_doors: number
              car_engine_cc: number
              car_fuel: string
              car_id: string
              car_is_featured: boolean
              car_mileage: number
              car_model: string
              car_model_year: number
              car_motorcycle_category: string
              car_photos: string[]
              car_price: number
              car_slug: string
              car_transmission: string
              car_version: string
              car_year: number
              relevance_score: number
              total_count: number
            }[]
          }
    }
    Enums: {
      app_role: "super_admin" | "garage"
      car_status: "available" | "sold"
      consortium_lead_status:
        | "novo"
        | "encaminhado"
        | "em_negociacao"
        | "fechado"
        | "nao_fechou"
      fuel_type:
        | "gasoline"
        | "ethanol"
        | "flex"
        | "diesel"
        | "electric"
        | "hybrid"
      transmission_type: "manual" | "automatic" | "cvt" | "semi_automatic"
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
      app_role: ["super_admin", "garage"],
      car_status: ["available", "sold"],
      consortium_lead_status: [
        "novo",
        "encaminhado",
        "em_negociacao",
        "fechado",
        "nao_fechou",
      ],
      fuel_type: [
        "gasoline",
        "ethanol",
        "flex",
        "diesel",
        "electric",
        "hybrid",
      ],
      transmission_type: ["manual", "automatic", "cvt", "semi_automatic"],
    },
  },
} as const
