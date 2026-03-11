import type { FreeAnalysisData, FreeReading } from './schemas';
import type { AnalysisRequest } from './validators';

const languageGuide: Record<AnalysisRequest['language'], string> = {
  ko: 'Write the output in Korean.',
  en: 'Write the output in English.',
  ja: 'Write the output in Japanese.',
};

const languageNames: Record<AnalysisRequest['language'], string> = {
  ko: 'Korean',
  en: 'English',
  ja: 'Japanese',
};

const languagePurityRules: Record<AnalysisRequest['language'], string> = {
  ko: 'Use Korean only. Do not mix English, Japanese, or Chinese except for unavoidable pillar characters.',
  en: 'Use English only. Do not mix Korean, Japanese, Chinese, or untranslated terms.',
  ja: 'Use Japanese only. Do not mix Korean, English, or Chinese explanations unless a pillar character is unavoidable.',
};

const commonRules = `
You are writing a short premium preview for a Korean Saju / Myeongri analysis service.
Base the reading on the provided structured chart data.
Do not invent a new chart from the raw birth input.
Do not use MBTI-like labels, scores, percentages, or quiz language.
Do not write like generic self-help coaching.
Do not claim guaranteed fate or deterministic certainty.
Avoid medical, legal, or investment advice.
The tone should feel like a traditional Korean-style Saju preview prepared for a larger paid report.
Keep the reading concise, vivid, and structured.
`;

export function buildFullSystemPrompt(language: AnalysisRequest['language']) {
  return `${commonRules}
${languageGuide[language]}
Return only JSON that matches the schema.
Write a deeper paid-report style analysis based on structured Saju chart data.
Keep the tone interpretive, structured, and premium.
Set fullReportLocked to false.
`;
}

export function buildFreeUserPrompt(base: Omit<FreeAnalysisData, 'reading'>) {
  const language = base.input.language as AnalysisRequest['language'];
  const localizedIntro =
    language === 'ko'
      ? '아래 변수와 만세력 구조 데이터를 기준으로 무료 사주 해석 프리뷰를 생성하세요.'
      : language === 'ja'
        ? '以下の変数と万歳暦データを基準に、無料の四柱推命プレビューを生成してください。'
        : 'Generate the free Saju preview using the variables and structured manse data below.';

  return [
    localizedIntro,
    'language: ' + base.input.language,
    'outputLanguage: ' + languageNames[language],
    'outputRule: The response must be written entirely in ' + languageNames[language] + '.',
    'outputPurityRule: ' + languagePurityRules[language],
    'name: ' + base.input.name,
    'birthdate: ' + base.input.birthdate,
    'birthtime: ' + base.input.birthtime,
    'gender: ' + base.input.gender,
    'yearStem: ' + base.manse.yearPillar.stem,
    'yearBranch: ' + base.manse.yearPillar.branch,
    'monthStem: ' + base.manse.monthPillar.stem,
    'monthBranch: ' + base.manse.monthPillar.branch,
    'dayStem: ' + base.manse.dayPillar.stem,
    'dayBranch: ' + base.manse.dayPillar.branch,
    'hourStem: ' + base.manse.hourPillar.stem,
    'hourBranch: ' + base.manse.hourPillar.branch,
    'dayMaster: ' + base.dayMaster,
    'wood: ' + String(base.fiveElements.wood),
    'fire: ' + String(base.fiveElements.fire),
    'earth: ' + String(base.fiveElements.earth),
    'metal: ' + String(base.fiveElements.metal),
    'water: ' + String(base.fiveElements.water),
    '',
    'signals:',
    JSON.stringify(base.signals, null, 2),
    '',
    'manse:',
    JSON.stringify(base, null, 2),
  ].join('\n');
}

export function buildImagePrompt(analysis: FreeAnalysisData) {
  const reading: FreeReading = analysis.reading;

  return [
    'You are the image prompt generator for K-Destiny, a Korean Saju preview service.',
    '',
    'Task:',
    'Generate one premium illustration prompt based on the structured chart and short reading.',
    '',
    'Rules:',
    '- Output only one image prompt.',
    '- Do not output JSON.',
    '- Do not include text, logos, or UI in the image.',
    '- Avoid cartoon aesthetics and game-like tropes.',
    '- Focus on calm, elegant, traditional-meets-digital symbolism.',
    '',
    'Analysis input:',
    JSON.stringify(
      {
        dayMaster: analysis.dayMaster,
        manse: analysis.manse,
        fiveElements: analysis.fiveElements,
        reading,
      },
      null,
      2,
    ),
  ].join('\n');
}
