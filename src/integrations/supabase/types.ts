export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attendances: {
        Row: {
          attendance_date: string
          cell_id: string
          contact_id: string
          created_at: string
          id: string
          present: boolean
          visitor: boolean
        }
        Insert: {
          attendance_date: string
          cell_id: string
          contact_id: string
          created_at?: string
          id?: string
          present?: boolean
          visitor?: boolean
        }
        Update: {
          attendance_date?: string
          cell_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          present?: boolean
          visitor?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "attendances_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      birthday_notifications: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          notification_date: string
          sent: boolean
          sent_at: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          notification_date: string
          sent?: boolean
          sent_at?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          notification_date?: string
          sent?: boolean
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "birthday_notifications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      birthday_webhooks: {
        Row: {
          active: boolean
          created_at: string
          id: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
      cells: {
        Row: {
          active: boolean
          address: string
          created_at: string
          id: string
          leader_id: string | null
          meeting_day: number
          meeting_time: string
          name: string
          neighborhood_id: string | null
          qr_code_token: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address: string
          created_at?: string
          id?: string
          leader_id?: string | null
          meeting_day: number
          meeting_time: string
          name: string
          neighborhood_id?: string | null
          qr_code_token?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string
          created_at?: string
          id?: string
          leader_id?: string | null
          meeting_day?: number
          meeting_time?: string
          name?: string
          neighborhood_id?: string | null
          qr_code_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cells_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cells_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cells_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      child_attendance: {
        Row: {
          child_id: string | null
          class_record_id: string | null
          created_at: string
          id: string
          present: boolean
          type: string
        }
        Insert: {
          child_id?: string | null
          class_record_id?: string | null
          created_at?: string
          id?: string
          present?: boolean
          type: string
        }
        Update: {
          child_id?: string | null
          class_record_id?: string | null
          created_at?: string
          id?: string
          present?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_attendance_class_record_id_fkey"
            columns: ["class_record_id"]
            isOneToOne: false
            referencedRelation: "class_records"
            referencedColumns: ["id"]
          },
        ]
      }
      child_notifications: {
        Row: {
          category: string
          child_id: string | null
          created_at: string
          id: string
          message: string
        }
        Insert: {
          category: string
          child_id?: string | null
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          category?: string
          child_id?: string | null
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_notifications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string
          class: string
          created_at: string
          food_restriction_details: string | null
          has_food_restriction: boolean
          id: string
          is_autistic: boolean
          name: string
          parent_contact_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          birth_date: string
          class: string
          created_at?: string
          food_restriction_details?: string | null
          has_food_restriction?: boolean
          id?: string
          is_autistic?: boolean
          name: string
          parent_contact_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          birth_date?: string
          class?: string
          created_at?: string
          food_restriction_details?: string | null
          has_food_restriction?: boolean
          id?: string
          is_autistic?: boolean
          name?: string
          parent_contact_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_contact_id_fkey"
            columns: ["parent_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          state: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_records: {
        Row: {
          class: string
          created_at: string
          id: string
          lesson_id: string | null
          teacher_1: string | null
          teacher_2: string | null
          total_members: number | null
          total_visitors: number | null
          updated_at: string
          worship_date: string
        }
        Insert: {
          class: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          teacher_1?: string | null
          teacher_2?: string | null
          total_members?: number | null
          total_visitors?: number | null
          updated_at?: string
          worship_date: string
        }
        Update: {
          class?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          teacher_1?: string | null
          teacher_2?: string | null
          total_members?: number | null
          total_visitors?: number | null
          updated_at?: string
          worship_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_records_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_notes: {
        Row: {
          cell_id: string
          contact_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string
          updated_at: string
        }
        Insert: {
          cell_id: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          updated_at?: string
        }
        Update: {
          cell_id?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_notes_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          age: number | null
          attendance_code: string | null
          baptized: boolean
          birth_date: string | null
          cell_id: string | null
          city_id: string | null
          created_at: string
          email: string | null
          encounter_with_god: boolean
          founder: boolean
          id: string
          leader_id: string | null
          ministry_id: string | null
          name: string
          neighborhood: string
          photo_url: string | null
          pipeline_stage_id: string | null
          referred_by: string | null
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          attendance_code?: string | null
          baptized?: boolean
          birth_date?: string | null
          cell_id?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          encounter_with_god?: boolean
          founder?: boolean
          id?: string
          leader_id?: string | null
          ministry_id?: string | null
          name: string
          neighborhood: string
          photo_url?: string | null
          pipeline_stage_id?: string | null
          referred_by?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          attendance_code?: string | null
          baptized?: boolean
          birth_date?: string | null
          cell_id?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          encounter_with_god?: boolean
          founder?: boolean
          id?: string
          leader_id?: string | null
          ministry_id?: string | null
          name?: string
          neighborhood?: string
          photo_url?: string | null
          pipeline_stage_id?: string | null
          referred_by?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          active: boolean
          created_at: string
          date: string
          id: string
          keyword: string
          name: string
          qr_code: string
          qr_url: string
          registration_count: number
          scan_count: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          date: string
          id?: string
          keyword: string
          name: string
          qr_code: string
          qr_url: string
          registration_count?: number
          scan_count?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          date?: string
          id?: string
          keyword?: string
          name?: string
          qr_code?: string
          qr_url?: string
          registration_count?: number
          scan_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          active: boolean
          created_at: string
          id: string
          message: string
          name: string
          subject: string | null
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          message: string
          name: string
          subject?: string | null
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      ministries: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          is_system_ministry: boolean | null
          leader_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_system_ministry?: boolean | null
          leader_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_system_ministry?: boolean | null
          leader_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministries_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      ministry_members: {
        Row: {
          active: boolean
          contact_id: string
          id: string
          joined_at: string
          ministry_id: string
        }
        Insert: {
          active?: boolean
          contact_id: string
          id?: string
          joined_at?: string
          ministry_id: string
        }
        Update: {
          active?: boolean
          contact_id?: string
          id?: string
          joined_at?: string
          ministry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministry_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ministry_members_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      ministry_teachers: {
        Row: {
          active: boolean
          contact_id: string
          created_at: string
          id: string
          ministry_id: string
          teacher_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          contact_id: string
          created_at?: string
          id?: string
          ministry_id: string
          teacher_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          contact_id?: string
          created_at?: string
          id?: string
          ministry_id?: string
          teacher_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministry_teachers_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ministry_teachers_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhoods: {
        Row: {
          active: boolean
          city_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighborhoods_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          active: boolean
          color: string
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          photo_url: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          photo_url?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          photo_url?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          keyword: string
          qr_code_data: string
          scan_count: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          keyword: string
          qr_code_data: string
          scan_count?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          keyword?: string
          qr_code_data?: string
          scan_count?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          qr_code_id: string
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          qr_code_id: string
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          qr_code_id?: string
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_channels: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sent_messages: {
        Row: {
          contact_id: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string
          message_type: string
          phone_number: string | null
          sent_at: string | null
          status: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content: string
          message_type?: string
          phone_number?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
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
          value: Json
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
      teacher_schedules: {
        Row: {
          class: string
          created_at: string
          id: string
          lesson_id: string | null
          observations: string | null
          teacher_1: string | null
          teacher_2: string | null
          updated_at: string
          worship_date: string
        }
        Insert: {
          class: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          observations?: string | null
          teacher_1?: string | null
          teacher_2?: string | null
          updated_at?: string
          worship_date: string
        }
        Update: {
          class?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          observations?: string | null
          teacher_1?: string | null
          teacher_2?: string | null
          updated_at?: string
          worship_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_schedules_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          active: boolean
          created_at: string
          event_type: string
          headers: Json | null
          id: string
          name: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          event_type: string
          headers?: Json | null
          id?: string
          name: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          event_type?: string
          headers?: Json | null
          id?: string
          name?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      neighborhood_stats: {
        Row: {
          city_name: string | null
          id: string | null
          neighborhood_name: string | null
          total_cells: number | null
          total_contacts: number | null
          total_leaders: number | null
          total_people: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_delete_city: {
        Args: { city_uuid: string }
        Returns: boolean
      }
      can_delete_neighborhood: {
        Args: { neighborhood_name: string }
        Returns: boolean
      }
      check_birthdays_and_trigger_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_attendance_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_today_birthdays: {
        Args: Record<PropertyKey, never>
        Returns: {
          contact_id: string
          contact_name: string
          birth_date: string
          whatsapp: string
          age: number
        }[]
      }
      increment_event_registration: {
        Args: { event_uuid: string }
        Returns: undefined
      }
      increment_event_scan_count: {
        Args: { event_uuid: string }
        Returns: undefined
      }
      increment_qr_scan_count: {
        Args: { qr_id: string; user_ip?: unknown; user_agent_string?: string }
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
  public: {
    Enums: {},
  },
} as const
