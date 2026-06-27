"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import characters from "@/app/data/characters.json";
import type { Character } from "@/types/character";

type AttributeResult = "correct" | "wrong" | { status: "partial"; hint: "higher" | "lower" };

interface GuessRow {
  character: Character;
  attributes: Record<string, AttributeResult>;
}

const ATTR_LABELS: Record<string, string> = {
  house: "Casa",
  gender: "Gênero",
  species: "Espécie",
  ancestry: "Ancestral",
  eyeColour: "Olhos",
  hairColour: "Cabelo",
  patronus: "Patrono",
  yearOfBirth: "Ano Nasc.",
};

const ATTRS = Object.keys(ATTR_LABELS);

function cellClass(result: AttributeResult) {
  if (result === "correct") return "bg-green-600 text-white";
  if (result === "wrong") return "bg-red-600 text-white";
  if (typeof result === "object") return "bg-yellow-500 text-white";
  return "";
}

function cellLabel(attr: string, result: AttributeResult, character: Character) {
  const raw = character[attr as keyof Character];
  const val = raw !== null && raw !== undefined && raw !== "" ? String(raw) : "—";
  if (typeof result === "object" && result.status === "partial") {
    return `${val} (${result.hint === "higher" ? "↑ mais novo" : "↓ mais velho"})`;
  }
  return val;
}

export default function CharacterAttributesPage() {
  const router = useRouter();
  const { state, setState, startGame } = useGame();
  const [query, setQuery] = useState("");
  const [guessRows, setGuessRows] = useState<GuessRow[]>([]);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [starting, setStarting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.gameId) initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.currentChallenge > 1) {
      router.replace("/game/characterImage");
    }
  }, [state.currentChallenge, router]);

  async function initGame() {
    setStarting(true);
    const res = await fetch("/api/game", { method: "POST" });
    if (!res.ok) { setStarting(false); return; }
    const data = await res.json();
    startGame({ gameId: data.gameId, characterId1: data.characterId1, characterId2: data.characterId2, spellId3: data.spellId3 });
    setStarting(false);
  }

  const filtered = characters.filter(
    (c) =>
      !state.guessedCharacters1.includes(c.id) &&
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  async function handleGuess(character: Character) {
    if (won || loading || state.currentChallenge !== 1) return;
    setQuery("");
    setLoading(true);

    const res = await fetch("/api/game/challenge/1/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: state.gameId,
        characterId: character.id,
        previousGuesses: state.guessedCharacters1,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return;

    const newRow: GuessRow = { character, attributes: data.attributes };
    setGuessRows((prev) => [newRow, ...prev]);

    setState((prev) => ({
      ...prev,
      attemptsChallenge1: prev.attemptsChallenge1 + 1,
      guessedCharacters1: [...prev.guessedCharacters1, character.id],
    }));

    if (data.won) {
      setWon(true);
      setShowModal(true);
    }

    inputRef.current?.focus();
  }

  function goToNextChallenge() {
    setState((prev) => ({ ...prev, currentChallenge: 2 }));
    router.push("/game/characterImage");
  }

  if (starting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Iniciando jogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Desafio 1</h1>
        <p className="text-center text-muted-foreground mb-6">Adivinhe o personagem pelos atributos</p>

        {!won && (
          <div className="relative max-w-md mx-auto mb-8">
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

        {guessRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground">Personagem</th>
                  {ATTRS.map((a) => (
                    <th key={a} className="p-2 text-center font-medium text-muted-foreground">
                      {ATTR_LABELS[a]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {guessRows.map((row, i) => (
                    <motion.tr
                      key={row.character.id + i}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="p-2 font-medium whitespace-nowrap">{row.character.name}</td>
                      {ATTRS.map((attr) => (
                        <td key={attr} className={`p-2 text-center rounded-sm ${cellClass(row.attributes[attr])}`}>
                          <span className="sr-only">{attr}: </span>
                          {cellLabel(attr, row.attributes[attr], row.character)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
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
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Acertou!</h2>
              <p className="text-muted-foreground mb-6">
                Você adivinhou o personagem em {state.attemptsChallenge1 + 1} tentativa(s).
              </p>
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
