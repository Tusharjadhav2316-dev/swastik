const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});

const db = admin.firestore();

async function test() {
  console.log('Writing test document...');
  const ref = db.collection('test').doc('conn-test');
  await ref.set({ success: true, timestamp: new Date().toISOString() });
  console.log('Reading test document...');
  const doc = await ref.get();
  console.log('Document data:', doc.data());
  console.log('Firebase connection successful!');
  process.exit(0);
}

test().catch(e => {
  console.error('Firebase test failed:', e);
  process.exit(1);
});
