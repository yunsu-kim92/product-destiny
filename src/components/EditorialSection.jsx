function EditorialSection({ t }) {
  const principles = [
    {
      title: t('editorial.card1Title'),
      description: t('editorial.card1Desc'),
    },
    {
      title: t('editorial.card2Title'),
      description: t('editorial.card2Desc'),
    },
    {
      title: t('editorial.card3Title'),
      description: t('editorial.card3Desc'),
    },
  ];

  const checklist = [
    t('editorial.point1'),
    t('editorial.point2'),
    t('editorial.point3'),
    t('editorial.point4'),
  ];

  return (
    <section className="section" id="guide">
      <div className="section-head">
        <span className="section-kicker">{t('editorial.kicker')}</span>
        <h2 className="section-title">{t('editorial.title')}</h2>
        <p className="section-subtitle">{t('editorial.desc')}</p>
      </div>

      <div className="policy-links editorial-grid">
        {principles.map((item) => (
          <article className="policy-link" key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </article>
        ))}
      </div>

      <div className="panel editorial-panel">
        <h3>{t('editorial.checkTitle')}</h3>
        <div className="editorial-checklist">
          {checklist.map((item) => (
            <div className="editorial-check" key={item}>
              <strong>{t('editorial.checkBadge')}</strong>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EditorialSection;
