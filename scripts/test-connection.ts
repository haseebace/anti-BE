import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Load environment variables
  const envPath = path.resolve(process.cwd(), '.env.local');
  console.log(`Loading env from: ${envPath}`);
  dotenv.config({ path: envPath });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables.');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:', supabaseKey ? '******' : undefined);
    process.exit(1);
  }

  console.log('URL:', supabaseUrl);
  // console.log('Key:', supabaseKey); // Don't log the full key for security, just presence

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Try to perform a simple health check or query
    // Since we don't know the exact schema permissions, we'll try a light query on 'jobs'
    // or just check if we can reach the server.
    
    console.log('Attempting to query "jobs" table...');
    const { data, error } = await supabase.from('jobs').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Connection failed with error:', error.message);
      // It might be a permission error, which still means we connected but were denied.
      if (error.code === '42501' || error.code === 'PGRST301') {
         console.log('Note: Connection established, but permission denied (RLS). This confirms the client can reach Supabase.');
      }
    } else {
      console.log('Connection successful!');
      console.log('Successfully connected to Supabase and queried "jobs" table.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
