// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hprhgienavyayohzyysk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcmhnaWVuYXZ5YXlvaHp5eXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjYzODYsImV4cCI6MjA2NTkwMjM4Nn0.DaQVZACNKO78tTRnlqPzv1NQhRXmfNW0TdHReUnwkqI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);