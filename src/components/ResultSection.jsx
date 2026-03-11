import LockedReport from './LockedReport.jsx';
import ManseCard from './ManseCard.jsx';

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
  const readingBlocks = result
    ? [
        { label: t('reading.sajuReading'), value: result.reading.sajuReading },
        { label: t('reading.coreNature'), value: result.reading.coreNature },
        { label: t('reading.lifeWorkFlow'), value: result.reading.lifeWorkFlow },
        { label: t('reading.relationshipPattern'), value: result.reading.relationshipPattern },
        { label: t('reading.guidance'), value: result.reading.guidance },
      ]
    : [];

  return (
    <section className="section" id="results" ref={sectionRef}>
      <div className="section-head">
        <span className="section-kicker">{t('results.kicker')}</span>
        <h2 className="section-title">{t('results.title')}</h2>
        <p className="section-subtitle">{t('results.desc')}</p>
      </div>

      <div className="report-info-grid">
        <article className="card">
          <h3>{t('results.includesTitle')}</h3>
          <ul className="feature-list">
            <li>{t('results.include1')}</li>
            <li>{t('results.include2')}</li>
            <li>{t('results.include3')}</li>
            <li>{t('results.include4')}</li>
            <li>{t('results.include5')}</li>
          </ul>
        </article>
      </div>

      <div className="result-shell">
        {result ? (
          <div className="result-panel" aria-live="polite">
            <div className="result-badge-row">
              <span className="result-pill">{t('results.freeBadge')}</span>
              <span>{t('resultMeta', { name: submittedName })}</span>
            </div>

            <ManseCard t={t} result={result} />

            <div className="report-grid report-grid-wide">
              {readingBlocks.map((block) => (
                <div className="report-card" key={block.label}>
                  <span className="report-label">{block.label}</span>
                  <p className="report-value">{block.value}</p>
                </div>
              ))}
            </div>

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
          preview={result?.reading?.guidance}
          onUnlock={onUnlock}
          lockedRef={lockedRef}
          isLocked={result?.reading?.fullReportLocked !== false}
        />
      </div>
    </section>
  );
}

export default ResultSection;
