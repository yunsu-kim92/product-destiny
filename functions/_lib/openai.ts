import { buildImagePrompt } from './prompts';
import type { FreeAnalysisData } from './schemas';
import type { Env } from './validators';

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

type OpenAIImageResponseShape = {
  data?: Array<{
    b64_json?: string;
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

function summarizeOutput(payload: OpenAIResponseShape) {
  const outputText = extractOutputText(payload);

  if (outputText.trim()) {
    return outputText.slice(0, 1200);
  }

  return JSON.stringify(payload.output || []).slice(0, 1200);
}

export async function requestStructuredOutput<T>(options: {
  env: Env;
  schemaName: string;
  schema: JsonSchema;
  systemPrompt?: string;
  inputText: string;
  promptId?: string;
  promptVersion?: string;
  maxOutputTokens?: number;
}) {
  const apiKey = options.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const textFormat = {
    format: {
      type: 'json_schema',
      name: options.schemaName,
      strict: true,
      schema: options.schema,
    },
  };

  const requestBody = options.promptId
    ? {
        prompt: options.promptVersion
          ? {
              id: options.promptId,
              version: options.promptVersion,
            }
          : {
              id: options.promptId,
            },
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: options.inputText,
              },
            ],
          },
        ],
        max_output_tokens: options.maxOutputTokens ?? 2048,
        text: textFormat,
      }
    : {
        model: OPENAI_MODEL,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: options.systemPrompt || '',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: options.inputText,
              },
            ],
          },
        ],
        max_output_tokens: options.maxOutputTokens ?? 2048,
        text: textFormat,
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
    console.error('OpenAI structured output missing text:', summarizeOutput(json));
    throw new Error(`OPENAI_INVALID_RESPONSE:${summarizeOutput(json)}`);
  }

  try {
    return JSON.parse(outputText) as T;
  } catch {
    console.error('OpenAI structured output was not valid JSON:', outputText.slice(0, 1200));
    throw new Error(`OPENAI_INVALID_RESPONSE:${outputText.slice(0, 1200)}`);
  }
}

export async function requestGeneratedImage(options: {
  env: Env;
  analysis: FreeAnalysisData;
}) {
  const apiKey = options.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1.5',
      prompt: buildImagePrompt(options.analysis),
      n: 1,
      size: '1024x1024',
      quality: 'auto',
    }),
  });

  const json = (await response.json()) as OpenAIImageResponseShape;

  if (!response.ok) {
    throw new Error(json.error?.message || 'OPENAI_IMAGE_REQUEST_FAILED');
  }

  const b64 = json.data?.[0]?.b64_json;

  if (!b64) {
    throw new Error('OPENAI_IMAGE_INVALID_RESPONSE');
  }

  return `data:image/png;base64,${b64}`;
}
