interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
          {description && (
            <p className="text-xs text-text-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}