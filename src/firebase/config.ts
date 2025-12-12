
// This configuration is populated by environment variables.
// If you are running this project locally, you will need to create a .env file
// in the root of your project with the following content:
//
// NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","appId":"..."}

export function getFirebaseConfig() {
  const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

  if (!firebaseConfigStr) {
    if (typeof window === 'undefined') {
      // On the server, if the config is missing, we can't do anything.
      // We return an empty object and let the client-side provider handle it.
      return {};
    }
    // On the client, this is a critical error.
    throw new Error(
      'Missing NEXT_PUBLIC_FIREBASE_CONFIG environment variable.'
    );
  }

  try {
    const config = JSON.parse(firebaseConfigStr);
    if (
      !config.apiKey ||
      !config.authDomain ||
      !config.projectId ||
      !config.appId
    ) {
      throw new Error('Invalid Firebase config object.');
    }
    return config;
  } catch (e) {
    console.error('Could not parse Firebase config:', e);
    if (typeof window !== 'undefined') {
       throw new Error('Failed to parse Firebase configuration. Check the format of NEXT_PUBLIC_FIREBASE_CONFIG.');
    }
    return {};
  }
}

export const firebaseConfig = getFirebaseConfig();
