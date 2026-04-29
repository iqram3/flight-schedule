import { Activity, Plane, RadioTower, Rows3, ShieldCheck } from "lucide-react";

interface SummaryStripProps {
  active: number;
  filtered: number;
  inactive: number;
  total: number;
  wideBody: number;
}

export function SummaryStrip({ active, filtered, inactive, total, wideBody }: SummaryStripProps) {
  const stats = [
    { label: "Total flights", value: total, icon: Plane, tone: "from-cyan-600 to-teal-700" },
    { label: "Visible now", value: filtered, icon: Rows3, tone: "from-indigo-600 to-violet-700" },
    { label: "Active", value: active, icon: Activity, tone: "from-emerald-600 to-teal-700" },
    { label: "Inactive", value: inactive, icon: RadioTower, tone: "from-amber-500 via-orange-600 to-rose-700" },
    { label: "Wide body", value: wideBody, icon: ShieldCheck, tone: "from-slate-700 to-slate-900" },
  ];

  return (
    <section className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5 md:px-6" aria-label="Summary">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className={`overflow-hidden rounded-lg border border-white/70 bg-white shadow-lift ring-1 ring-slate-200/60 ${
              stat.label === "Inactive" ? "bg-gradient-to-br from-white via-amber-50 to-rose-50" : ""
            }`}
          >
            <div className={`h-1.5 bg-gradient-to-r ${stat.tone}`} />
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-600">{stat.label}</span>
                <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-800">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-ink">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
