"use client";

import { useQuery } from "@tanstack/react-query";

interface HistoryEntry {
  id: string;
  description: string;
  points: number;
  created_at: string;
}

async function fetchHistory(): Promise<HistoryEntry[]> {
  const res = await fetch("/api/history");
  if (!res.ok) throw new Error("Erro ao buscar histórico");
  return res.json();
}

export function HistoryList() {
  const { data: history = [], isLoading } = useQuery({ queryKey: ["history"], queryFn: fetchHistory });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando histórico...</p>;

  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Nenhuma movimentação de pontos ainda</p>;
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between py-2 border-b text-sm">
          <span className="text-muted-foreground flex-1 pr-4">{entry.description}</span>
          <span className={`font-bold whitespace-nowrap ${entry.points >= 0 ? "text-green-600" : "text-red-600"}`}>
            {entry.points >= 0 ? "+" : ""}{entry.points}
          </span>
        </div>
      ))}
    </div>
  );
}
