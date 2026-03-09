import { buildUserPrompt } from './prompts';
import type { AnalysisRequest, Env } from './validators';

export const OPENAI_MODEL = 'gpt-5-mini';

type JsonSchema = {
  type: 'object';
  additionalProperties: boolean;
  required: string[];
  properties: Record<string, unknown>;
};

type OpenAIResponseShape = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

function extractOutputText(payload: OpenAIResponseShape) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text;
  }

  for (const item of payload.output || []) {
    for (const contentItem of item.content || []) {
      if (contentItem.type === 'output_text' && typeof contentItem.text === 'string') {
        return contentItem.text;
      }
    }
  }

  return '';
}

export async function requestStructuredOutput<T>(options: {
  env: Env;
  schemaName: string;
  schema: JsonSchema;
  systemPrompt: string;
  payload: AnalysisRequest;
}) {
  const apiKey = options.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: options.systemPrompt,
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: buildUserPrompt(options.payload),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: options.schemaName,
          strict: true,
          schema: options.schema,
        },
      },
    }),
  });

  const json = (await response.json()) as OpenAIResponseShape;

  if (!response.ok) {
    throw new Error(json.error?.message || 'OPENAI_REQUEST_FAILED');
  }

  const outputText = extractOutputText(json);

  if (!outputText) {
    throw new Error('OPENAI_INVALID_RESPONSE');
  }

  try {
    return JSON.parse(outputText) as T;
  } catch {
    throw new Error('OPENAI_INVALID_RESPONSE');
  }
}
