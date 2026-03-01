import { NextResponse } from 'next/server';
// @ts-ignore
import { WebApi } from 'smile-identity-core';
import { getServerFirebaseInstances } from '@/firebase/server-instances';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const { userId, idNumber, idType, dob } = await request.json();

        const partnerId = process.env.NEXT_PUBLIC_SMILE_ID_PARTNER_ID || '';
        const apiKey = process.env.SMILE_ID_API_KEY || '';
        const sidServer = '0'; // 0 for sandbox

        const connection = new WebApi(partnerId, apiKey, sidServer);

        const requestParams = {
            user_id: userId,
            job_id: `job_${Date.now()}`,
            job_type: 1, // Enhanced KYC
            id_info: {
                id_number: idNumber,
                id_type: idType || 'BVN',
                dob: dob, // YYYY-MM-DD
            },
        };

        const response = await connection.submit_job(requestParams);

        if (response.ResultCode === '1012' || response.ResultCode === '1010' || response.ResultCode === '0000') {
            const { firestore } = getServerFirebaseInstances();
            const kycDocRef = doc(firestore, 'kyc', userId);
            await setDoc(kycDocRef, { bvnVerified: true }, { merge: true });
        }

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Smile ID Enhanced KYC Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
