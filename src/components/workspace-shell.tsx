import type { ReactNode } from "react";

export function WorkspaceShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
