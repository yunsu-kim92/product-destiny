function AdSlot({ label, description, className = '' }) {
  return (
    <div className={`ad-slot ${className}`.trim()}>
      <div>
        <div className="ad-pill">{label}</div>
        <div>{description}</div>
      </div>
    </div>
  );
}

export default AdSlot;
