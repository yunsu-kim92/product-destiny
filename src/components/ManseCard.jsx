function ManseCard({ t, result }) {
  const pillars = [
    { label: t('manse.year'), value: result.manse.yearPillar },
    { label: t('manse.month'), value: result.manse.monthPillar },
    { label: t('manse.day'), value: result.manse.dayPillar },
    { label: t('manse.hour'), value: result.manse.hourPillar },
  ];

  const elements = [
    ['wood', result.fiveElements.wood],
    ['fire', result.fiveElements.fire],
    ['earth', result.fiveElements.earth],
    ['metal', result.fiveElements.metal],
    ['water', result.fiveElements.water],
  ];

  return (
    <div className="manse-card">
      <div className="result-badge-row">
        <span className="result-pill">{t('manse.badge')}</span>
        <span>{t('manse.dayMaster', { value: result.dayMaster })}</span>
      </div>

      <div className="manse-grid">
        {pillars.map((pillar) => (
          <div className="manse-cell" key={pillar.label}>
            <span>{pillar.label}</span>
            <strong>{pillar.value.stem}</strong>
            <strong>{pillar.value.branch}</strong>
          </div>
        ))}
      </div>

      <div className="elements-card elements-card-result">
        <div className="elements-head">
          <span>{t('elements.title')}</span>
        </div>
        <div className="elements-list">
          {elements.map(([key, value]) => (
            <div className="elements-row" key={key}>
              <strong>{t(`elements.${key}`)}</strong>
              <span>{'●'.repeat(Math.max(1, Number(value)))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManseCard;
