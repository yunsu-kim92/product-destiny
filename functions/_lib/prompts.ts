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
