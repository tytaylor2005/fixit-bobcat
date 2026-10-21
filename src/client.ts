import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

type Client = ReturnType<typeof generateClient<Schema>>;

let publicClient: Client | null = null;
let staffClient: Client | null = null;

/** Students: public API key. Lazily created so it is built after Amplify.configure(). */
export const getClient = () => {
  if (!publicClient) publicClient = generateClient<Schema>();
  return publicClient;
};

/** Staff: signed-in Cognito user. Can update / delete reports. */
export const getStaffClient = () => {
  if (!staffClient) staffClient = generateClient<Schema>({ authMode: 'userPool' });
  return staffClient;
};
