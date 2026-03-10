import { buildUserPrompt } from './prompts';
import type { AnalysisRequest, Env } from './validators';

export const OPENAI_MODEL = 'gpt-5-mini';
export const DEFAULT_PROMPT_ID = 'pmpt_69afac7cf8708197857cfc48545f299e095889951166ccf9';
export const DEFAULT_PROMPT_VERSION = '1';

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

  const promptId = options.env.OPENAI_PROMPT_ID || DEFAULT_PROMPT_ID;
  const promptVersion = options.env.OPENAI_PROMPT_VERSION || DEFAULT_PROMPT_VERSION;
  const userInputText = buildUserPrompt(options.payload);

  const requestBody =
    promptId
      ? {
          prompt: {
            id: promptId,
            version: promptVersion,
          },
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: userInputText,
                },
              ],
            },
          ],
          reasoning: {
            summary: 'auto',
          },
          store: true,
          include: ['reasoning.encrypted_content'],
        }
      : {
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
                  text: userInputText,
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
        };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
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
