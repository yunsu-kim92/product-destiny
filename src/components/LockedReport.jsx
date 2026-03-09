function LockedReport({ t, preview, onUnlock, lockedRef, isLocked = true }) {
  return (
    <div className="locked-panel" id="lockedResult" ref={lockedRef}>
      <div className="lock-pill">{t('locked.badge')}</div>
      <h3>{t('locked.title')}</h3>
      <p>{t('locked.desc')}</p>

      <div className={`locked-preview${isLocked ? ' is-locked' : ''}`}>
        <div className="locked-row">
          <div className="locked-card">
            <strong>{t('locked.card1Title')}</strong>
            <p>{t('locked.card1Desc')}</p>
          </div>
          <div className="locked-card">
            <strong>{t('locked.card2Title')}</strong>
            <p>{t('locked.card2Desc')}</p>
          </div>
          <div className="locked-card">
            <strong>{t('locked.card3Title')}</strong>
            <p>{t('locked.card3Desc')}</p>
          </div>
        </div>

        <div className="locked-card">
          <strong>{t('locked.previewTitle')}</strong>
          <p>{preview || t('locked.previewText')}</p>
        </div>

        {isLocked ? (
          <div className="locked-overlay">
            <strong>{t('locked.overlayTitle')}</strong>
            <span>{t('locked.overlayDesc')}</span>
          </div>
        ) : null}
      </div>

      <div className="locked-actions">
        <button className="btn btn-primary" type="button" onClick={onUnlock}>
          {t('locked.cta')}
        </button>
        <span className="field-note">{t('locked.note')}</span>
      </div>
    </div>
  );
}

export default LockedReport;
