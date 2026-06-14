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

        const connection = new WebApi(partnerId, null, apiKey, sidServer);

        // DEMO MODE: If using placeholder keys, return a simulated success for the UI demo
        if (partnerId === 'your_partner_id' || !apiKey || apiKey === 'your_api_key') {
            console.log('--- SMILE ID DEMO MODE ACTIVE ---');
            const mockResponse = {
                ResultCode: '0000',
                ResultText: 'Verified (Demo Mode)',
                unverified_fields: [],
            };
            const { firestore } = getServerFirebaseInstances();
            if (userId) {
                const kycDocRef = doc(firestore, 'kyc', userId);
                await setDoc(kycDocRef, { bvnVerified: true }, { merge: true });
            }
            return NextResponse.json(mockResponse);
        }

        const partnerParams = {
            user_id: userId,
            job_id: `job_${Date.now()}`,
            job_type: 5, // 5 is Enhanced KYC
        };

        const imageDetails: any[] = [];

        const idInfo = {
            entered: true,
            country: 'NG',
            id_number: idNumber,
            id_type: idType || 'BVN',
            dob: dob, // YYYY-MM-DD
        };

        const response: any = await connection.submit_job(partnerParams, imageDetails, idInfo);

        if (response.ResultCode === '1012' || response.ResultCode === '1010' || response.ResultCode === '0000') {
            const { firestore } = getServerFirebaseInstances();
            if (userId) {
                const kycDocRef = doc(firestore, 'kyc', userId);
                await setDoc(kycDocRef, { bvnVerified: true }, { merge: true });
            }
        }

        return NextResponse.json(response);
    } catch (error: any) {
        const errorData = error.response?.data || error.message;
        console.error('Smile ID Enhanced KYC Error Detailed:', JSON.stringify(errorData, null, 2));
        return NextResponse.json({ 
            error: error.message, 
            details: errorData 
        }, { status: 500 });
    }
}
