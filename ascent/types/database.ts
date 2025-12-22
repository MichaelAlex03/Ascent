// Database types generated from Supabase schema

export type ClimbType = 'boulder' | 'route';
export type WallType = 'slab' | 'vertical' | 'overhang';

export interface User {
  id: string;
  clerk_id: string;
  created_at: string;
  updated_at: string;
}

export interface Climb {
  id: string;
  clerk_id: string;
  climb_type: ClimbType;
  grade: string;
  wall_type: WallType | null;
  attempts: number;
  notes: string | null;
  session_date: string; // ISO date string
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  clerk_id: string;
  session_date: string; // ISO date string
  location: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClimbStats {
  clerk_id: string;
  climb_type: ClimbType;
  grade: string;
  total_sends: number;
  avg_attempts: number;
  first_send: string; // ISO date string
  last_send: string; // ISO date string
}

// Insert types (fields that are auto-generated are optional)
export type InsertClimb = Omit<Climb, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type InsertSession = Omit<Session, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// Update types (all fields optional except id)
export type UpdateClimb = Partial<Omit<Climb, 'id' | 'clerk_id' | 'created_at'>> & {
  id: string;
};

export type UpdateSession = Partial<Omit<Session, 'id' | 'clerk_id' | 'created_at'>> & {
  id: string;
};