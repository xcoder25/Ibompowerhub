import { NextResponse } from 'next/server';
import { getServerFirebaseInstances } from '@/firebase/server-instances';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('Smile ID Callback received:', data);

        const { user_id, ResultCode, job_type } = data;

        if (ResultCode === '0812' || ResultCode === '0810' || ResultCode === '0000') {
            const { firestore } = getServerFirebaseInstances();
            const kycDocRef = doc(firestore, 'kyc', user_id);

            const updates: any = {};
            if (job_type === 6) updates.faceVerified = true;
            if (job_type === 1 || job_type === 11) updates.identityVerified = true;
            if (job_type === 5) updates.bvnVerified = true;

            await setDoc(kycDocRef, updates, { merge: true });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Smile ID Callback Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
