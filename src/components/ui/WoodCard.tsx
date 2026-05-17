import { cn } from '@/lib/utils';

interface WoodCardProps {
  children:   React.ReactNode;
  className?: string;
  onClick?:   () => void;
  style?:     React.CSSProperties;
}

export function WoodCard({ children, className, onClick, style }: WoodCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn('rounded-xl border p-4', onClick && 'cursor-pointer', className)}
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', ...style }}
    >
      {children}
    </div>
  );
}
