import { NextResponse } from 'next/server';
// @ts-ignore
import { WebApi } from 'smile-identity-core';

export async function POST(request: Request) {
    try {
        const { userId, jobType } = await request.json();

        const partnerId = process.env.NEXT_PUBLIC_SMILE_ID_PARTNER_ID || process.env.SMILE_ID_PARTNER_ID || '';
        const apiKey = process.env.SMILE_ID_API_KEY || '';
        const sidServer = '0'; // 0 for sandbox, 1 for production

        const connection = new WebApi(partnerId, null, apiKey, sidServer);

        // DEMO MODE: If using placeholder keys, return a mock token for the Web SDK demo
        if (partnerId === 'your_partner_id' || !apiKey || apiKey === 'your_api_key') {
            return NextResponse.json({ 
                token: 'demo_token_' + Date.now(),
                success: true,
                is_demo: true 
            });
        }

        const product = jobType === 11 ? 'document_verification' : 'biometric_kyc';

        const requestParams = {
            user_id: userId,
            job_id: `job_${Date.now()}`,
            product,
            callback_url: process.env.NEXT_PUBLIC_SMILE_ID_CALLBACK_URL || 'https://powerhub.com/api/kyc/callback',
        };

        const tokenResponse = await connection.get_web_token(requestParams);

        return NextResponse.json(tokenResponse);
    } catch (error: any) {
        console.error('Smile ID Session Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
