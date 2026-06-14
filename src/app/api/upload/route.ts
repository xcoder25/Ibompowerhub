import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob | null;
        const uid = formData.get('uid') as string | null;

        if (!file || !uid) {
            return NextResponse.json(
                { error: 'File and uid are required.' },
                { status: 400 }
            );
        }

        // Vercel Blob requires the BLOB_READ_WRITE_TOKEN from your .env natively.
        // It will automatically use process.env.BLOB_READ_WRITE_TOKEN.
        
        const filename = `users/${uid}/profile_${Date.now()}.jpg`;

        // Upload the file to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN // Explicitly enforce token just in case
        });

        return NextResponse.json({ url: blob.url });
    } catch (error: any) {
        console.error('Vercel Blob upload failed:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to upload image' },
            { status: 500 }
        );
    }
}
