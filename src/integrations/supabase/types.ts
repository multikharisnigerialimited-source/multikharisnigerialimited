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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      course_fees: {
        Row: {
          amount: number
          course: string
          updated_at: string
        }
        Insert: {
          amount?: number
          course: string
          updated_at?: string
        }
        Update: {
          amount?: number
          course?: string
          updated_at?: string
        }
        Relationships: []
      }
      minister_registrations: {
        Row: {
          address: string
          amount_due: number
          amount_paid: number
          church: string
          created_at: string
          gender: string
          id: string
          name: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          reference: string
          status: Database["public"]["Enums"]["registration_status"]
          title: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address: string
          amount_due?: number
          amount_paid?: number
          church: string
          created_at?: string
          gender: string
          id?: string
          name: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          reference?: string
          status?: Database["public"]["Enums"]["registration_status"]
          title: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string
          amount_due?: number
          amount_paid?: number
          church?: string
          created_at?: string
          gender?: string
          id?: string
          name?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          reference?: string
          status?: Database["public"]["Enums"]["registration_status"]
          title?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          card_bank: string | null
          card_brand: string | null
          card_last4: string | null
          channel: string | null
          created_at: string
          gateway_response: string | null
          id: string
          paid_at: string | null
          reference: string
          registration_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          card_bank?: string | null
          card_brand?: string | null
          card_last4?: string | null
          channel?: string | null
          created_at?: string
          gateway_response?: string | null
          id?: string
          paid_at?: string | null
          reference: string
          registration_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          card_bank?: string | null
          card_brand?: string | null
          card_last4?: string | null
          channel?: string | null
          created_at?: string
          gateway_response?: string | null
          id?: string
          paid_at?: string | null
          reference?: string
          registration_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          address: string
          agreed_terms: boolean
          amount_due: number
          amount_paid: number
          callup_number: string | null
          category: Database["public"]["Enums"]["participant_category"]
          courses: string[]
          created_at: string
          date_of_birth: string
          denomination: string | null
          discipline: string
          email: string
          first_name: string
          gender: string
          id: string
          institution: string
          level_of_study: string | null
          matric_number: string | null
          other_names: string | null
          paid_at: string | null
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          photo_path: string
          ppa: string | null
          receipt_check: Json | null
          receipt_path: string | null
          reference: string
          state_code: string | null
          status: Database["public"]["Enums"]["registration_status"]
          surname: string
          training_location: string | null
          training_mode: string
          training_schedule: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address: string
          agreed_terms?: boolean
          amount_due?: number
          amount_paid?: number
          callup_number?: string | null
          category: Database["public"]["Enums"]["participant_category"]
          courses: string[]
          created_at?: string
          date_of_birth: string
          denomination?: string | null
          discipline: string
          email: string
          first_name: string
          gender: string
          id?: string
          institution: string
          level_of_study?: string | null
          matric_number?: string | null
          other_names?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          photo_path: string
          ppa?: string | null
          receipt_check?: Json | null
          receipt_path?: string | null
          reference?: string
          state_code?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          surname: string
          training_location?: string | null
          training_mode: string
          training_schedule: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string
          agreed_terms?: boolean
          amount_due?: number
          amount_paid?: number
          callup_number?: string | null
          category?: Database["public"]["Enums"]["participant_category"]
          courses?: string[]
          created_at?: string
          date_of_birth?: string
          denomination?: string | null
          discipline?: string
          email?: string
          first_name?: string
          gender?: string
          id?: string
          institution?: string
          level_of_study?: string | null
          matric_number?: string | null
          other_names?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          photo_path?: string
          ppa?: string | null
          receipt_check?: Json | null
          receipt_path?: string | null
          reference?: string
          state_code?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          surname?: string
          training_location?: string | null
          training_mode?: string
          training_schedule?: string
          updated_at?: string
          whatsapp?: string | null
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
      next_registration_reference: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin"
      participant_category: "nysc" | "student" | "minister"
      payment_status: "unpaid" | "paid"
      registration_status: "pending" | "approved" | "rejected"
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

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      participant_category: ["nysc", "student", "minister"],
      payment_status: ["unpaid", "paid"],
      registration_status: ["pending", "approved", "rejected"],
    },
  },
} as const
