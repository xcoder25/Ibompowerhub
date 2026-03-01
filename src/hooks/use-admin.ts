
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export type UserProfile = {
    role?: string;
};

export function useAdmin() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [firestore, user]
    );

    const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const isAdmin = profile?.role === 'Admin';
    const isLoading = isUserLoading || isProfileLoading;

    return { isAdmin, isLoading };
}
