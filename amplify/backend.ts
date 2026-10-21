import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { analyze } from './functions/analyze/resource';

// `auth` is included only so Storage can grant guest (unauthenticated) S3 access.
// There is no sign-in UI anywhere in the app.
const backend = defineBackend({ auth, data, storage, analyze });

const fn = backend.analyze.resources.lambda;
fn.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel', 'bedrock:Converse'],
    resources: ['*'],
  }),
);
backend.storage.resources.bucket.grantRead(fn);
backend.analyze.addEnvironment('FIXIT_BUCKET', backend.storage.resources.bucket.bucketName);
