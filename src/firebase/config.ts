
// This configuration is populated by environment variables.
// If you are running this project locally, you will need to create a .env file
// in the root of your project with the following content:
//
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
// NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
// NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id

export function getFirebaseConfig() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    throw new Error(
      'Missing NEXT_PUBLIC_FIREBASE_CONFIG environment variable'
    );
  }

  return firebaseConfig;
}

export const firebaseConfig = getFirebaseConfig();
