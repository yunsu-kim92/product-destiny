const presets = {
  ko: {
    typeName: '전략가형',
    summary: '당신은 흐름을 빠르게 읽고 핵심을 파악하는 성향이 강합니다.',
    metrics: [
      { label: '커리어 감각', value: '92%' },
      { label: '재물 흐름', value: '78%' },
      { label: '관계 통찰', value: '81%' },
    ],
    preview:
      '당신은 단기 감정보다 장기 구조를 중시하는 타입입니다. 중요한 선택에서 흔들림이 적고, 흐름이 바뀌는 시점에 먼저 반응하는 경향이 있습니다.',
    fullReportLocked: true,
  },
  en: {
    typeName: 'The Strategist',
    summary: 'You quickly read momentum and identify the core of a situation.',
    metrics: [
      { label: 'Career Sense', value: '92%' },
      { label: 'Wealth Flow', value: '78%' },
      { label: 'Relationship Insight', value: '81%' },
    ],
    preview:
      'You favor long-term structure over short-term emotion. You stay steady in major choices and often react early when momentum shifts.',
    fullReportLocked: true,
  },
  ja: {
    typeName: '戦略家タイプ',
    summary: 'あなたは流れを素早く読み、状況の核心をつかむ傾向が強いです。',
    metrics: [
      { label: 'キャリア感覚', value: '92%' },
      { label: '金運の流れ', value: '78%' },
      { label: '対人洞察', value: '81%' },
    ],
    preview:
      'あなたは短期的な感情より長期構造を重視します。重要な選択でもぶれにくく、流れの変化を早く察知する傾向があります。',
    fullReportLocked: true,
  },
  zh: {
    typeName: '战略家型',
    summary: '你擅长快速判断趋势并抓住局势核心。',
    metrics: [
      { label: '职业敏感度', value: '92%' },
      { label: '财富流动', value: '78%' },
      { label: '关系洞察', value: '81%' },
    ],
    preview:
      '你比起短期情绪更看重长期结构。在重大选择中较少动摇，也更早对趋势变化做出反应。',
    fullReportLocked: true,
  },
  es: {
    typeName: 'Tipo Estratega',
    summary: 'Lees el impulso con rapidez y detectas lo esencial con claridad.',
    metrics: [
      { label: 'Instinto profesional', value: '92%' },
      { label: 'Flujo financiero', value: '78%' },
      { label: 'Intuición relacional', value: '81%' },
    ],
    preview:
      'Priorizas la estructura a largo plazo sobre la emoción inmediata. Mantienes estabilidad en decisiones clave y reaccionas pronto cuando cambia la tendencia.',
    fullReportLocked: true,
  },
};

export function mockAnalyze(payload) {
  const locale = presets[payload.language] || presets.ko;
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#101828"/>
          <stop offset="50%" stop-color="#8f67ff"/>
          <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bg)"/>
      <circle cx="512" cy="360" r="220" fill="rgba(255,255,255,0.10)"/>
      <circle cx="512" cy="360" r="126" fill="rgba(241,182,92,0.26)"/>
      <path d="M512 182 L558 322 L706 322 L586 408 L630 552 L512 468 L394 552 L438 408 L318 322 L466 322 Z" fill="rgba(255,255,255,0.82)"/>
    </svg>
  `);

  return Promise.resolve({
    typeName: locale.typeName,
    summary: locale.summary,
    metrics: locale.metrics,
    preview: locale.preview,
    fullReportLocked: locale.fullReportLocked,
    imageDataUrl: `data:image/svg+xml;charset=utf-8,${svg}`,
  });
}
