export type Metric = {
  label: string;
  value: string;
};

export type FreeAnalysisData = {
  typeName: string;
  summary: string;
  metrics: [Metric, Metric, Metric];
  preview: string;
  fullReportLocked: true;
};

export type FullReport = {
  personality: string;
  career: string;
  money: string;
  relationship: string;
  timing: string;
  advice: string;
};

export type FullAnalysisData = {
  typeName: string;
  summary: string;
  metrics: [Metric, Metric, Metric];
  preview: string;
  fullReportLocked: false;
  fullReport: FullReport;
};

const metricSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['label', 'value'],
  properties: {
    label: {
      type: 'string',
      minLength: 1,
      maxLength: 40,
    },
    value: {
      type: 'string',
      pattern: '^[0-9]{1,3}%$',
    },
  },
} as const;

export const freeAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['typeName', 'summary', 'metrics', 'preview', 'fullReportLocked'],
  properties: {
    typeName: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    summary: {
      type: 'string',
      minLength: 1,
      maxLength: 320,
    },
    metrics: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: metricSchema,
    },
    preview: {
      type: 'string',
      minLength: 1,
      maxLength: 500,
    },
    fullReportLocked: {
      type: 'boolean',
      const: true,
    },
  },
} as const;

export const fullAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'typeName',
    'summary',
    'metrics',
    'preview',
    'fullReportLocked',
    'fullReport',
  ],
  properties: {
    typeName: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    summary: {
      type: 'string',
      minLength: 1,
      maxLength: 320,
    },
    metrics: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: metricSchema,
    },
    preview: {
      type: 'string',
      minLength: 1,
      maxLength: 500,
    },
    fullReportLocked: {
      type: 'boolean',
      const: false,
    },
    fullReport: {
      type: 'object',
      additionalProperties: false,
      required: ['personality', 'career', 'money', 'relationship', 'timing', 'advice'],
      properties: {
        personality: { type: 'string', minLength: 1, maxLength: 1200 },
        career: { type: 'string', minLength: 1, maxLength: 1200 },
        money: { type: 'string', minLength: 1, maxLength: 1200 },
        relationship: { type: 'string', minLength: 1, maxLength: 1200 },
        timing: { type: 'string', minLength: 1, maxLength: 1200 },
        advice: { type: 'string', minLength: 1, maxLength: 1200 },
      },
    },
  },
} as const;
