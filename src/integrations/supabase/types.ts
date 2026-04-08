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
      businesses: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          cgst: number
          created_at: string
          discount: number | null
          gst_rate: number
          hsn_code: string | null
          id: string
          igst: number
          invoice_id: string
          item_id: string | null
          name: string
          price: number
          quantity: number
          sgst: number
          total: number
          unit: string | null
        }
        Insert: {
          cgst?: number
          created_at?: string
          discount?: number | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          igst?: number
          invoice_id: string
          item_id?: string | null
          name: string
          price?: number
          quantity?: number
          sgst?: number
          total?: number
          unit?: string | null
        }
        Update: {
          cgst?: number
          created_at?: string
          discount?: number | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          igst?: number
          invoice_id?: string
          item_id?: string | null
          name?: string
          price?: number
          quantity?: number
          sgst?: number
          total?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          business_id: string
          cgst_total: number
          created_at: string
          date: string
          discount_total: number
          due_date: string | null
          id: string
          igst_total: number
          invoice_number: string
          is_interstate: boolean | null
          notes: string | null
          party_id: string | null
          sgst_total: number
          status: string
          subtotal: number
          total: number
          type: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          business_id: string
          cgst_total?: number
          created_at?: string
          date?: string
          discount_total?: number
          due_date?: string | null
          id?: string
          igst_total?: number
          invoice_number: string
          is_interstate?: boolean | null
          notes?: string | null
          party_id?: string | null
          sgst_total?: number
          status?: string
          subtotal?: number
          total?: number
          type: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          business_id?: string
          cgst_total?: number
          created_at?: string
          date?: string
          discount_total?: number
          due_date?: string | null
          id?: string
          igst_total?: number
          invoice_number?: string
          is_interstate?: boolean | null
          notes?: string | null
          party_id?: string | null
          sgst_total?: number
          status?: string
          subtotal?: number
          total?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          barcode: string | null
          batch_number: string | null
          business_id: string
          category: string | null
          created_at: string
          expiry_date: string | null
          gst_rate: number
          hsn_code: string | null
          id: string
          low_stock_alert: number | null
          name: string
          purchase_price: number
          sale_price: number
          sku: string | null
          stock_quantity: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          batch_number?: string | null
          business_id: string
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          low_stock_alert?: number | null
          name: string
          purchase_price?: number
          sale_price?: number
          sku?: string | null
          stock_quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          batch_number?: string | null
          business_id?: string
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          low_stock_alert?: number | null
          name?: string
          purchase_price?: number
          sale_price?: number
          sku?: string | null
          stock_quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          address: string | null
          balance: number | null
          business_id: string
          city: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          phone: string | null
          pincode: string | null
          state: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          balance?: number | null
          business_id: string
          city?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          balance?: number | null
          business_id?: string
          city?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parties_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
