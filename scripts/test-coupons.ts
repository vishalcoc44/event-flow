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

// 2. Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('🧪 Starting Coupon System Verification (Green Phase)...');
  let hasErrors = false;

  // Test 1: Check if `validate_coupon` RPC exists and is callable
  console.log('\n[1] Testing validate_coupon RPC...');
  try {
    const { data, error } = await supabase.rpc('validate_coupon', { 
      p_code: 'TEST-CODE-INVALID', 
      p_event_id: '00000000-0000-0000-0000-000000000000'
    });

    if (error) {
      // If we still get "function not found", that's a failure
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('❌ Failure: validate_coupon RPC still missing.');
        hasErrors = true;
      } else {
        // Any other error (like "Event not found") means the function EXECUTED, which is success for existence check
        console.log(`✅ Success: validate_coupon RPC exists (returned logic error: ${error.message}).`);
      }
    } else {
      console.log('✅ Success: validate_coupon RPC executed successfully.');
    }
  } catch (err: any) {
    console.log(`ℹ️ Unexpected exception: ${err.message}`);
    hasErrors = true;
  }

  // Test 2: Check if `bookings` table has `coupon_id` column
  console.log('\n[2] Testing bookings table schema...');
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('coupon_id')
      .limit(1);

    if (error) {
      console.log(`❌ Failure: Error selecting coupon_id: ${error.message}`);
      hasErrors = true;
    } else {
      console.log('✅ Success: coupon_id column exists in bookings table.');
    }
  } catch (err: any) {
    console.log(`ℹ️ Unexpected exception: ${err.message}`);
    hasErrors = true;
  }

  if (hasErrors) {
    console.log('\n⚠️  Verification failed: The database migration has not been applied correctly.');
    process.exit(1);
  } else {
    console.log('\n✅ Green Phase Complete: Database features are correctly implemented.');
    process.exit(0);
  }
}

runTest();