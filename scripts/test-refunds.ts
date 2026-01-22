import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 1. Load Env Vars manually from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value.trim();
      }
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        supabaseAnonKey = value.trim();
      }
    }
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('🧪 Starting Refund System Verification (Green Phase)...');
  let hasErrors = false;

  // Test 1: Check if `refund_requests` table exists
  console.log('\n[1] Testing refund_requests table existence...');
  try {
    const { data, error } = await supabase
      .from('refund_requests')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Failure: refund_requests table check failed: ${error.message}`);
      hasErrors = true;
    } else {
      console.log('✅ Success: refund_requests table exists and is queryable.');
    }
  } catch (err: any) {
    console.log(`ℹ️ Unexpected exception: ${err.message}`);
    hasErrors = true;
  }

  if (hasErrors) {
    console.log('\n⚠️  Verification failed: The database migration has not been applied correctly.');
    process.exit(1);
  } else {
    console.log('\n✅ Green Phase Complete: Refund System infrastructure is implemented.');
    process.exit(0);
  }
}

runTest();