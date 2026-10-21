import { defineFunction } from '@aws-amplify/backend';

// Spec default was us.anthropic.claude-sonnet-4-20250514-v1:0, but that model is
// end-of-life on Bedrock (verified 2026-10-21). Sonnet 4.5 is the live equivalent.
// Swap to us.amazon.nova-lite-v1:0 here if Claude access is denied.
export const analyze = defineFunction({
  name: 'analyze',
  entry: './handler.ts',
  timeoutSeconds: 60,
  environment: { MODEL_ID: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0' },
});
