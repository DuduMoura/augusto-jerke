"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  house: string;
  points: number;
}

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Erro ao buscar usuários");
  return res.json();
}

const houseColor = (house: string) => {
  const map: Record<string, string> = {
    GRYFFINDOR: "bg-red-700",
    HUFFLEPUFF: "bg-yellow-500",
    RAVENCLAW: "bg-blue-700",
    SLYTHERIN: "bg-green-700",
  };
  return map[house] ?? "bg-muted";
};

export function SelectUsers() {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const challengeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenged_user_id: userId }),
      });
      if (!res.ok) throw new Error("Erro ao enviar desafio");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Desafio enviado!");
    },
    onError: () => toast.error("Erro ao enviar desafio"),
  });

  const filtered = users.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar jogador para desafiar..."
        className="mb-3"
      />
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <Badge className={`${houseColor(u.house)} text-white text-xs`}>{u.house}</Badge>
              <span className="font-medium text-sm">{u.username}</span>
              <span className="text-xs text-muted-foreground">{u.points} pts</span>
            </div>
            <Button
              size="sm"
              onClick={() => challengeMutation.mutate(u.id)}
              disabled={challengeMutation.isPending}
            >
              Desafiar
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">Nenhum jogador encontrado</p>
        )}
      </div>
    </div>
  );
}
