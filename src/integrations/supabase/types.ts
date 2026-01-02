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
      addresses: {
        Row: {
          city: string | null
          created_at: string
          full_address: string
          id: string
          is_default: boolean | null
          label: string
          lga: string | null
          phone: string
          state: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          full_address: string
          id?: string
          is_default?: boolean | null
          label: string
          lga?: string | null
          phone: string
          state: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          full_address?: string
          id?: string
          is_default?: boolean | null
          label?: string
          lga?: string | null
          phone?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          livestock_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          livestock_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          livestock_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_livestock_id_fkey"
            columns: ["livestock_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          base_delivery_fee: number
          created_at: string
          id: string
          is_active: boolean | null
          price_per_km: number | null
          state: string
        }
        Insert: {
          base_delivery_fee: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_per_km?: number | null
          state: string
        }
        Update: {
          base_delivery_fee?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_per_km?: number | null
          state?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          rider_id: string
          status: string
          trip_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rider_id: string
          status?: string
          trip_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rider_id?: string
          status?: string
          trip_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock: {
        Row: {
          age_months: number | null
          breed: string
          certification_details: string | null
          created_at: string
          description: string | null
          health_status: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          is_certified: boolean | null
          price: number
          title: string
          updated_at: string
          vendor_id: string
          weight_kg: number | null
        }
        Insert: {
          age_months?: number | null
          breed: string
          certification_details?: string | null
          created_at?: string
          description?: string | null
          health_status?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_certified?: boolean | null
          price: number
          title: string
          updated_at?: string
          vendor_id: string
          weight_kg?: number | null
        }
        Update: {
          age_months?: number | null
          breed?: string
          certification_details?: string | null
          created_at?: string
          description?: string | null
          health_status?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_certified?: boolean | null
          price?: number
          title?: string
          updated_at?: string
          vendor_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "livestock_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          livestock_id: string | null
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          livestock_id?: string | null
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          livestock_id?: string | null
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_livestock_id_fkey"
            columns: ["livestock_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address_id: string | null
          delivery_fee: number
          delivery_notes: string | null
          id: string
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          scheduled_delivery_date: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_address_id?: string | null
          delivery_fee: number
          delivery_notes?: string | null
          id?: string
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          scheduled_delivery_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_address_id?: string | null
          delivery_fee?: number
          delivery_notes?: string | null
          id?: string
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          scheduled_delivery_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string | null
          rating: number
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          rating: number
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          rating?: number
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string | null
          rider_id: string
          trip_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id?: string | null
          rider_id: string
          trip_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string | null
          rider_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rider_reviews_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rider_reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          rider_id: string
          total_earned: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          rider_id: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          rider_id?: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rider_wallets_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: true
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          compliance_score: number | null
          created_at: string
          current_location: Json | null
          id: string
          id_document_url: string | null
          is_online: boolean | null
          phone: string
          rating: number | null
          selfie_url: string | null
          total_reviews: number | null
          total_trips: number | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          compliance_score?: number | null
          created_at?: string
          current_location?: Json | null
          id?: string
          id_document_url?: string | null
          is_online?: boolean | null
          phone: string
          rating?: number | null
          selfie_url?: string | null
          total_reviews?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          compliance_score?: number | null
          created_at?: string
          current_location?: Json | null
          id?: string
          id_document_url?: string | null
          is_online?: boolean | null
          phone?: string
          rating?: number | null
          selfie_url?: string | null
          total_reviews?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      trip_tracking: {
        Row: {
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          rider_id: string
          speed: number | null
          trip_id: string
        }
        Insert: {
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          rider_id: string
          speed?: number | null
          trip_id: string
        }
        Update: {
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          rider_id?: string
          speed?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_tracking_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_tracking_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          actual_distance_km: number | null
          actual_duration_minutes: number | null
          created_at: string
          delivery_fee: number
          delivery_notes: string | null
          delivery_signature: string | null
          delivery_time: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          delivery_verification_photo: string | null
          dropoff_address: string
          dropoff_coordinates: Json | null
          estimated_distance_km: number | null
          estimated_duration_minutes: number | null
          id: string
          order_id: string
          pickup_address: string
          pickup_coordinates: Json | null
          pickup_notes: string | null
          pickup_time: string | null
          pickup_verification_photo: string | null
          rider_earnings: number
          rider_id: string | null
          status: Database["public"]["Enums"]["trip_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          created_at?: string
          delivery_fee?: number
          delivery_notes?: string | null
          delivery_signature?: string | null
          delivery_time?: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          delivery_verification_photo?: string | null
          dropoff_address: string
          dropoff_coordinates?: Json | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          order_id: string
          pickup_address: string
          pickup_coordinates?: Json | null
          pickup_notes?: string | null
          pickup_time?: string | null
          pickup_verification_photo?: string | null
          rider_earnings?: number
          rider_id?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          created_at?: string
          delivery_fee?: number
          delivery_notes?: string | null
          delivery_signature?: string | null
          delivery_time?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          delivery_verification_photo?: string | null
          dropoff_address?: string
          dropoff_coordinates?: Json | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          order_id?: string
          pickup_address?: string
          pickup_coordinates?: Json | null
          pickup_notes?: string | null
          pickup_time?: string | null
          pickup_verification_photo?: string | null
          rider_earnings?: number
          rider_id?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity_kg: number | null
          color: string | null
          created_at: string
          documents_url: string[] | null
          id: string
          is_active: boolean | null
          model: string | null
          plate_number: string
          rider_id: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          capacity_kg?: number | null
          color?: string | null
          created_at?: string
          documents_url?: string[] | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          plate_number: string
          rider_id: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          capacity_kg?: number | null
          color?: string | null
          created_at?: string
          documents_url?: string[] | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          plate_number?: string
          rider_id?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          email: string | null
          farm_location: string
          farm_name: string
          id: string
          is_verified: boolean | null
          lga: string | null
          logo_url: string | null
          phone: string
          rating: number | null
          state: string
          status: Database["public"]["Enums"]["vendor_status"]
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          farm_location: string
          farm_name: string
          id?: string
          is_verified?: boolean | null
          lga?: string | null
          logo_url?: string | null
          phone: string
          rating?: number | null
          state: string
          status?: Database["public"]["Enums"]["vendor_status"]
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          farm_location?: string
          farm_name?: string
          id?: string
          is_verified?: boolean | null
          lga?: string | null
          logo_url?: string | null
          phone?: string
          rating?: number | null
          state?: string
          status?: Database["public"]["Enums"]["vendor_status"]
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          status: string
          trip_id: string | null
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          trip_id?: string | null
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          trip_id?: string | null
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "rider_wallets"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "buyer" | "vendor" | "admin" | "rider"
      delivery_type: "live_cattle" | "processed_meat"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "dispatched"
        | "delivered"
        | "cancelled"
      payment_method: "paystack" | "bank_transfer"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      trip_status:
        | "pending"
        | "assigned"
        | "accepted"
        | "picking_up"
        | "picked_up"
        | "in_transit"
        | "arrived"
        | "delivered"
        | "cancelled"
      vendor_status: "pending" | "approved" | "rejected" | "suspended"
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
      app_role: ["buyer", "vendor", "admin", "rider"],
      delivery_type: ["live_cattle", "processed_meat"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "dispatched",
        "delivered",
        "cancelled",
      ],
      payment_method: ["paystack", "bank_transfer"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      trip_status: [
        "pending",
        "assigned",
        "accepted",
        "picking_up",
        "picked_up",
        "in_transit",
        "arrived",
        "delivered",
        "cancelled",
      ],
      vendor_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
