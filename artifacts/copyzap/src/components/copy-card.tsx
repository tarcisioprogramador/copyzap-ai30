import { Copy, useDeleteCopy, getListCopiesQueryKey, getGetCopyStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy as CopyIcon, Check, Trash2, Send, Clock, Tag } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function CopyCard({ copy, isLatest = false }: { copy: Copy; isLatest?: boolean }) {
  const [copied, setCopied] = useState(false);
  const deleteCopy = useDeleteCopy();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copy.generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado para a área de transferência",
        description: "Pronto para colar no WhatsApp."
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        variant: "destructive"
      });
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(copy.generatedText);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleDelete = () => {
    deleteCopy.mutate({ id: copy.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCopiesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCopyStatsQueryKey() });
        toast({
          title: "Registro apagado",
          description: "A operação foi removida do histórico."
        });
      }
    });
  };

  return (
    <Card className={`border-border bg-card overflow-hidden transition-all ${isLatest ? 'ring-1 ring-primary shadow-xl shadow-primary/10' : 'hover:border-primary/50'}`}>
      <CardHeader className="py-3 px-4 border-b border-border/50 bg-background/30 flex flex-row items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs uppercase bg-background">
            <Tag className="w-3 h-3 mr-1" /> {copy.messageType}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs uppercase bg-background text-muted-foreground border-border">
            {copy.tone}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono flex items-center ml-2">
            <Clock className="w-3 h-3 mr-1" />
            {format(new Date(copy.createdAt), "dd/MM HH:mm", { locale: ptBR })}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleteCopy.isPending}
          title="Deletar registro"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
          <div className="p-4 md:col-span-1 space-y-3 bg-card/30">
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Alvo</span>
              <span className="font-sans font-medium text-sm">{copy.clientName}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Ativo</span>
              <span className="font-sans font-medium text-sm">{copy.product}</span>
            </div>
            {copy.value && (
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Valor</span>
                <span className="font-mono text-sm text-primary">{copy.value}</span>
              </div>
            )}
          </div>
          
          <div className="p-4 md:col-span-3 bg-background/50 relative">
            <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
              {copy.generatedText}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t border-border/50 bg-background/30 flex flex-wrap gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={handleCopy}
          className="font-mono text-xs uppercase tracking-wider"
        >
          {copied ? <Check className="w-4 h-4 mr-2 text-primary" /> : <CopyIcon className="w-4 h-4 mr-2" />}
          {copied ? "Copiado" : "Copiar Texto"}
        </Button>
        <Button 
          onClick={handleWhatsApp}
          className="font-mono text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#25D366]/90 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar no WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
}
