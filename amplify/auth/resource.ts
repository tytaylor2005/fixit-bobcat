import { defineAuth } from '@aws-amplify/backend';

/**
 * No login screens anywhere in the app. This resource exists ONLY because
 * Amplify Storage's `allow.guest` needs a Cognito identity pool (unauthenticated
 * role) to hand guest users temporary S3 credentials.
 */
export const auth = defineAuth({
  loginWith: { email: true },
});
