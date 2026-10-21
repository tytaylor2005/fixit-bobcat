import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { analyze } from '../functions/analyze/resource';

const schema = a.schema({
  Report: a
    .model({
      photoKey: a.string().required(),
      building: a.string().required(),
      category: a.enum(['WATER', 'ENERGY', 'WASTE', 'DAMAGE', 'OTHER']),
      title: a.string().required(),
      description: a.string(),
      impact: a.string(), // human string, e.g. "~1,500 gallons/week"
      impactScore: a.integer(), // 1–10, used for the stat tile
      severity: a.enum(['LOW', 'MEDIUM', 'HIGH']),
      action: a.string(),
      status: a.enum(['OPEN', 'FIXED']),
      estimatedCost: a.float(), // expected repair cost in USD (AI-suggested, staff-editable)
    })
    .authorization((allow) => [
      // Students (no account): report and browse.
      allow.publicApiKey().to(['create', 'read']),
      // Signed-in staff: mark fixed, set expected cost, clean up.
      allow.authenticated().to(['read', 'update', 'delete']),
    ]),

  AnalysisResult: a.customType({
    category: a.string(),
    title: a.string(),
    description: a.string(),
    impact: a.string(),
    impactScore: a.integer(),
    severity: a.string(),
    action: a.string(),
    estimatedCost: a.float(),
  }),

  analyze: a
    .query()
    .arguments({ photoKey: a.string().required(), building: a.string() })
    .returns(a.ref('AnalysisResult'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(analyze)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
