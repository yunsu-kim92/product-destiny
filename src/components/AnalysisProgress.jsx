function AnalysisProgress({ t, progress, stage }) {
  const stages = [
    t('loading.stage1'),
    t('loading.stage2'),
    t('loading.stage3'),
    t('loading.stage4'),
    t('loading.stage5'),
  ];

  const activeStage = stages[Math.min(stage, stages.length - 1)];

  return (
    <div className="analysis-progress" role="status" aria-live="polite" aria-busy="true">
      <div className="analysis-progress-head">
        <strong>{t('loading.title')}</strong>
        <span>{progress}%</span>
      </div>
      <div
        className="analysis-progress-track"
        aria-hidden="true"
      >
        <span className="analysis-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="analysis-progress-stage">{activeStage}</div>
    </div>
  );
}

export default AnalysisProgress;
