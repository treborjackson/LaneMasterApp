interface PageHeaderProps {
  title:     string;
  subtitle?: string;
  emoji?:    string;
}

export function PageHeader({ title, subtitle, emoji }: PageHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2">
      <h2
        className="text-xl font-bold"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
      >
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
