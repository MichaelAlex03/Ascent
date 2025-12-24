export type ClimbType = 'boulder' | 'route';
export type WallType = 'slab' | 'vertical' | 'overhang';

export interface CreateClimb {
  climb_type: ClimbType;
  grade: string;
  climb_wall_type: WallType;
  climb_attempts: number;
  climb_notes?: string;
  clerk_id: string;
}

export interface Climb {
  id: string;
  clerk_id: string;
  climb_type: ClimbType;
  grade: string;
  climb_wall_type: WallType;
  climb_attempts: number;
  climb_notes?: string;
  created_at: string;
}