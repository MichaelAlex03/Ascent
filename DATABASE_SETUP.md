# Database Setup Guide

## Overview

This guide will help you set up your Supabase database with Row Level Security (RLS) using Clerk authentication.

## Quick Setup

### 1. Run Database Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Open the file `supabase-migrations.sql`
5. Copy and paste the entire contents
6. Click **Run**

This will create:
- `users` table (if not exists)
- `climbs` table for tracking individual climbs
- `sessions` table for grouping climbs (optional)
- RLS policies for all tables
- Helper functions and triggers
- Statistics view

### 2. Configure Clerk JWT Template

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates**
3. Click **New Template**
4. Name it: `supabase`
5. Add this claim:
```json
{
  "clerk_id": "{{user.id}}"
}
```
6. Save the template

### 3. Configure Supabase to Accept Clerk JWTs

1. In Clerk Dashboard, copy your **JWKS URL** from the JWT template
2. Go to Supabase Dashboard → **Authentication** → **Providers**
3. Enable **JWT Provider**
4. Paste your Clerk JWKS URL
5. Save

### 4. Environment Variables

Make sure you have these in your `.env` files:

**Frontend (.env in `ascent/`):**
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (.env in `backend/`):**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Database Schema

### Tables

**users**
- Stores basic user info linked to Clerk ID
- Created automatically via webhook when user signs up

**climbs**
- Individual climb records
- Fields: type (boulder/route), grade, wall_type, attempts, notes
- Linked to user via `clerk_id`

**sessions** (optional)
- Group climbs into sessions
- Fields: date, location, duration, notes

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only see their own data
- Users can only insert/update/delete their own data
- Data is automatically filtered by `clerk_id` from Clerk JWT

## Usage Examples

### Frontend (React Native)

```typescript
import { useAuth } from '@clerk/clerk-expo';
import { createClient } from '@supabase/supabase-js';
import type { Climb, InsertClimb } from '@/types/database';

const useSupabaseClient = () => {
  const { getToken } = useAuth();

  return createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' });
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );
};

// In your component
const supabase = useSupabaseClient();
const { user } = useAuth();

// Insert a climb
const newClimb: InsertClimb = {
  clerk_id: user!.id,
  climb_type: 'boulder',
  grade: 'V5',
  wall_type: 'overhang',
  attempts: 3,
  notes: 'Great dyno move',
  session_date: new Date().toISOString().split('T')[0],
  completed: true,
};

const { data, error } = await supabase
  .from('climbs')
  .insert(newClimb)
  .select()
  .single();

// Query user's climbs
const { data: climbs } = await supabase
  .from('climbs')
  .select('*')
  .order('session_date', { ascending: false })
  .limit(10);

// Get stats
const { data: stats } = await supabase
  .from('climb_stats')
  .select('*')
  .eq('climb_type', 'boulder');
```

### Backend (Express)

```typescript
import { createSupabaseAdminClient } from './config/supabase';
import { clerkMiddleware, getAuth } from '@clerk/express';

app.use(clerkMiddleware());

app.get('/api/climbs', async (req, res) => {
  const { userId } = getAuth(req); // Clerk ID from middleware

  const supabase = createSupabaseAdminClient();

  // Manually filter by clerk_id when using service role
  const { data, error } = await supabase
    .from('climbs')
    .select('*')
    .eq('clerk_id', userId)
    .order('session_date', { ascending: false });

  res.json(data);
});
```

## Testing RLS

You can test your RLS policies in the Supabase SQL Editor:

```sql
-- This should fail (no access to other users' data)
SELECT * FROM climbs WHERE clerk_id != auth.jwt()->>'clerk_id';

-- This should succeed (your own data)
SELECT * FROM climbs WHERE clerk_id = auth.jwt()->>'clerk_id';
```

## Troubleshooting

**Issue: "Row Level Security policy violated"**
- Check that Clerk JWT template is named exactly "supabase"
- Verify JWKS URL is configured in Supabase
- Ensure you're passing the correct template name: `getToken({ template: 'supabase' })`

**Issue: "No rows returned"**
- Make sure you're authenticated and have a valid Clerk session
- Check that the `clerk_id` in your database matches your Clerk user ID
- Verify RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'climbs';`

**Issue: "JWT validation failed"**
- Verify Clerk JWKS URL is correct in Supabase
- Check that token is being sent in Authorization header
- Ensure Clerk publishable key is correct

## Next Steps

1. Run the migration in Supabase
2. Configure Clerk JWT template
3. Update your frontend to use the Supabase client with Clerk tokens
4. Start tracking climbs!