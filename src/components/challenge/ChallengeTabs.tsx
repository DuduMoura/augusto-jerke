"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ChallengeUser {
  id: string;
  username: string;
  house: string;
  points: number;
}

interface ChallengeItem {
  id: string;
  challenger_user_id: string;
  challenged_user_id: string;
  is_finished: boolean;
  winner_user_id: string | null;
  challenger_user?: ChallengeUser;
  challenged_user?: ChallengeUser;
}

interface ChallengesData {
  received: ChallengeItem[];
  sent: ChallengeItem[];
  completed: ChallengeItem[];
}

async function fetchChallenges(): Promise<ChallengesData> {
  const res = await fetch("/api/challenge");
  if (!res.ok) throw new Error("Erro ao buscar desafios");
  return res.json();
}

export function ChallengeTabs({ currentUserId }: { currentUserId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["challenges"], queryFn: fetchChallenges });

  const declineMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const res = await fetch("/api/challenge/decline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      if (!res.ok) throw new Error("Erro ao recusar desafio");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Desafio recusado");
    },
    onError: () => toast.error("Erro ao recusar desafio"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando desafios...</p>;

  const houseColor = (house: string) => {
    const map: Record<string, string> = {
      GRYFFINDOR: "bg-red-700",
      HUFFLEPUFF: "bg-yellow-500",
      RAVENCLAW: "bg-blue-700",
      SLYTHERIN: "bg-green-700",
    };
    return map[house] ?? "bg-muted";
  };

  return (
    <Tabs defaultValue="received">
      <TabsList className="w-full">
        <TabsTrigger value="received" className="flex-1">
          Recebidos {data?.received.length ? `(${data.received.length})` : ""}
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex-1">
          Enviados {data?.sent.length ? `(${data.sent.length})` : ""}
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex-1">
          Concluídos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="received">
        {data?.received.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nenhum desafio recebido</p>
        ) : (
          data?.received.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-2">
                <Badge className={`${houseColor(c.challenger_user?.house ?? "")} text-white`}>
                  {c.challenger_user?.house}
                </Badge>
                <span className="font-medium">{c.challenger_user?.username}</span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => declineMutation.mutate(c.id)}
                disabled={declineMutation.isPending}
              >
                Recusar
              </Button>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="sent">
        {data?.sent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nenhum desafio enviado</p>
        ) : (
          data?.sent.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-2">
                <Badge className={`${houseColor(c.challenged_user?.house ?? "")} text-white`}>
                  {c.challenged_user?.house}
                </Badge>
                <span className="font-medium">{c.challenged_user?.username}</span>
              </div>
              <Badge variant="outline">Aguardando</Badge>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="completed">
        {data?.completed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nenhum desafio concluído</p>
        ) : (
          data?.completed.map((c) => {
            const iWon = c.winner_user_id === currentUserId;
            return (
              <div key={c.id} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    vs {c.challenger_user_id === currentUserId ? c.challenged_user?.username : c.challenger_user?.username}
                  </span>
                </div>
                <Badge className={iWon ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                  {iWon ? "Vitória" : "Derrota"}
                </Badge>
              </div>
            );
          })
        )}
      </TabsContent>
    </Tabs>
  );
}
