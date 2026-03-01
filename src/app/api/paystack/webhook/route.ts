import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerFirebaseInstances } from '@/firebase/server-instances';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        if (!signature) {
            return NextResponse.json({ message: 'No signature' }, { status: 400 });
        }

        // Verify signature
        const hmac = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY);
        const expectedSignature = hmac.update(body).digest('hex');

        if (signature !== expectedSignature) {
            console.warn('Invalid Paystack signature');
            return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);
        console.log('Paystack Webhook event:', event.event);

        if (event.event === 'charge.success') {
            const data = event.data;
            const amount = data.amount / 100; // to NGN
            const email = data.customer.email;
            const reference = data.reference;

            const { firestore } = getServerFirebaseInstances();

            // 1. Find user by email (or use customer code if stored)
            // For now, find user by email in 'users' collection or check 'wallets' if we store email there.
            // Better: Use metadata if it was a popup payment, but for DVA top-ups, it won't have metadata from our app.

            // Attempt to find user UID by email
            let uid = data.metadata?.userId; // If manually initialized with metadata

            if (!uid) {
                const usersRef = collection(firestore, 'users');
                const q = query(usersRef, where('email', '==', email), limit(1));
                const userDocs = await getDocs(q);

                if (!userDocs.empty) {
                    uid = userDocs.docs[0].id;
                }
            }

            if (uid) {
                const walletRef = doc(firestore, 'wallets', uid);
                const walletSnap = await getDoc(walletRef);

                if (walletSnap.exists()) {
                    const currentBalance = walletSnap.data()?.balance || 0;
                    const newBalance = currentBalance + amount;

                    // Check if this reference was already processed (idempotency)
                    const txnsRef = collection(firestore, 'wallets', uid, 'transactions');
                    const checkQ = query(txnsRef, where('reference', '==', reference), limit(1));
                    const existingTxns = await getDocs(checkQ);

                    if (existingTxns.empty) {
                        // Update balance
                        await updateDoc(walletRef, { balance: newBalance });

                        // Add transaction record
                        await addDoc(txnsRef, {
                            type: 'credit',
                            amount: amount,
                            description: `Top-up: ${data.channel || 'Paystack'}`,
                            timestamp: serverTimestamp(),
                            reference: reference,
                            gateway_response: data.gateway_response,
                            raw_data: data // Optional: store for debugging
                        });

                        console.log(`Successfully topped up ₦${amount} for user ${uid}`);
                    } else {
                        console.log('Duplicate transaction reference ignored:', reference);
                    }
                } else {
                    console.error('Wallet not found for user:', uid);
                }
            } else {
                console.warn('User not found for email:', email);
            }
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
