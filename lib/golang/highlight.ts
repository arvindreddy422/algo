import { createHighlighter, type Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const LANGS = ["go", "bash", "yaml", "sql", "plaintext"] as const;

let pending: Promise<Highlighter> | null = null;

function getHighlighter() {
  pending ??= createHighlighter({
    themes: ["catppuccin-latte", "catppuccin-mocha"],
    langs: [...LANGS],
    engine: createJavaScriptRegexEngine(),
  });
  return pending;
}

const aliases: Record<string, (typeof LANGS)[number]> = {
  sh: "bash",
  shell: "bash",
  console: "bash",
  zsh: "bash",
  yml: "yaml",
  text: "plaintext",
  txt: "plaintext",
  golang: "go",
};

export async function highlightCode(code: string, lang: string) {
  const highlighter = await getHighlighter();
  const mapped = aliases[lang] ?? lang;
  const loaded = highlighter.getLoadedLanguages();
  const use = loaded.includes(mapped) ? mapped : "plaintext";
  return highlighter.codeToHtml(code, {
    lang: use,
    themes: {
      light: "catppuccin-latte",
      dark: "catppuccin-mocha",
    },
    defaultColor: false,
  });
}
