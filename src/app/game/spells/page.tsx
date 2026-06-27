"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";

interface SpellOption {
  id: string;
  name: string;
}

export default function SpellsPage() {
  const router = useRouter();
  const { state, setState, resetGame } = useGame();
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<SpellOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.currentChallenge < 3) {
      router.replace(state.currentChallenge === 1 ? "/game/characterAttributes" : "/game/characterImage");
      return;
    }
    if (state.gameId) fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gameId]);

  async function fetchChallenge() {
    const res = await fetch(`/api/game/challenge/3?gameId=${state.gameId}`);
    if (!res.ok) return;
    const data = await res.json();
    setDescription(data.description);
    setOptions(data.options);
  }

  async function handleGuess(spellId: string) {
    if (won || loading) return;
    setSelected(spellId);
    setLoading(true);

    const totalAttempts =
      state.attemptsChallenge1 +
      state.attemptsChallenge2 +
      state.challenge2Penalty +
      attempts +
      1;

    const res = await fetch("/api/game/challenge/3/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: state.gameId, spellId, totalAttempts }),
    });

    const data = await res.json();
    setLoading(false);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (data.won) {
      setWon(true);
      setState((prev) => ({
        ...prev,
        attemptsChallenge3: newAttempts,
        isFinished: true,
      }));
      setShowModal(true);
    } else {
      setSelected(null);
    }
  }

  function handleFinish() {
    resetGame();
    router.push("/dashboard");
  }

  const totalAttempts =
    state.attemptsChallenge1 +
    state.attemptsChallenge2 +
    state.challenge2Penalty +
    attempts;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Desafio 3</h1>
        <p className="text-center text-muted-foreground mb-8">Adivinhe o feitiço pela descrição</p>

        {description && (
          <div className="bg-card border rounded-xl p-6 mb-8 text-center">
            <p className="text-base leading-relaxed italic">&ldquo;{description}&rdquo;</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleGuess(option.id)}
              disabled={won || loading}
              className={`p-4 rounded-xl border-2 font-medium transition-all text-left ${
                selected === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {option.name}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Tentativas neste desafio: {attempts}
        </p>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-card rounded-xl p-8 max-w-sm mx-4 text-center shadow-2xl"
            >
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Sessão Completa!</h2>
              <p className="text-muted-foreground mb-2">Você completou todos os desafios!</p>
              <div className="bg-muted rounded-lg p-4 mb-6 text-sm space-y-1">
                <p>Desafio 1: <span className="font-bold">{state.attemptsChallenge1}</span> tentativas</p>
                <p>Desafio 2: <span className="font-bold">{state.attemptsChallenge2}</span> tentativas
                  {state.challenge2Penalty > 0 && (
                    <span className="text-orange-500"> (+{state.challenge2Penalty} penalidade)</span>
                  )}
                </p>
                <p>Desafio 3: <span className="font-bold">{attempts}</span> tentativas</p>
                <p className="font-bold border-t pt-1 mt-1">Total: {totalAttempts} tentativas</p>
              </div>
              <Button onClick={handleFinish} className="w-full">
                Ir para o Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
