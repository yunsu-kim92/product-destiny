function SubscriptionSection({ t }) {
  const items = [
    t('subscription.item1'),
    t('subscription.item2'),
    t('subscription.item3'),
    t('subscription.item4'),
  ];

  return (
    <section className="section" id="subscription">
      <div className="section-head">
        <span className="section-kicker">{t('subscription.kicker')}</span>
        <h2 className="section-title">{t('subscription.title')}</h2>
        <p className="section-subtitle">{t('subscription.desc')}</p>
      </div>

      <div className="subscription-grid">
        <article className="panel subscription-panel">
          <strong className="subscription-highlight">{t('subscription.highlight')}</strong>
          <p>{t('subscription.note')}</p>
        </article>

        <article className="card subscription-card">
          <h3>{t('subscription.listTitle')}</h3>
          <ul className="feature-list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default SubscriptionSection;
