import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import fallbackConfig from '../firebase-applet-config.json';

function readConfigValue(envVal: string | undefined, fallbackVal: string): string {
  const trimmed = envVal?.trim();
  if (trimmed) return trimmed;
  return fallbackVal;
}

const firebaseConfig = {
  apiKey: readConfigValue(import.meta.env.VITE_FIREBASE_API_KEY, fallbackConfig.apiKey),
  authDomain: readConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, fallbackConfig.authDomain),
  projectId: readConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, fallbackConfig.projectId),
  storageBucket: readConfigValue(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    fallbackConfig.storageBucket
  ),
  messagingSenderId: readConfigValue(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    fallbackConfig.messagingSenderId
  ),
  appId: readConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, fallbackConfig.appId),
};

const rawDatabaseId = readConfigValue(
  import.meta.env.VITE_FIREBASE_DATABASE_ID,
  fallbackConfig.firestoreDatabaseId
);

const app = initializeApp(firebaseConfig);
const useDefaultDatabase =
  !rawDatabaseId || rawDatabaseId === '(default)' || rawDatabaseId.startsWith('YOUR_');

export const db = useDefaultDatabase ? getFirestore(app) : getFirestore(app, rawDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const BOOTSTRAP_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'YOUR_ADMIN_EMAIL@example.com'
)
  .trim()
  .toLowerCase();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Connection check fails silently when offline or before Firebase config is set
  }
}

void testConnection();
