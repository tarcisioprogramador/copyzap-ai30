import { useState } from "react";
import { StatsBar } from "@/components/stats-bar";
import { GeneratorForm } from "@/components/generator-form";
import { CopyHistory } from "@/components/copy-history";
import { CopyCard } from "@/components/copy-card";
import { Copy } from "@workspace/api-client-react";

export default function Home() {
  const [latestCopy, setLatestCopy] = useState<Copy | null>(null);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans dark selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl leading-none">
              Z
            </div>
            <span className="font-display font-bold text-xl tracking-tight">CopyZap AI</span>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block uppercase tracking-wider">
            Painel Operacional
          </div>
        </div>
      </header>

      <StatsBar />

      <main className="flex-1 container max-w-[1400px] mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg tracking-tight uppercase">Gerador</h2>
            <div className="h-px flex-1 bg-border ml-4" />
          </div>
          <GeneratorForm onGenerated={setLatestCopy} />
        </div>
        
        <div className="xl:col-span-8 space-y-8">
          {latestCopy && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg tracking-tight uppercase text-primary">Resultado Atual</h2>
                <div className="h-px flex-1 bg-primary/20 ml-4" />
              </div>
              <CopyCard copy={latestCopy} isLatest />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg tracking-tight uppercase">Histórico Operacional</h2>
              <div className="h-px flex-1 bg-border ml-4" />
            </div>
            <CopyHistory latestCopyId={latestCopy?.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
