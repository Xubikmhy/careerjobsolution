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
      agency_settings: {
        Row: {
          address: string | null
          agency_name: string | null
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agency_name?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agency_name?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          address: string | null
          career_objective: string | null
          created_at: string | null
          cv_url: string | null
          date_of_birth: string | null
          education_level: string | null
          expected_salary: number | null
          experience_years: number | null
          full_name: string
          id: string
          languages: string[] | null
          marital_status: string | null
          nationality: string | null
          phone: string
          reference_info: string | null
          remarks: string | null
          skills: string[] | null
          status: string | null
        }
        Insert: {
          address?: string | null
          career_objective?: string | null
          created_at?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          education_level?: string | null
          expected_salary?: number | null
          experience_years?: number | null
          full_name: string
          id?: string
          languages?: string[] | null
          marital_status?: string | null
          nationality?: string | null
          phone: string
          reference_info?: string | null
          remarks?: string | null
          skills?: string[] | null
          status?: string | null
        }
        Update: {
          address?: string | null
          career_objective?: string | null
          created_at?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          education_level?: string | null
          expected_salary?: number | null
          experience_years?: number | null
          full_name?: string
          id?: string
          languages?: string[] | null
          marital_status?: string | null
          nationality?: string | null
          phone?: string
          reference_info?: string | null
          remarks?: string | null
          skills?: string[] | null
          status?: string | null
        }
        Relationships: []
      }
      job_requirements: {
        Row: {
          company_name: string
          contact_person: string | null
          created_at: string | null
          employer_location: string | null
          employer_phone: string | null
          id: string
          location: string | null
          remarks: string | null
          required_skills: string[] | null
          role_title: string
          salary_max: number | null
          salary_min: number | null
          status: string | null
          timing: string | null
        }
        Insert: {
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          employer_location?: string | null
          employer_phone?: string | null
          id?: string
          location?: string | null
          remarks?: string | null
          required_skills?: string[] | null
          role_title: string
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          timing?: string | null
        }
        Update: {
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          employer_location?: string | null
          employer_phone?: string | null
          id?: string
          location?: string | null
          remarks?: string | null
          required_skills?: string[] | null
          role_title?: string
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          timing?: string | null
        }
        Relationships: []
      }
      placements: {
        Row: {
          agreed_salary: number | null
          candidate_id: string | null
          candidate_name: string | null
          commission_amount: number | null
          commission_paid: boolean | null
          created_at: string | null
          employer_name: string | null
          follow_up_date: string | null
          id: string
          job_id: string | null
          job_title: string | null
          notes: string | null
          placed_date: string | null
        }
        Insert: {
          agreed_salary?: number | null
          candidate_id?: string | null
          candidate_name?: string | null
          commission_amount?: number | null
          commission_paid?: boolean | null
          created_at?: string | null
          employer_name?: string | null
          follow_up_date?: string | null
          id?: string
          job_id?: string | null
          job_title?: string | null
          notes?: string | null
          placed_date?: string | null
        }
        Update: {
          agreed_salary?: number | null
          candidate_id?: string | null
          candidate_name?: string | null
          commission_amount?: number | null
          commission_paid?: boolean | null
          created_at?: string | null
          employer_name?: string | null
          follow_up_date?: string | null
          id?: string
          job_id?: string | null
          job_title?: string | null
          notes?: string | null
          placed_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placements_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string | null
          description: string | null
          facilities: string[] | null
          id: string
          landlord_address: string | null
          landlord_name: string
          landlord_phone: string | null
          location: string | null
          photos: string[] | null
          remarks: string | null
          rent_amount: number | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          id?: string
          landlord_address?: string | null
          landlord_name: string
          landlord_phone?: string | null
          location?: string | null
          photos?: string[] | null
          remarks?: string | null
          rent_amount?: number | null
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          id?: string
          landlord_address?: string | null
          landlord_name?: string
          landlord_phone?: string | null
          location?: string | null
          photos?: string[] | null
          remarks?: string | null
          rent_amount?: number | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          budget_max: number | null
          created_at: string | null
          full_name: string
          id: string
          phone: string
          preferred_location: string | null
          remarks: string | null
          type_needed: string | null
        }
        Insert: {
          budget_max?: number | null
          created_at?: string | null
          full_name: string
          id?: string
          phone: string
          preferred_location?: string | null
          remarks?: string | null
          type_needed?: string | null
        }
        Update: {
          budget_max?: number | null
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string
          preferred_location?: string | null
          remarks?: string | null
          type_needed?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          notes: string | null
          related_id: string | null
          related_name: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          related_id?: string | null
          related_name?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          related_id?: string | null
          related_name?: string | null
          type?: string
        }
        Relationships: []
      }
      work_experiences: {
        Row: {
          candidate_id: string | null
          company: string
          created_at: string | null
          duration: string | null
          id: string
          position: string
          responsibilities: string | null
        }
        Insert: {
          candidate_id?: string | null
          company: string
          created_at?: string | null
          duration?: string | null
          id?: string
          position: string
          responsibilities?: string | null
        }
        Update: {
          candidate_id?: string | null
          company?: string
          created_at?: string | null
          duration?: string | null
          id?: string
          position?: string
          responsibilities?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_experiences_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
