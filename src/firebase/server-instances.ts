import { getFirebaseConfig } from './config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export function getServerFirebaseInstances(): {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
} {
    const firebaseConfig = getFirebaseConfig();
    const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);
    return { firebaseApp, auth, firestore, storage };
}
