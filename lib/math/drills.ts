export const ROUND_SIZE = 10;

export type DrillKind = "nines" | "tables" | "fast" | "addition" | "subtraction";

export type Question = {
  prompt: string;
  answer: number;
};

export function parseDrill(value: string | undefined): DrillKind {
  if (value === "nines" || value === "tables" || value === "fast" || value === "addition" || value === "subtraction") {
    return value;
  }
  return "nines";
}

export function parseTable(value: string | undefined, kind: DrillKind = "tables"): number | "mix" {
  const n = Number(value);
  if (!Number.isInteger(n)) return "mix";
  if (kind === "fast" && n === 11) return 11;
  if ((kind === "tables" || kind === "fast") && n >= 2 && n <= 9) return n;
  return "mix";
}

export function makeRound(kind: DrillKind, table: number | "mix" = "mix"): Question[] {
  if (kind === "nines") {
    return shuffle(Array.from({ length: ROUND_SIZE }, (_, i) => fact(9, i + 1)));
  }
  if (kind === "tables") {
    if (table !== "mix") {
      return shuffle(Array.from({ length: ROUND_SIZE }, (_, i) => fact(table, i + 1)));
    }
    const pool: Question[] = [];
    for (let left = 2; left <= 9; left++) {
      for (let right = 1; right <= 10; right++) pool.push(fact(left, right));
    }
    return shuffle(pool).slice(0, ROUND_SIZE);
  }
  if (kind === "fast") return uniqueQuestions(ROUND_SIZE, () => fastQuestion(table));
  if (kind === "addition") return uniqueQuestions(ROUND_SIZE, additionQuestion);
  return uniqueQuestions(ROUND_SIZE, subtractionQuestion);
}

export function readAnswer(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  return Number(text);
}

function fact(left: number, right: number): Question {
  return { prompt: `${left} × ${right}`, answer: left * right };
}

function fastQuestion(factor: number | "mix"): Question {
  const left = 10 + Math.floor(Math.random() * 90);
  const right = factor === "mix" ? 2 + Math.floor(Math.random() * 8) : factor;
  return { prompt: `${left} × ${right}`, answer: left * right };
}

function additionQuestion(): Question {
  const left = Math.floor(Math.random() * 21);
  const right = Math.floor(Math.random() * 21);
  return { prompt: `${left} + ${right}`, answer: left + right };
}

function subtractionQuestion(): Question {
  const left = Math.floor(Math.random() * 21);
  const right = Math.floor(Math.random() * (left + 1));
  return { prompt: `${left} − ${right}`, answer: left - right };
}

function uniqueQuestions(count: number, make: () => Question): Question[] {
  const seen = new Set<string>();
  const questions: Question[] = [];
  let guard = 0;
  while (questions.length < count && guard < 1000) {
    guard += 1;
    const question = make();
    if (seen.has(question.prompt)) continue;
    seen.add(question.prompt);
    questions.push(question);
  }
  return questions;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    next[i] = next[j];
    next[j] = current;
  }
  return next;
}
