export function ChartEmpty({ message = "Sin datos en la base de datos." }: { message?: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 text-center text-xs text-zinc-500">
      {message}
    </div>
  );
}
