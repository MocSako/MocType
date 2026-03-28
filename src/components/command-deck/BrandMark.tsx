interface BrandMarkProps {
  onClick?: () => void;
}

export function BrandMark({ onClick }: BrandMarkProps) {
  return (
    <button onClick={onClick} className="type-atelier-brand" type="button">
      <span className="type-atelier-brand-mark">M</span>
      <span className="type-atelier-brand-text">MOCTYPE</span>
    </button>
  );
}
