import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://alxmetxipiayqcbvdnyv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFseG1ldHhpcGlheXFjYnZkbnl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjI3MDU2NywiZXhwIjoyMDQxODQ2NTY3fQ.9cxa7TYAetzeq258qJWYVluLPlB7ncCKfO4L-XXt4Ek'

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Remove the initSupabase function as it's no longer needed