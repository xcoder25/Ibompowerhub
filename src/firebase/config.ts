
// This configuration is populated by environment variables.
// If you are running this project locally, you will need to create a .env file
// in the root of your project with the following content:
//
// NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","appId":"..."}

export function getFirebaseConfig() {
  // The configuration is hardcoded here to prevent environment variable parsing issues.
  const firebaseConfig = {
    projectId: 'applaud-cf1zc',
    appId: '1:190947417613:web:c1c1e2835105b28b31bf44',
    apiKey: 'AIzaSyBcJWdofLf59OOgJB63IqAY3-KVMy_seaM',
    authDomain: 'applaud-cf1zc.firebaseapp.com',
    storageBucket: 'applaud-cf1zc.firebasestorage.app',
    measurementId: '',
    messagingSenderId: '190947417613',
  };

  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId ||
    !firebaseConfig.storageBucket
  ) {
    throw new Error('Invalid hardcoded Firebase config object.');
  }
  return firebaseConfig;
}
