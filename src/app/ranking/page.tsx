"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RankUser {
  id: string;
  username: string;
  house: string;
  points: number;
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

async function fetchRanking(): Promise<RankUser[]> {
  const res = await fetch("/api/user/ranking");
  if (!res.ok) throw new Error("Erro ao buscar ranking");
  return res.json();
}

export default function RankingPage() {
  const { data: session } = useSession();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["ranking"], queryFn: fetchRanking });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Ranking</h1>
          <Button variant="outline" render={<Link href="/dashboard" />}>
            ← Dashboard
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando ranking...</p>
        ) : (
          <div className="space-y-2">
            {users.map((user, index) => {
              const isMe = user.id === session?.user?.id;
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    isMe ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span className={`text-2xl font-bold w-8 text-center ${index < 3 ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{user.username}</span>
                      {isMe && <Badge variant="outline" className="text-xs">Você</Badge>}
                    </div>
                    <Badge className={`${houseColor(user.house)} text-white text-xs mt-1`}>
                      {user.house}
                    </Badge>
                  </div>
                  <span className="font-bold text-lg">{user.points} pts</span>
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nenhum jogador no ranking ainda</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
