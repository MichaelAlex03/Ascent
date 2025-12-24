// Application types based on database schema
import { z } from 'zod'

export type ClimbType = 'boulder' | 'route';
export type WallType = 'slab' | 'vertical' | 'overhang';

// Full Climb type from database
export interface Climb {
  id: number;
  created_at: string;
  climb_type: ClimbType;
  climb_attempts: number;
  climb_wall_type: WallType;
  climb_notes: string | null;
  grade: string
  clerk_id: string;
}





// Type for creating a new climb (what gets passed to handleSaveClimb)
export const CreateClimbSchema = z.object({
  climb_type: z.enum(['boulder', 'route']),
  grade: z.string()
    .min(1, "Grade is required")
    .max(10, "Grade must be 10 characters or less"),
  climb_wall_type: z.enum(['slab', 'vertical', 'overhang']),
  climb_attempts: z.number()
    .int("Attempts must be a whole number")
    .positive("Attempts must be a positive number")
    .max(999, "Attempts must be less than 1000"),
  climb_notes: z.string()
    .max(500, "Notes must be 500 characters or less")
    .optional()
});

export type CreateClimbInput = z.infer<typeof CreateClimbSchema>;

// User search types
export interface UserSearchResult {
    clerk_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
}
