import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGenerateCopy, getListCopiesQueryKey, getGetCopyStatsQueryKey, Copy } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, TerminalSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  product: z.string().min(1, "Produto ou serviço é obrigatório"),
  value: z.string().optional(),
  context: z.string().optional(),
  messageType: z.enum(["venda", "followup", "urgencia", "posVenda", "objecao"]),
  tone: z.enum(["profissional", "amigavel", "direto", "emocional"])
});

type FormValues = z.infer<typeof formSchema>;

export function GeneratorForm({ onGenerated }: { onGenerated: (copy: Copy) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const generateCopy = useGenerateCopy();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      product: "",
      value: "",
      context: "",
      messageType: "venda",
      tone: "direto"
    }
  });

  function onSubmit(data: FormValues) {
    generateCopy.mutate({ data }, {
      onSuccess: (result) => {
        onGenerated(result);
        queryClient.invalidateQueries({ queryKey: getListCopiesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCopyStatsQueryKey() });
        toast({
          title: "Copy gerada com sucesso",
          description: "Sua nova arma de vendas está pronta.",
        });
        // Optional: clear form
        // form.reset();
      },
      onError: (err: unknown) => {
        let description = "Ocorreu um erro. Tente novamente.";
        if (err && typeof err === "object") {
          const e = err as { response?: { data?: { error?: string } }; message?: string };
          const apiMsg = e?.response?.data?.error;
          if (apiMsg?.toLowerCase().includes("credit") || apiMsg?.toLowerCase().includes("balance")) {
            description = "Saldo insuficiente na Anthropic. Adicione créditos em console.anthropic.com/settings/billing e tente novamente.";
          } else if (apiMsg) {
            description = apiMsg;
          }
        }
        toast({
          title: "Erro ao gerar copy",
          description,
          variant: "destructive",
          duration: 8000,
        });
      }
    });
  }

  return (
    <Card className="border-border bg-card shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Alvo (Cliente)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente..." className="bg-background/50 focus-visible:ring-primary font-mono text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Ativo (Produto/Serviço)</FormLabel>
                    <FormControl>
                      <Input placeholder="O que estamos vendendo?" className="bg-background/50 focus-visible:ring-primary font-mono text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Valor (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" className="bg-background/50 focus-visible:ring-primary font-mono text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="messageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Tipo de Operação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 focus:ring-primary font-mono text-sm">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="venda">Venda Direta</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="urgencia">Urgência / Escassez</SelectItem>
                        <SelectItem value="posVenda">Pós-venda</SelectItem>
                        <SelectItem value="objecao">Quebra de Objeção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Tom de Voz</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 focus:ring-primary font-mono text-sm">
                          <SelectValue placeholder="Selecione o tom" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="direto">Direto e Reto</SelectItem>
                        <SelectItem value="profissional">Profissional</SelectItem>
                        <SelectItem value="amigavel">Amigável / Próximo</SelectItem>
                        <SelectItem value="emocional">Emocional / Inspirador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Briefing (Contexto Adicional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Ele achou caro ontem, precisa fechar hoje por causa do bônus..." 
                      className="resize-none bg-background/50 min-h-[100px] focus-visible:ring-primary font-mono text-sm" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-display uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 group mt-4"
              disabled={generateCopy.isPending}
            >
              {generateCopy.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando Arma de Vendas...
                </>
              ) : (
                <>
                  <TerminalSquare className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Executar Operação
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
