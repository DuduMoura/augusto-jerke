"use client";

import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ModeToggle";
import { FunFacts } from "@/components/FunFacts";
import { AutoLogout } from "@/components/AutoLogout";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { ChallengeTabs } from "@/components/challenge/ChallengeTabs";
import { SelectUsers } from "@/components/challenge/SelectUsers";
import { HistoryList } from "@/components/HistoryList";

interface UserData {
  id: string;
  username: string;
  email: string;
  house: string;
  points: number;
}

async function fetchMe(): Promise<UserData> {
  const res = await fetch("/api/user/me");
  if (!res.ok) throw new Error("Erro ao buscar usuário");
  return res.json();
}

const houseConfig: Record<string, { label: string; color: string; emoji: string }> = {
  GRYFFINDOR: { label: "Grifinória", color: "bg-red-700", emoji: "🦁" },
  HUFFLEPUFF: { label: "Lufa-Lufa", color: "bg-yellow-500", emoji: "🦡" },
  RAVENCLAW: { label: "Corvinal", color: "bg-blue-700", emoji: "🦅" },
  SLYTHERIN: { label: "Sonserina", color: "bg-green-700", emoji: "🐍" },
};

export default function DashboardPage() {
  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const house = user ? houseConfig[user.house] : null;

  return (
    <div className="min-h-screen bg-background">
      <AutoLogout />

      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Potterdle</h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* User Profile */}
        {isLoading ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-muted-foreground">Carregando perfil...</p>
            </CardContent>
          </Card>
        ) : user ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{user.username}</CardTitle>
                  {house && (
                    <Badge className={`${house.color} text-white mt-1`}>
                      {house.emoji} {house.label}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{user.points}</p>
                  <p className="text-xs text-muted-foreground">pontos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <EditProfileDialog currentUsername={user.username} />
              <Button render={<Link href="/game/characterAttributes" />} nativeButton={false}>
                🎮 Jogar
              </Button>
              <Button variant="outline" render={<Link href="/ranking" />} nativeButton={false}>
                🏆 Ranking
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Fun Facts */}
        <FunFacts />

        {/* Challenge section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Desafios</CardTitle>
            </CardHeader>
            <CardContent>
              {user && <ChallengeTabs currentUserId={user.id} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desafiar Jogador</CardTitle>
            </CardHeader>
            <CardContent>
              <SelectUsers />
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pontos</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryList />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
