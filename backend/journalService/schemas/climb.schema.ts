import { z } from 'zod';

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