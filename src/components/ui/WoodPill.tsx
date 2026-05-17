import { cn } from '@/lib/utils';

interface WoodPillProps {
  children:  React.ReactNode;
  active?:   boolean;
  onClick?:  () => void;
  className?: string;
}

export function WoodPill({ children, active, onClick, className }: WoodPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn('px-3 py-1 rounded-full text-xs font-semibold border transition-all', className)}
      style={{
        background:   active ? 'var(--accent)' : 'var(--bg-card)',
        color:        active ? 'var(--bg-deep)' : 'var(--text-muted)',
        borderColor:  active ? 'var(--accent)' : 'var(--border)',
      }}
    >
      {children}
    </button>
  );
}
