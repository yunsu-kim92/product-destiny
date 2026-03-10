function isModifiedEvent(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function isInternalPath(href) {
  return href.startsWith('/');
}

function AppLink({ href, onNavigate, className, children, ...props }) {
  const handleClick = (event) => {
    if (!onNavigate || !isInternalPath(href) || isModifiedEvent(event) || props.target === '_blank') {
      return;
    }

    event.preventDefault();
    onNavigate(href);
  };

  return (
    <a {...props} className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}

export default AppLink;
