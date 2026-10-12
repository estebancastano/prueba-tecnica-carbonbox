export function LoadingSpinner({
  label = "Cargando..."
}: {
  label?: string;
}) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500"
      role="status"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-forest-600 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
