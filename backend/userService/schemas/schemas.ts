import { z } from 'zod';

export const SearchQuerySchema = z.object({
    q: z.string()
        .min(1, "Search query is required")
        .max(100, "Search query too long")
        .regex(/^[a-zA-Z0-9\s_-]+$/, "Invalid characters in search query")
});