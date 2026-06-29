"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import characters from "@/app/data/characters.json";
import type { Character } from "@/types/character";

const BLUR_LEVELS = [40, 35, 30, 24, 18, 12, 7, 3, 0];

export default function CharacterImagePage() {
  const router = useRouter();
  const { state, setState } = useGame();
  const [query, setQuery] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [guessedIds, setGuessedIds] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [partialLoss, setPartialLoss] = useState(false);
  const [revealedCharacter, setRevealedCharacter] = useState<Character | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.isFinished && state.currentChallenge < 2) {
      router.replace("/game/characterAttributes");
      return;
    }
    if (state.gameId) fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gameId]);

  async function fetchChallenge() {
    const res = await fetch(`/api/game/challenge/2?gameId=${state.gameId}`);
    if (!res.ok) return;
    const data = await res.json();
    setImageUrl(data.imageUrl);
    if (data.done) {
      setWon(true);
      setShowModal(true);
    }
  }

  const blurPx = BLUR_LEVELS[Math.min(attempts, BLUR_LEVELS.length - 1)];

  const filtered = characters.filter(
    (c) =>
      !guessedIds.includes(c.id) &&
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  async function handleGuess(character: Character) {
    if (won || partialLoss || loading) return;
    setQuery("");
    setLoading(true);

    const res = await fetch("/api/game/challenge/2/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: state.gameId,
        characterId: character.id,
        previousGuesses: guessedIds,
        attemptsUsed: attempts,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;

    const newAttempts = data.attemptsUsed;
    setAttempts(newAttempts);
    setGuessedIds((prev) => [...prev, character.id]);

    setState((prev) => ({
      ...prev,
      attemptsChallenge2: newAttempts,
      guessedCharacters2: [...prev.guessedCharacters2, character.id],
    }));

    if (data.won) {
      setWon(true);
      setRevealedCharacter(data.character);
      setShowModal(true);
    } else if (data.eliminated) {
      setPartialLoss(true);
      setRevealedCharacter(data.character);
      setState((prev) => ({ ...prev, challenge2Penalty: data.penalty }));
      setShowModal(true);
    }

    inputRef.current?.focus();
  }

  function goToNextChallenge() {
    setState((prev) => ({ ...prev, currentChallenge: 3 }));
    router.push("/game/spells");
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Desafio 2</h1>
        <p className="text-center text-muted-foreground mb-2">
          Adivinhe o personagem pela imagem
        </p>
        <p className="text-center text-sm mb-6">
          Tentativas: <span className="font-bold">{attempts}/8</span>
        </p>

        {imageUrl && (
          <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden rounded-xl border">
            <Image
              src={imageUrl}
              alt="Personagem misterioso"
              fill
              className="object-cover"
              style={{ filter: `blur(${blurPx}px)`, transition: "filter 0.5s ease" }}
              unoptimized
            />
          </div>
        )}

        {!won && !partialLoss && (
          <div className="relative max-w-md mx-auto mb-4">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome do personagem..."
              disabled={loading}
              aria-label="Buscar personagem"
            />
            {query.length > 0 && (
              <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">Nenhum personagem encontrado</p>
                ) : (
                  filtered.slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleGuess(c as Character)}
                      className="w-full text-left px-4 py-2 hover:bg-accent text-sm transition-colors"
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {guessedIds.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Tentativas anteriores:</p>
            <div className="flex flex-wrap gap-2">
              {guessedIds.map((id) => {
                const c = characters.find((ch) => ch.id === id);
                return (
                  <span key={id} className="px-2 py-1 rounded-md bg-muted text-sm">
                    {c?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
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
              {won ? (
                <>
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold mb-2">Acertou!</h2>
                  {revealedCharacter && (
                    <p className="text-muted-foreground mb-4">Era: {revealedCharacter.name}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">😔</div>
                  <h2 className="text-2xl font-bold mb-2">Não acertou...</h2>
                  {revealedCharacter && (
                    <p className="text-muted-foreground mb-2">Era: {revealedCharacter.name}</p>
                  )}
                  <p className="text-sm text-orange-500 mb-4">+8 tentativas adicionadas ao total</p>
                </>
              )}
              <Button onClick={goToNextChallenge} className="w-full">
                Próximo Desafio →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
