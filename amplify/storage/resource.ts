import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'fixitBobcatPhotos',
  access: (allow) => ({ 'photos/*': [allow.guest.to(['read', 'write'])] }),
});
