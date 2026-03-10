import type { FreeAnalysisData } from './schemas';
import type { AnalysisRequest } from './validators';

const languageGuide: Record<AnalysisRequest['language'], string> = {
  ko: 'Write the output in Korean.',
  en: 'Write the output in English.',
};

const commonRules = `
You are generating a Korean-inspired AI destiny and personality report.
Blend symbolic Korean-inspired motifs with modern personality insight.
Do not present the result as guaranteed fate, prophecy, or deterministic truth.
Avoid medical, legal, mental health, or investment advice.
Use careful language around pattern, tendency, rhythm, energy, and reflection.
Do not mention JSON, schemas, or formatting instructions in the output content.
Use a polished, premium, globally accessible tone.
Metrics must be exactly 3 items.
Each metric value must be a percentage string like "92%".
Use the provided input as inspiration, not as a claim of scientific certainty.
`;

export function buildFreeSystemPrompt(language: AnalysisRequest['language']) {
  return `${commonRules}
${languageGuide[language]}
Create a concise free teaser result.
Keep the summary compact and punchy.
Keep the preview short and premium, hinting at a deeper full report.
Set fullReportLocked to true.
`;
}

export function buildFullSystemPrompt(language: AnalysisRequest['language']) {
  return `${commonRules}
${languageGuide[language]}
Create a deeper structured premium-style report.
The summary should still be concise.
The preview should remain teaser-length.
Each fullReport field should be 2 to 5 sentences and feel practical, reflective, and premium.
Set fullReportLocked to false.
`;
}

export function buildUserPrompt(payload: AnalysisRequest) {
  return [
    `Name: ${payload.name}`,
    `Birthdate: ${payload.birthdate}`,
    `Birthtime: ${payload.birthtime || ''}`,
    `Gender: ${payload.gender || ''}`,
    `Language: ${payload.language}`,
  ].join('\n');
}

export function buildImagePrompt(analysis: FreeAnalysisData) {
  return [
    'You are the image prompt generator for K-Destiny, a Korean-style personality and destiny reading service.',
    '',
    'Your job:',
    'Convert the destiny analysis result into a high-quality image generation prompt.',
    '',
    'Task:',
    'Generate a visual illustration prompt that represents the destiny archetype.',
    '',
    'Rules:',
    '- Do NOT output JSON.',
    '- Output only a single image generation prompt.',
    '- Do NOT include text to be drawn inside the image.',
    '- Do NOT include logos, typography, UI, or watermarks.',
    '- Focus on symbolic and emotional visual storytelling.',
    '',
    'Interpretation:',
    'Use the following fields to shape the visual concept:',
    'typeName -> defines the main archetype theme',
    'summary -> defines the emotional tone',
    'preview -> provides symbolic hints for strengths, patterns, and caution',
    '',
    'Style requirements:',
    'The image must follow a consistent premium style suitable for a mobile destiny reading app.',
    '',
    'Style:',
    'modern Korean mystical aesthetic, premium editorial illustration, elegant composition, soft cinematic lighting, subtle spiritual symbolism, refined digital painting, minimal background, emotionally warm atmosphere',
    '',
    'Visual direction:',
    '- one clear central symbolic scene',
    '- calm and elegant composition',
    '- subtle mystical atmosphere',
    '- symbolic elements representing personality traits',
    '- harmonious color palette',
    '- premium mobile-app illustration style',
    '',
    'Avoid:',
    '- cartoon style',
    '- exaggerated fantasy armor',
    '- horror elements',
    '- cluttered scenes',
    '- tarot card cliches',
    '',
    'Analysis input:',
    JSON.stringify(
      {
        typeName: analysis.typeName,
        summary: analysis.summary,
        metrics: analysis.metrics,
        preview: analysis.preview,
        fullReportLocked: analysis.fullReportLocked,
      },
      null,
      2,
    ),
  ].join('\n');
}
