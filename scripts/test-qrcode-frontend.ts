import * as QRCode from 'qrcode.react';

async function runTest() {
  console.log('🧪 Verifying qrcode.react installation...');
  
  if (QRCode) {
    console.log('✅ Success: qrcode.react is installed and available.');
    process.exit(0);
  } else {
    console.error('❌ Failure: qrcode.react could not be loaded.');
    process.exit(1);
  }
}

runTest();
