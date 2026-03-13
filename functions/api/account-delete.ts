import { createClient } from '@supabase/supabase-js';
import { errorResponse, jsonResponse } from '../_lib/json';
import type { Env } from '../_lib/validators';

type Context = {
  request: Request;
  env: Env;
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return '';
  }

  return authorization.slice('Bearer '.length).trim();
}

export async function onRequestPost(context: Context) {
  const token = getBearerToken(context.request);

  if (!token) {
    return errorResponse(401, 'MISSING_TOKEN', 'Authorization token is required.');
  }

  if (!context.env.SUPABASE_URL || !context.env.SUPABASE_SERVICE_ROLE_KEY) {
    return errorResponse(
      500,
      'MISSING_SUPABASE_CONFIG',
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.',
    );
  }

  const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return errorResponse(401, 'INVALID_TOKEN', 'The current session is not valid.');
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return errorResponse(502, 'DELETE_FAILED', deleteError.message);
  }

  return jsonResponse({
    ok: true,
    deletedUserId: user.id,
  });
}
