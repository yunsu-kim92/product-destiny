function HeroSection({ t, onPrimaryCta, onSecondaryCta }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow">{t('hero.eyebrow')}</div>
        <h1>
          <span>{t('hero.title1')}</span>{' '}
          <span className="gradient-text">{t('hero.title2')}</span>{' '}
          <span>{t('hero.title3')}</span>
        </h1>
        <p className="hero-desc">{t('hero.desc')}</p>

        <div className="cta-row">
          <button className="btn btn-primary" type="button" onClick={onPrimaryCta}>
            {t('hero.cta1')}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onSecondaryCta}>
            {t('hero.cta2')}
          </button>
        </div>

        <div className="proof-row">
          <span>{t('hero.proof1')}</span>
          <span>{t('hero.proof2')}</span>
          <span>{t('hero.proof3')}</span>
        </div>
      </div>

      <div className="hero-panel">
        <div className="orb orb-a"></div>
        <div className="orb orb-b"></div>
        <div className="sample-label">{t('sample.label')}</div>

        <div className="sample-card">
          <span className="sample-pill">{t('sample.pill')}</span>
          <h2 className="sample-title">{t('sample.title')}</h2>
          <p className="sample-desc">{t('sample.desc')}</p>

          <div className="sample-stats">
            <div className="sample-stat">
              <strong>{t('sample.stat1v')}</strong>
              <span>{t('sample.stat1l')}</span>
            </div>
            <div className="sample-stat">
              <strong>{t('sample.stat2v')}</strong>
              <span>{t('sample.stat2l')}</span>
            </div>
            <div className="sample-stat">
              <strong>{t('sample.stat3v')}</strong>
              <span>{t('sample.stat3l')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
