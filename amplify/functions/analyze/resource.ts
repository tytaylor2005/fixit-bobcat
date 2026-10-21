import { defineFunction } from '@aws-amplify/backend';

// Spec default was us.anthropic.claude-sonnet-4-20250514-v1:0 (end-of-life on Bedrock).
// Sonnet 4.5 (us.anthropic.claude-sonnet-4-5-20250929-v1:0) works from the CLI but the
// account still needs the Anthropic use-case form before Lambda calls succeed, so Nova Lite is the default.
export const analyze = defineFunction({
  name: 'analyze',
  entry: './handler.ts',
  timeoutSeconds: 60,
  environment: { MODEL_ID: 'us.amazon.nova-lite-v1:0' },
});
