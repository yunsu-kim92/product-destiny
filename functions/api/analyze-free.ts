import { buildFreeSystemPrompt } from '../_lib/prompts';
import { errorResponse, jsonResponse, parseJsonBody } from '../_lib/json';
import { requestGeneratedImage, requestStructuredOutput } from '../_lib/openai';
import { freeAnalysisSchema, type FreeAnalysisData } from '../_lib/schemas';
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
    const data = await requestStructuredOutput<FreeAnalysisData>({
      env: context.env,
      schemaName: 'k_destiny_free_analysis',
      schema: freeAnalysisSchema,
      systemPrompt: buildFreeSystemPrompt(validation.data.language),
      payload: validation.data,
    });

    try {
      data.imageDataUrl = await requestGeneratedImage({
        env: context.env,
        analysis: data,
      });
    } catch {
      // Keep the analysis response usable even if image generation fails.
    }

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
