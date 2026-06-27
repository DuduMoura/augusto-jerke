"use client";

import { useMemo } from "react";
import { funFacts } from "@/app/data/harryPotterFunFacts";

export function FunFacts() {
  const fact = useMemo(
    () => funFacts[Math.floor(Math.random() * funFacts.length)],
    []
  );

  return (
    <div className="bg-muted rounded-xl p-4 text-sm italic text-muted-foreground">
      <p className="font-semibold text-foreground not-italic mb-1">💡 Você sabia?</p>
      <p>{fact}</p>
    </div>
  );
}
