function QuickAnswersSection({ t }) {
  const items = [
    ['geo.q1', 'geo.a1'],
    ['geo.q2', 'geo.a2'],
    ['geo.q3', 'geo.a3'],
    ['geo.q4', 'geo.a4'],
  ];

  return (
    <section className="section" id="quick-answers">
      <div className="section-head">
        <span className="section-kicker">{t('geo.kicker')}</span>
        <h2 className="section-title">{t('geo.title')}</h2>
        <p className="section-subtitle">{t('geo.desc')}</p>
      </div>

      <div className="faq-list">
        {items.map(([questionKey, answerKey]) => (
          <article className="card faq-card" key={questionKey}>
            <h3>{t(questionKey)}</h3>
            <p>{t(answerKey)}</p>
          </article>
        ))}
      </div>

      <div className="panel freshness-panel">
        <strong>{t('geo.freshnessTitle')}</strong>
        <p>{t('geo.freshnessDesc')}</p>
      </div>
    </section>
  );
}

export default QuickAnswersSection;
