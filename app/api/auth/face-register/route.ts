import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { descriptor, uid } = body;

    if (!descriptor || !uid) {
      return NextResponse.json({ error: 'Missing descriptor or uid' }, { status: 400 });
    }

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ error: 'Invalid descriptor format. Expected 128D array.' }, { status: 400 });
    }

    // Save to Firestore instead of Firebase Storage
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({
      faceDescriptor: descriptor,
      createdAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Face descriptor saved successfully to Firestore' });

  } catch (error: any) {
    console.error('Face register error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
