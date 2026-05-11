import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export async function POST(req: Request) {
  try {
    const { descriptor, uid } = await req.json();

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ error: 'Invalid descriptor' }, { status: 400 });
    }

    let matchedUid: string | null = null;
    let bestDistance = Infinity;

    if (uid) {
      // Direct lookup by uid / email
      const doc = await adminDb.collection('users').doc(uid).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'No face data for that user' }, { status: 404 });
      }
      const stored = doc.data()?.faceDescriptor;
      if (!Array.isArray(stored) || stored.length !== 128) {
        return NextResponse.json({ error: 'Corrupt stored descriptor' }, { status: 500 });
      }
      bestDistance = euclidean(descriptor, stored);
      matchedUid = uid;
    } else {
      // Global search — find closest registered face
      const snap = await adminDb.collection('users').get();
      for (const doc of snap.docs) {
        const stored = doc.data()?.faceDescriptor;
        if (!Array.isArray(stored) || stored.length !== 128) continue;
        const dist = euclidean(descriptor, stored);
        if (dist < bestDistance) {
          bestDistance = dist;
          matchedUid = doc.id;
        }
      }
    }

    if (matchedUid && bestDistance < 0.55) {
      const token = await adminAuth.createCustomToken(matchedUid);
      return NextResponse.json({ success: true, token, distance: bestDistance, uid: matchedUid });
    }

    return NextResponse.json({ success: false, distance: bestDistance, error: 'No match found' }, { status: 401 });

  } catch (err: any) {
    console.error('face-login error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
