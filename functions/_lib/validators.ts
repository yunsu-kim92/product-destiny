export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export type Env = {
  OPENAI_API_KEY?: string;
  OPENAI_PROMPT_ID?: string;
  OPENAI_PROMPT_VERSION?: string;
};

export type AnalysisRequest = {
  name: string;
  birthdate: string;
  birthtime?: string;
  gender?: string;
  language: SupportedLanguage;
};

type ValidationResult =
  | {
      ok: true;
      data: AnalysisRequest;
    }
  | {
      ok: false;
      message: string;
    };

function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function validateAnalysisInput(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return {
      ok: false,
      message: 'Request body must be a JSON object.',
    };
  }

  const payload = input as Record<string, unknown>;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const birthdate = typeof payload.birthdate === 'string' ? payload.birthdate.trim() : '';
  const birthtime = typeof payload.birthtime === 'string' ? payload.birthtime.trim() : '';
  const gender = typeof payload.gender === 'string' ? payload.gender.trim() : '';
  const language = payload.language;

  if (!name) {
    return {
      ok: false,
      message: 'The "name" field is required.',
    };
  }

  if (!birthdate) {
    return {
      ok: false,
      message: 'The "birthdate" field is required.',
    };
  }

  if (!isSupportedLanguage(language)) {
    return {
      ok: false,
      message: 'The "language" field must be one of: ko, en.',
    };
  }

  return {
    ok: true,
    data: {
      name,
      birthdate,
      birthtime: birthtime || '',
      gender: gender || '',
      language,
    },
  };
}
