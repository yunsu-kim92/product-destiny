function ScrollTopButton({ t, visible }) {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`scroll-top-button${visible ? ' is-visible' : ''}`}
      type="button"
      onClick={handleClick}
      aria-label={t('common.backToTop')}
    >
      <span>TOP</span>
    </button>
  );
}

export default ScrollTopButton;
