export type JsonSuccess<T> = {
  ok: true;
  source: 'openai';
  data: T;
};

export type JsonError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export function jsonResponse<T>(body: JsonSuccess<T> | JsonError, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

export function errorResponse(status: number, code: string, message: string) {
  return jsonResponse(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
