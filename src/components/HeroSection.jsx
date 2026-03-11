import ElementsBalanceChart from './ElementsBalanceChart.jsx';

function HeroSection({ t, onPrimaryCta, onSecondaryCta }) {
  const sampleItems = [
    { label: t('sample.item1Label'), value: t('sample.item1Value') },
    { label: t('sample.item2Label'), value: t('sample.item2Value') },
    { label: t('sample.item4Label'), value: t('sample.item4Value') },
    { label: t('sample.item5Label'), value: t('sample.item5Value') },
  ];

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

          <div className="sample-report-list">
            {sampleItems.map((item) => (
              <div className="sample-report-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <ElementsBalanceChart t={t} variant="hero" />

          <div className="sample-highlight">
            <span>{t('sample.footerLabel')}</span>
            <p>{t('sample.footerValue')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
