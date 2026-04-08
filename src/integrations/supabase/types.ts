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
      appointments: {
        Row: {
          client_id: string
          created_at: string
          doctor_id: string
          duration_minutes: number | null
          id: string
          notes: string | null
          scheduled_at: string
          status: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          doctor_id: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          doctor_id?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          assigned_at: string
          client_id: string
          doctor_id: string
          id: string
          status: string | null
        }
        Insert: {
          assigned_at?: string
          client_id: string
          doctor_id: string
          id?: string
          status?: string | null
        }
        Update: {
          assigned_at?: string
          client_id?: string
          doctor_id?: string
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      client_diet_plans: {
        Row: {
          assigned_by: string | null
          client_id: string
          created_at: string
          diet_plan_id: string
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          created_at?: string
          diet_plan_id: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          diet_plan_id?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_diet_plans_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_exercises: {
        Row: {
          assigned_by: string | null
          client_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      client_health_profile_assignments: {
        Row: {
          assigned_by: string | null
          client_id: string
          created_at: string
          id: string
          notes: string | null
          status: string | null
          template_id: string
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          template_id: string
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_health_profile_assignments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "health_profile_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_meal_plans: {
        Row: {
          assigned_by: string | null
          client_id: string
          created_at: string
          end_date: string | null
          id: string
          meal_plan_id: string
          notes: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          meal_plan_id: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          meal_plan_id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_meal_plans_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_meal_tracking: {
        Row: {
          client_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          date: string
          id: string
          meal_plan_id: string | null
          meal_type: string
        }
        Insert: {
          client_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          meal_plan_id?: string | null
          meal_type: string
        }
        Update: {
          client_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          meal_plan_id?: string | null
          meal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_meal_tracking_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_progress: {
        Row: {
          admin_feedback: string | null
          client_id: string
          created_at: string
          date: string
          exercises_completed: number | null
          exercises_total: number | null
          id: string
          meals_completed: number | null
          meals_total: number | null
          notes: string | null
          progress_percentage: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin_feedback?: string | null
          client_id: string
          created_at?: string
          date?: string
          exercises_completed?: number | null
          exercises_total?: number | null
          id?: string
          meals_completed?: number | null
          meals_total?: number | null
          notes?: string | null
          progress_percentage?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin_feedback?: string | null
          client_id?: string
          created_at?: string
          date?: string
          exercises_completed?: number | null
          exercises_total?: number | null
          id?: string
          meals_completed?: number | null
          meals_total?: number | null
          notes?: string | null
          progress_percentage?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      client_recipes: {
        Row: {
          assigned_by: string | null
          client_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          day_of_week: number | null
          id: string
          meal_type: string | null
          notes: string | null
          recipe_id: string
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          day_of_week?: number | null
          id?: string
          meal_type?: string | null
          notes?: string | null
          recipe_id: string
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          day_of_week?: number | null
          id?: string
          meal_type?: string | null
          notes?: string | null
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_videos: {
        Row: {
          assigned_by: string | null
          client_id: string
          created_at: string
          id: string
          video_id: string
          watched: boolean | null
          watched_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          created_at?: string
          id?: string
          video_id: string
          watched?: boolean | null
          watched_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          id?: string
          video_id?: string
          watched?: boolean | null
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          doctor_id: string
          id: string
          last_message_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          doctor_id: string
          id?: string
          last_message_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          last_message_at?: string | null
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          attachments: Json | null
          calories_max: number | null
          calories_min: number | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_weeks: number | null
          goal: string | null
          id: string
          name: string
          status: string | null
          video_urls: string[] | null
        }
        Insert: {
          attachments?: Json | null
          calories_max?: number | null
          calories_min?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          name: string
          status?: string | null
          video_urls?: string[] | null
        }
        Update: {
          attachments?: Json | null
          calories_max?: number | null
          calories_min?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          name?: string
          status?: string | null
          video_urls?: string[] | null
        }
        Relationships: []
      }
      doctor_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          name: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          name: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      health_measurements: {
        Row: {
          client_id: string
          created_at: string
          id: string
          measurement_type: string
          notes: string | null
          recorded_at: string
          recorded_by: string | null
          unit: string
          value: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          measurement_type: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          unit: string
          value: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          measurement_type?: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          unit?: string
          value?: number
        }
        Relationships: []
      }
      health_profile_templates: {
        Row: {
          allergies: string[] | null
          attachments: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          diseases: string[] | null
          disliked_foods: string[] | null
          favorite_foods: string[] | null
          id: string
          medications: string[] | null
          name: string
          notes: string | null
          status: string | null
          supplements: string[] | null
          updated_at: string
          video_urls: string[] | null
        }
        Insert: {
          allergies?: string[] | null
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          diseases?: string[] | null
          disliked_foods?: string[] | null
          favorite_foods?: string[] | null
          id?: string
          medications?: string[] | null
          name: string
          notes?: string | null
          status?: string | null
          supplements?: string[] | null
          updated_at?: string
          video_urls?: string[] | null
        }
        Update: {
          allergies?: string[] | null
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          diseases?: string[] | null
          disliked_foods?: string[] | null
          favorite_foods?: string[] | null
          id?: string
          medications?: string[] | null
          name?: string
          notes?: string | null
          status?: string | null
          supplements?: string[] | null
          updated_at?: string
          video_urls?: string[] | null
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          allergies: string[] | null
          client_id: string
          created_at: string
          diseases: string[] | null
          disliked_foods: string[] | null
          favorite_foods: string[] | null
          id: string
          medications: string[] | null
          notes: string | null
          supplements: string[] | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          client_id: string
          created_at?: string
          diseases?: string[] | null
          disliked_foods?: string[] | null
          favorite_foods?: string[] | null
          id?: string
          medications?: string[] | null
          notes?: string | null
          supplements?: string[] | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          client_id?: string
          created_at?: string
          diseases?: string[] | null
          disliked_foods?: string[] | null
          favorite_foods?: string[] | null
          id?: string
          medications?: string[] | null
          notes?: string | null
          supplements?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          breakfast: Json | null
          created_at: string
          created_by: string | null
          day_number: number | null
          description: string | null
          dinner: Json | null
          id: string
          lunch: Json | null
          name: string
          package_type: string | null
          snacks: Json[] | null
          total_calories: number | null
        }
        Insert: {
          breakfast?: Json | null
          created_at?: string
          created_by?: string | null
          day_number?: number | null
          description?: string | null
          dinner?: Json | null
          id?: string
          lunch?: Json | null
          name: string
          package_type?: string | null
          snacks?: Json[] | null
          total_calories?: number | null
        }
        Update: {
          breakfast?: Json | null
          created_at?: string
          created_by?: string | null
          day_number?: number | null
          description?: string | null
          dinner?: Json | null
          id?: string
          lunch?: Json | null
          name?: string
          package_type?: string | null
          snacks?: Json[] | null
          total_calories?: number | null
        }
        Relationships: []
      }
      medical_notes: {
        Row: {
          client_id: string
          content: string | null
          created_at: string
          doctor_id: string
          id: string
          is_read: boolean | null
          severity: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          is_read?: boolean | null
          severity?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          is_read?: boolean | null
          severity?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string | null
          grants_content_access: boolean | null
          guest_email: string | null
          guest_name: string | null
          id: string
          notes: string | null
          phone: string | null
          shipping_address: string | null
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          grants_content_access?: boolean | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          grants_content_access?: boolean | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          notes: string | null
          package_id: string | null
          payment_method: string
          payment_type: string
          receipt_url: string | null
          sender_name: string | null
          sender_phone: string | null
          status: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_method: string
          payment_type: string
          receipt_url?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_method?: string
          payment_type?: string
          receipt_url?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          medical_followup_notes: string | null
          medical_followup_notes_ar: string | null
          medical_followup_required: boolean | null
          name: string
          name_ar: string | null
          price: number
          stock_quantity: number | null
          suitable_for: string | null
          suitable_for_ar: string | null
          updated_at: string
          usage_instructions: string | null
          usage_instructions_ar: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          medical_followup_notes?: string | null
          medical_followup_notes_ar?: string | null
          medical_followup_required?: boolean | null
          name: string
          name_ar?: string | null
          price?: number
          stock_quantity?: number | null
          suitable_for?: string | null
          suitable_for_ar?: string | null
          updated_at?: string
          usage_instructions?: string | null
          usage_instructions_ar?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          medical_followup_notes?: string | null
          medical_followup_notes_ar?: string | null
          medical_followup_required?: boolean | null
          name?: string
          name_ar?: string | null
          price?: number
          stock_quantity?: number | null
          suitable_for?: string | null
          suitable_for_ar?: string | null
          updated_at?: string
          usage_instructions?: string | null
          usage_instructions_ar?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          medical_followup: boolean | null
          payment_method: string | null
          phone: string | null
          selected_package: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          medical_followup?: boolean | null
          payment_method?: string | null
          phone?: string | null
          selected_package?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          medical_followup?: boolean | null
          payment_method?: string | null
          phone?: string | null
          selected_package?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_banners: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          position: string | null
          title: string | null
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          title?: string | null
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          title?: string | null
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          calories: number | null
          carbs_g: number | null
          category: string | null
          cook_time_minutes: number | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string | null
          fat_g: number | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: Json | null
          meal_type: string | null
          name: string
          package_type: string | null
          prep_time_minutes: number | null
          protein_g: number | null
          tags: string[] | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          meal_type?: string | null
          name: string
          package_type?: string | null
          prep_time_minutes?: number | null
          protein_g?: number | null
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          meal_type?: string | null
          name?: string
          package_type?: string | null
          prep_time_minutes?: number | null
          protein_g?: number | null
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      store_categories: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_ar: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transformations: {
        Row: {
          after_image_url: string | null
          before_image_url: string
          category: string | null
          client_name: string | null
          created_at: string
          description: string | null
          display_order: number | null
          duration_text: string | null
          id: string
          is_active: boolean | null
          is_combined_image: boolean | null
          rating: number | null
          title: string
          updated_at: string
          use_emoji_mask: boolean | null
          weight_after: number | null
          weight_before: number | null
        }
        Insert: {
          after_image_url?: string | null
          before_image_url: string
          category?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_text?: string | null
          id?: string
          is_active?: boolean | null
          is_combined_image?: boolean | null
          rating?: number | null
          title: string
          updated_at?: string
          use_emoji_mask?: boolean | null
          weight_after?: number | null
          weight_before?: number | null
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string
          category?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_text?: string | null
          id?: string
          is_active?: boolean | null
          is_combined_image?: boolean | null
          rating?: number | null
          title?: string
          updated_at?: string
          use_emoji_mask?: boolean | null
          weight_after?: number | null
          weight_before?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_content_access_via_order: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_role_on_signup: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "doctor" | "client"
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
      app_role: ["admin", "doctor", "client"],
    },
  },
} as const
