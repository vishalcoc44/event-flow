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
  console.log('🧪 Starting QR Code Support Verification (Green Phase)...');
  let hasErrors = false;

  // Test 1: Check if `qr_code_token` column exists in `bookings`
  console.log('\n[1] Testing bookings table for qr_code_token column...');
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('qr_code_token')
      .limit(1);

    if (error) {
      console.log(`❌ Failure: Error selecting qr_code_token: ${error.message}`);
      hasErrors = true;
    } else {
      console.log('✅ Success: qr_code_token column exists in bookings table.');
    }
  } catch (err: any) {
    console.log(`ℹ️ Unexpected exception: ${err.message}`);
    hasErrors = true;
  }

  if (hasErrors) {
    console.log('\n⚠️  Verification failed: The database migration has not been applied correctly.');
    process.exit(1);
  } else {
    console.log('\n✅ Green Phase Complete: QR Code Support infrastructure is implemented.');
    process.exit(0);
  }
}

runTest();