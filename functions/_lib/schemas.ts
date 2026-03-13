export type Pillar = {
  stem: string;
  branch: string;
};

export type FiveElements = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type FreeReading = {
  sajuReading: string;
  coreNature: string;
  lifeWorkFlow: string;
  relationshipPattern: string;
  guidance: string;
  fullReportLocked: true;
};

export type FullAnalysisData = {
  summary: string;
  personality: string;
  work: string;
  relationship: string;
  money: string;
  timing: string;
  guidance: string;
  fullReportLocked: false;
};

export type FreeAnalysisData = {
  input: {
    name: string;
    birthdate: string;
    birthtime: string;
    gender: string;
    language: string;
    calendarType: 'solar';
    timezone: string;
  };
  manse: {
    yearPillar: Pillar;
    monthPillar: Pillar;
    dayPillar: Pillar;
    hourPillar: Pillar;
  };
  dayMaster: string;
  fiveElements: FiveElements;
  signals: {
    coreTone: string;
    personalityHint: string;
    workHint: string;
    relationshipHint: string;
    balanceHint: string;
  };
  reading: FreeReading;
};

const pillarSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['stem', 'branch'],
  properties: {
    stem: { type: 'string', minLength: 1, maxLength: 40 },
    branch: { type: 'string', minLength: 1, maxLength: 40 },
  },
} as const;

export const freeReadingSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'sajuReading',
    'coreNature',
    'lifeWorkFlow',
    'relationshipPattern',
    'guidance',
    'fullReportLocked',
  ],
  properties: {
    sajuReading: { type: 'string', minLength: 1, maxLength: 1500 },
    coreNature: { type: 'string', minLength: 1, maxLength: 1000 },
    lifeWorkFlow: { type: 'string', minLength: 1, maxLength: 1000 },
    relationshipPattern: { type: 'string', minLength: 1, maxLength: 1000 },
    guidance: { type: 'string', minLength: 1, maxLength: 800 },
    fullReportLocked: { type: 'boolean', const: true },
  },
} as const;

export const freeAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['input', 'manse', 'dayMaster', 'fiveElements', 'signals', 'reading'],
  properties: {
    input: {
      type: 'object',
      additionalProperties: false,
      required: [
        'name',
        'birthdate',
        'birthtime',
        'gender',
        'language',
        'calendarType',
        'timezone',
      ],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 80 },
        birthdate: { type: 'string', minLength: 10, maxLength: 10 },
        birthtime: { type: 'string', minLength: 0, maxLength: 5 },
        gender: { type: 'string', minLength: 0, maxLength: 20 },
        language: { type: 'string', minLength: 2, maxLength: 5 },
        calendarType: { type: 'string', const: 'solar' },
        timezone: { type: 'string', minLength: 1, maxLength: 80 },
      },
    },
    manse: {
      type: 'object',
      additionalProperties: false,
      required: ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'],
      properties: {
        yearPillar: pillarSchema,
        monthPillar: pillarSchema,
        dayPillar: pillarSchema,
        hourPillar: pillarSchema,
      },
    },
    dayMaster: { type: 'string', minLength: 1, maxLength: 40 },
    fiveElements: {
      type: 'object',
      additionalProperties: false,
      required: ['wood', 'fire', 'earth', 'metal', 'water'],
      properties: {
        wood: { type: 'integer', minimum: 0, maximum: 20 },
        fire: { type: 'integer', minimum: 0, maximum: 20 },
        earth: { type: 'integer', minimum: 0, maximum: 20 },
        metal: { type: 'integer', minimum: 0, maximum: 20 },
        water: { type: 'integer', minimum: 0, maximum: 20 },
      },
    },
    signals: {
      type: 'object',
      additionalProperties: false,
      required: [
        'coreTone',
        'personalityHint',
        'workHint',
        'relationshipHint',
        'balanceHint',
      ],
      properties: {
        coreTone: { type: 'string', minLength: 1, maxLength: 160 },
        personalityHint: { type: 'string', minLength: 1, maxLength: 240 },
        workHint: { type: 'string', minLength: 1, maxLength: 240 },
        relationshipHint: { type: 'string', minLength: 1, maxLength: 240 },
        balanceHint: { type: 'string', minLength: 1, maxLength: 240 },
      },
    },
    reading: freeReadingSchema,
  },
} as const;

export const fullAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'personality',
    'work',
    'relationship',
    'money',
    'timing',
    'guidance',
    'fullReportLocked',
  ],
  properties: {
    summary: { type: 'string', minLength: 1, maxLength: 500 },
    personality: { type: 'string', minLength: 1, maxLength: 1200 },
    work: { type: 'string', minLength: 1, maxLength: 1200 },
    relationship: { type: 'string', minLength: 1, maxLength: 1200 },
    money: { type: 'string', minLength: 1, maxLength: 1200 },
    timing: { type: 'string', minLength: 1, maxLength: 1200 },
    guidance: { type: 'string', minLength: 1, maxLength: 1200 },
    fullReportLocked: { type: 'boolean', const: false },
  },
} as const;
