import { useGetCopyStats } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Zap, Target, Flame, TrendingUp, Clock, AlertTriangle } from "lucide-react";

export function StatsBar() {
  const { data: stats, isLoading } = useGetCopyStats();

  if (isLoading) {
    return <div className="h-20 border-b border-border bg-card/50 animate-pulse" />;
  }

  if (!stats) return null;

  return (
    <div className="border-b border-border bg-card/30">
      <div className="container max-w-[1400px] mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="col-span-2 flex flex-col justify-center border-r border-border/50 pr-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Volume Total</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-display font-bold text-foreground">{stats.total}</span>
              <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Hoje: {stats.todayCount}
              </span>
            </div>
          </div>
          
          <StatItem label="Venda" value={stats.byType?.venda || 0} icon={<Target className="w-4 h-4 text-primary" />} />
          <StatItem label="Follow Up" value={stats.byType?.followup || 0} icon={<Clock className="w-4 h-4 text-blue-400" />} />
          <StatItem label="Urgência" value={stats.byType?.urgencia || 0} icon={<Flame className="w-4 h-4 text-orange-500" />} />
          <StatItem label="Pós-Venda" value={stats.byType?.posVenda || 0} icon={<Zap className="w-4 h-4 text-yellow-400" />} />
          <StatItem label="Objeção" value={stats.byType?.objecao || 0} icon={<AlertTriangle className="w-4 h-4 text-red-500" />} />
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center px-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider font-mono">
        {icon} {label}
      </div>
      <div className="text-xl font-display font-semibold mt-1">
        {value}
      </div>
    </div>
  );
}
