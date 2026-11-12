export type LldLanguage = "python" | "java";

export type LangCode = {
  python: string;
  java: string;
};

export type VersionLabel = "Basic" | "Improved" | "Best";

export type CodeVersion = {
  label: VersionLabel;
  intent: string;
  drawbacks: string[];
  nextImprovement?: string;
  code: LangCode;
};

export type LldLesson = {
  slug: string;
  title: string;
  tagline: string;
  explanation: string;
  whenToUse?: string;
  whenNot?: string;
  versions: CodeVersion[];
};

export type OopsPillar = {
  name: string;
  summary: string;
};

export type OopsProblem = LldLesson & {
  problem: string;
  pillars: string[];
};

export type SolidPrinciple = LldLesson & {
  letter: string;
  name: string;
};

export type PatternCategory = "creational" | "structural" | "behavioral";

export type DesignPattern = LldLesson & {
  category: PatternCategory;
};

export type PatternSummary = Pick<DesignPattern, "slug" | "title" | "tagline" | "category">;
