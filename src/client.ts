import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

let client: ReturnType<typeof generateClient<Schema>> | null = null;

/** Lazily created so it is built after Amplify.configure() has run. */
export const getClient = () => {
  if (!client) client = generateClient<Schema>();
  return client;
};
