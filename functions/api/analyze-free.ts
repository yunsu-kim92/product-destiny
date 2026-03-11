import { buildFreeUserPrompt } from '../_lib/prompts';
import { errorResponse, jsonResponse, parseJsonBody } from '../_lib/json';
import { requestStructuredOutput } from '../_lib/openai';
import { buildFreeAnalysisBase } from '../_lib/saju';
import {
  freeReadingSchema,
  type FreeAnalysisData,
  type FreeReading,
} from '../_lib/schemas';
import { validateAnalysisInput, type Env } from '../_lib/validators';

type Context = {
  request: Request;
  env: Env;
};

function normalizeWhitespace(text: string) {
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function stripMarkdown(text: string) {
  return normalizeWhitespace(
    text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[*-]\s+/gm, '')
  );
}

function stripUnexpectedScripts(text: string, language: string) {
  if (language !== 'en') {
    return text;
  }

  return normalizeWhitespace(
    text
      .replace(/흐름/g, 'flow')
      .replace(/[一-鿿぀-ヿ가-힯]+/g, '')
      .replace(/_+/g, ' ')
      .replace(/\s+([,.:;!?])/g, '$1'),
  );
}

function normalizeReading(reading: FreeReading, language: string): FreeReading {
  return {
    sajuReading: stripUnexpectedScripts(stripMarkdown(reading.sajuReading), language),
    coreNature: stripUnexpectedScripts(stripMarkdown(reading.coreNature), language),
    lifeWorkFlow: stripUnexpectedScripts(stripMarkdown(reading.lifeWorkFlow), language),
    relationshipPattern: stripUnexpectedScripts(
      stripMarkdown(reading.relationshipPattern),
      language,
    ),
    guidance: stripUnexpectedScripts(stripMarkdown(reading.guidance), language),
    fullReportLocked: true,
  };
}

export async function onRequestPost(context: Context) {
  const body = await parseJsonBody(context.request);
  const validation = validateAnalysisInput(body);

  if (!validation.ok) {
    return errorResponse(400, 'INVALID_INPUT', validation.message);
  }

  if (!context.env.OPENAI_API_KEY) {
    return errorResponse(500, 'MISSING_API_KEY', 'OPENAI_API_KEY is not configured.');
  }

  const promptId = context.env.OPENAI_FREE_PROMPT_ID || context.env.OPENAI_PROMPT_ID;

  if (!promptId) {
    return errorResponse(
      500,
      'MISSING_PROMPT_ID',
      'OPENAI_FREE_PROMPT_ID is not configured for free analysis.',
    );
  }

  try {
    const base = buildFreeAnalysisBase(validation.data);
    const reading = await requestStructuredOutput<FreeReading>({
      env: context.env,
      schemaName: 'k_destiny_free_reading',
      schema: freeReadingSchema,
      inputText: buildFreeUserPrompt(base),
      promptId,
      promptVersion: context.env.OPENAI_FREE_PROMPT_VERSION || context.env.OPENAI_PROMPT_VERSION,
      maxOutputTokens: 3600,
    });

    const data: FreeAnalysisData = {
      ...base,
      reading: normalizeReading(reading, validation.data.language),
    };

    return jsonResponse({
      ok: true,
      source: 'openai',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'INTERNAL_ERROR';

    if (message === 'MISSING_API_KEY') {
      return errorResponse(500, 'MISSING_API_KEY', 'OPENAI_API_KEY is not configured.');
    }

    if (message === 'MISSING_PROMPT_ID') {
      return errorResponse(500, 'MISSING_PROMPT_ID', 'OPENAI_FREE_PROMPT_ID is not configured.');
    }

    if (message.startsWith('OPENAI_INVALID_RESPONSE')) {
      return errorResponse(
        502,
        'OPENAI_INVALID_RESPONSE',
        'The AI preview response did not match the expected schema.',
      );
    }

    if (message === 'OPENAI_REQUEST_FAILED') {
      return errorResponse(502, 'OPENAI_REQUEST_FAILED', 'The OpenAI request failed.');
    }

    return errorResponse(502, 'OPENAI_REQUEST_FAILED', message);
  }
}
