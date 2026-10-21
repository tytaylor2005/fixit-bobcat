import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ImageFormat,
} from '@aws-sdk/client-bedrock-runtime';
import type { Schema } from '../../data/resource';

const s3 = new S3Client({});
const bedrock = new BedrockRuntimeClient({});

const MODEL_ID = process.env.MODEL_ID ?? 'us.amazon.nova-lite-v1:0';
const BUCKET = process.env.FIXIT_BUCKET ?? '';

const CATEGORIES = ['WATER', 'ENERGY', 'WASTE', 'DAMAGE', 'OTHER'] as const;
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

type Analysis = {
  category: string;
  title: string;
  description: string;
  impact: string;
  impactScore: number;
  severity: string;
  action: string;
};

const FALLBACK: Analysis = {
  category: 'OTHER',
  title: 'Possible issue spotted',
  description:
    "Bobcat couldn't fully analyze this photo, but a student flagged it. Please take a look.",
  impact: 'Unknown',
  impactScore: 3,
  severity: 'MEDIUM',
  action: 'Send someone to check.',
};

const buildPrompt = (building: string) => `You are FixIt Bobcat, a campus sustainability assistant for Georgia College & State University.
Look at the photo. It was taken in or near: ${building}.
Identify the waste or maintenance problem and respond with ONLY a JSON object, no prose, no markdown:
{"category":"WATER|ENERGY|WASTE|DAMAGE|OTHER",
 "title":"max 8 words",
 "description":"1-2 sentences, plain language, written as a facilities report",
 "impact":"a concrete estimate with a unit, e.g. '~1,500 gallons/week' or '~3 kWh/day'. If unsure, give a rough range.",
 "impactScore":1-10 integer (10 = worst),
 "severity":"LOW|MEDIUM|HIGH",
 "action":"one sentence telling facilities what to do"}
If the photo shows nothing wrong, use category OTHER, severity LOW, impactScore 1, and say so kindly.`;

const imageFormatFor = (key: string): ImageFormat => {
  const ext = key.toLowerCase().split('.').pop() ?? '';
  if (ext === 'png') return 'png';
  if (ext === 'gif') return 'gif';
  if (ext === 'webp') return 'webp';
  return 'jpeg';
};

const str = (v: unknown, fallback: string) =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback;

/** Coerce whatever the model returned into a valid AnalysisResult. */
const normalize = (raw: Record<string, unknown>): Analysis => {
  const category = String(raw.category ?? '').toUpperCase();
  const severity = String(raw.severity ?? '').toUpperCase();
  const score = Math.round(Number(raw.impactScore));
  return {
    category: (CATEGORIES as readonly string[]).includes(category) ? category : 'OTHER',
    title: str(raw.title, FALLBACK.title),
    description: str(raw.description, FALLBACK.description),
    impact: str(raw.impact, FALLBACK.impact),
    impactScore: Number.isFinite(score) ? Math.min(10, Math.max(1, score)) : FALLBACK.impactScore,
    severity: (SEVERITIES as readonly string[]).includes(severity) ? severity : 'MEDIUM',
    action: str(raw.action, FALLBACK.action),
  };
};

export const handler: Schema['analyze']['functionHandler'] = async (event) => {
  const { photoKey, building } = event.arguments;
  const where = building?.trim() || 'the GCSU campus';
  console.log('analyze start', { photoKey, building: where, model: MODEL_ID, bucket: BUCKET });

  try {
    // 1. Photo bytes from S3
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: photoKey }));
    if (!obj.Body) throw new Error('Empty S3 body');
    const bytes = await obj.Body.transformToByteArray();
    console.log('photo bytes', bytes.byteLength);

    // 2. Bedrock Converse with an image block
    const res = await bedrock.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        messages: [
          {
            role: 'user',
            content: [
              { image: { format: imageFormatFor(photoKey), source: { bytes } } },
              { text: buildPrompt(where) },
            ],
          },
        ],
        inferenceConfig: { maxTokens: 400, temperature: 0.2 },
      }),
    );

    const text =
      res.output?.message?.content
        ?.map((block) => ('text' in block ? block.text : ''))
        .join('') ?? '';
    console.log('raw model text', text);

    // 3. Strict JSON: first {...} block only
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object in model output');
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    const result = normalize(parsed);
    console.log('analysis', result);
    return result;
  } catch (err) {
    // 4. Never throw — the demo must not die.
    console.error('analyze failed, returning fallback', err);
    return FALLBACK;
  }
};
