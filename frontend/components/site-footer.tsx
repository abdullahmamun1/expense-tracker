export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border px-6 py-8 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
      © {new Date().getFullYear()} ExpenseTracker — Balanced to the cent.
    </footer>
  );
}
