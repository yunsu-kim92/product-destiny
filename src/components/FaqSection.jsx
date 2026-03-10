function FaqSection({ t }) {
  const items = [
    ['faq.q1', 'faq.a1'],
    ['faq.q2', 'faq.a2'],
    ['faq.q3', 'faq.a3'],
    ['faq.q4', 'faq.a4'],
  ];

  return (
    <section className="section" id="faq">
      <div className="section-head">
        <span className="section-kicker">{t('faq.kicker')}</span>
        <h2 className="section-title">{t('faq.title')}</h2>
        <p className="section-subtitle">{t('faq.desc')}</p>
      </div>

      <div className="faq-list">
        {items.map(([questionKey, answerKey]) => (
          <article className="card faq-card" key={questionKey}>
            <h3>{t(questionKey)}</h3>
            <p>{t(answerKey)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FaqSection;
