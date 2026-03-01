import { NextResponse } from 'next/server';
// @ts-ignore
import { WebApi } from 'smile-identity-core';

export async function POST(request: Request) {
    try {
        const { userId, jobType } = await request.json();

        const partnerId = process.env.SMILE_ID_PARTNER_ID || '';
        const apiKey = process.env.SMILE_ID_API_KEY || '';
        const sidServer = '0'; // 0 for sandbox, 1 for production

        const connection = new WebApi(partnerId, apiKey, sidServer);

        const requestParams = {
            user_id: userId,
            job_id: `job_${Date.now()}`,
            job_type: jobType || 6, // 6 for SmartSelfie
            callback_url: process.env.NEXT_PUBLIC_SMILE_ID_CALLBACK_URL,
        };

        const tokenResponse = await connection.get_web_token(requestParams);

        return NextResponse.json(tokenResponse);
    } catch (error: any) {
        console.error('Smile ID Session Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
