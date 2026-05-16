import { AuthorsTable } from "@/components/dashboard/authors-table";
import { autores } from "@/lib/mock-data";
import { formatIntegerEsMx } from "@/lib/utils";

export default function AutoresPage() {
  const total = 15;
  const criticos = 3;
  const nuevos = 2;
  const reincidentes = 8;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">Autores e influencia</h1>
        <p className="text-xs text-zinc-500">
          Ranking por actividad, engagement y riesgo discursivo (mock).
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total monitoreados", value: total },
          { label: "Autores críticos", value: criticos },
          { label: "Nuevos esta semana", value: nuevos },
          { label: "Reincidentes", value: reincidentes },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {c.label}
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-zinc-100">
              {formatIntegerEsMx(c.value)}
            </p>
          </div>
        ))}
      </div>

      <AuthorsTable data={autores} />
    </div>
  );
}
