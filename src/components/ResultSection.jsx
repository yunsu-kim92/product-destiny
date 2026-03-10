import LockedReport from './LockedReport.jsx';

function ResultSection({
  t,
  result,
  submittedName,
  sectionRef,
  lockedRef,
  onRetry,
  onUnlock,
  onScrollToLocked,
}) {
  const metrics = Array.isArray(result?.metrics) ? result.metrics.slice(0, 3) : [];

  return (
    <section className="section" id="results" ref={sectionRef}>
      <div className="section-head">
        <span className="section-kicker">{t('results.kicker')}</span>
        <h2 className="section-title">{t('results.title')}</h2>
        <p className="section-subtitle">{t('results.desc')}</p>
      </div>

      <div className="result-shell">
        {result ? (
          <div className="result-panel" aria-live="polite">
            <div className="result-badge-row">
              <span className="result-pill">{t('results.freeBadge')}</span>
              <span>{t('resultMeta', { name: submittedName })}</span>
            </div>

            <h3 className="result-type">{result.typeName}</h3>
            <p className="result-summary">{result.summary}</p>

            <div className="metrics-grid">
              {metrics.map((metric) => (
                <div className="metric-card" key={`${metric.label}-${metric.value}`}>
                  <span className="metric-label">{metric.label}</span>
                  <strong className="metric-value">{metric.value}</strong>
                </div>
              ))}
            </div>

            <p className="result-preview">{result.preview}</p>

            <div className="result-actions result-actions-top">
              <button className="btn btn-primary" type="button" onClick={onScrollToLocked}>
                {t('results.unlockCta')}
              </button>
              <button className="btn btn-secondary" type="button" onClick={onRetry}>
                {t('results.retry')}
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <h3>{t('results.emptyTitle')}</h3>
            <p>{t('results.emptyDesc')}</p>
          </div>
        )}

        <LockedReport
          t={t}
          preview={result?.preview}
          onUnlock={onUnlock}
          lockedRef={lockedRef}
          isLocked={result?.fullReportLocked !== false}
        />
      </div>
    </section>
  );
}

export default ResultSection;
