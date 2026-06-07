import { Icon } from "./icon";

export function EmptyState({ icon = "Inbox", title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon name={icon} className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-4 font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
    </div>
  );
}
