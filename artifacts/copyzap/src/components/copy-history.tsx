import { Copy, useListCopies } from "@workspace/api-client-react";
import { CopyCard } from "./copy-card";
import { Terminal } from "lucide-react";

export function CopyHistory({ latestCopyId }: { latestCopyId?: number }) {
  const { data: copies, isLoading } = useListCopies();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded bg-card/50 border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!copies || copies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded bg-card/20">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Terminal className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">Nenhum registro operacional encontrado.</p>
        <p className="text-xs text-muted-foreground mt-2 font-mono">Suas armas de vendas aparecerão aqui.</p>
      </div>
    );
  }

  // Filter out the latest copy if it's already displayed at the top
  const displayCopies = copies.filter(c => c.id !== latestCopyId);

  return (
    <div className="space-y-4">
      {displayCopies.map(copy => (
        <CopyCard key={copy.id} copy={copy} />
      ))}
      
      {displayCopies.length === 0 && latestCopyId && (
        <p className="text-xs text-muted-foreground font-mono text-center pt-8">
          Apenas a operação atual está em andamento.
        </p>
      )}
    </div>
  );
}
