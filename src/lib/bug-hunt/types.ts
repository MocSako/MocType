export type BugHuntDifficulty = "easy" | "medium" | "hard";

export type BugType =
  | "syntax"
  | "logic"
  | "off-by-one"
  | "typo"
  | "missing-token"
  | "wrong-operator";

export interface BugHuntChallenge {
  id: string;
  title: string;
  language: string;
  difficulty: BugHuntDifficulty;
  bugType: BugType;
  brokenCode: string;
  correctedCode: string;
  explanation: string;
}
