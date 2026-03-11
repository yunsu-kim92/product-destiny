function ElementsBalanceChart({ t, variant = 'hero' }) {
  const items = [
    { label: t('elements.wood'), value: 3 },
    { label: t('elements.fire'), value: 2 },
    { label: t('elements.earth'), value: 3 },
    { label: t('elements.metal'), value: 1 },
    { label: t('elements.water'), value: 2 },
  ];

  return (
    <div className={`elements-card elements-card-${variant}`}>
      <div className="elements-head">
        <span>{t('elements.title')}</span>
      </div>
      <div className="elements-list">
        {items.map((item) => (
          <div className="elements-row" key={item.label}>
            <strong>{item.label}</strong>
            <span aria-label={`${item.label} ${item.value}`}>{'●'.repeat(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ElementsBalanceChart;
