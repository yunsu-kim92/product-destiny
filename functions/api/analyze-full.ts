import { buildFreeAnalysisBase } from '../_lib/saju';
import { buildFreeUserPrompt, buildFullSystemPrompt } from '../_lib/prompts';
import { errorResponse, jsonResponse, parseJsonBody } from '../_lib/json';
import { requestStructuredOutput } from '../_lib/openai';
import { fullAnalysisSchema, type FullAnalysisData } from '../_lib/schemas';
import { validateAnalysisInput, type Env } from '../_lib/validators';

type Context = {
  request: Request;
  env: Env;
};

export async function onRequestPost(context: Context) {
  const body = await parseJsonBody(context.request);
  const validation = validateAnalysisInput(body);

  if (!validation.ok) {
    return errorResponse(400, 'INVALID_INPUT', validation.message);
  }

  if (!context.env.OPENAI_API_KEY) {
    return errorResponse(500, 'MISSING_API_KEY', 'OPENAI_API_KEY is not configured.');
  }

  try {
    const base = buildFreeAnalysisBase(validation.data);
    const data = await requestStructuredOutput<FullAnalysisData>({
      env: context.env,
      schemaName: 'k_destiny_full_analysis',
      schema: fullAnalysisSchema,
      systemPrompt: buildFullSystemPrompt(validation.data.language),
      inputText: buildFreeUserPrompt(base),
    });

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

    if (message === 'OPENAI_INVALID_RESPONSE') {
      return errorResponse(
        502,
        'OPENAI_INVALID_RESPONSE',
        'The AI response did not match the expected schema.',
      );
    }

    if (message === 'OPENAI_REQUEST_FAILED') {
      return errorResponse(502, 'OPENAI_REQUEST_FAILED', 'The OpenAI request failed.');
    }

    return errorResponse(502, 'OPENAI_REQUEST_FAILED', message);
  }
}
