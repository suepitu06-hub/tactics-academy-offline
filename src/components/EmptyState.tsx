interface Props {
  emoji: string;
  title: string;
  hint?: string;
}
export function EmptyState({ emoji, title, hint }: Props) {
  return (
    <div className="fade-in flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-3" aria-hidden>{emoji}</div>
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
