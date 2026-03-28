import type { BugHuntChallenge } from "./types";

export const challenges: BugHuntChallenge[] = [
  {
    id: "e-missing-paren",
    title: "Missing parenthesis",
    language: "javascript",
    difficulty: "easy",
    bugType: "syntax",
    brokenCode: `function greet(name {
  return "Hello, " + name;
}`,
    correctedCode: `function greet(name) {
  return "Hello, " + name;
}`,
    explanation: "The closing parenthesis after the parameter list was missing.",
  },
  {
    id: "e-missing-bracket",
    title: "Unclosed array",
    language: "javascript",
    difficulty: "easy",
    bugType: "missing-token",
    brokenCode: `const colors = ["red", "green", "blue";`,
    correctedCode: `const colors = ["red", "green", "blue"];`,
    explanation: "The closing bracket ] was missing before the semicolon.",
  },
  {
    id: "e-semicolon",
    title: "Missing semicolon",
    language: "typescript",
    difficulty: "easy",
    bugType: "syntax",
    brokenCode: `const x: number = 42
const y: number = x + 1;`,
    correctedCode: `const x: number = 42;
const y: number = x + 1;`,
    explanation: "The first statement was missing its trailing semicolon.",
  },
  {
    id: "e-string-close",
    title: "Unclosed string",
    language: "javascript",
    difficulty: "easy",
    bugType: "syntax",
    brokenCode: `console.log("hello world);`,
    correctedCode: `console.log("hello world");`,
    explanation: 'The closing double-quote on the string literal was missing.',
  },
  {
    id: "e-arrow-fn",
    title: "Arrow syntax",
    language: "javascript",
    difficulty: "easy",
    bugType: "syntax",
    brokenCode: `const add = (a, b) = a + b;`,
    correctedCode: `const add = (a, b) => a + b;`,
    explanation: "Used = instead of => for the arrow function.",
  },

  {
    id: "m-equality",
    title: "Loose equality",
    language: "typescript",
    difficulty: "medium",
    bugType: "wrong-operator",
    brokenCode: `function isZero(n: number): boolean {
  return n == "0";
}`,
    correctedCode: `function isZero(n: number): boolean {
  return n === 0;
}`,
    explanation: "Used loose equality with a string instead of strict equality with a number.",
  },
  {
    id: "m-off-by-one",
    title: "Off-by-one loop",
    language: "typescript",
    difficulty: "medium",
    bugType: "off-by-one",
    brokenCode: `function last<T>(arr: T[]): T {
  return arr[arr.length];
}`,
    correctedCode: `function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}`,
    explanation: "Array indices are zero-based; arr[arr.length] is always undefined.",
  },
  {
    id: "m-return-void",
    title: "Missing return",
    language: "typescript",
    difficulty: "medium",
    bugType: "logic",
    brokenCode: `function double(n: number): number {
  n * 2;
}`,
    correctedCode: `function double(n: number): number {
  return n * 2;
}`,
    explanation: "The function body computed n * 2 but never returned it.",
  },
  {
    id: "m-async-await",
    title: "Missing await",
    language: "typescript",
    difficulty: "medium",
    bugType: "logic",
    brokenCode: `async function fetchName(): Promise<string> {
  const res = fetch("/api/name");
  return res.json();
}`,
    correctedCode: `async function fetchName(): Promise<string> {
  const res = await fetch("/api/name");
  return res.json();
}`,
    explanation: "fetch() returns a Promise; without await, res is a Promise, not a Response.",
  },
  {
    id: "m-ternary",
    title: "Inverted ternary",
    language: "javascript",
    difficulty: "medium",
    bugType: "logic",
    brokenCode: `const label = count === 1 ? "items" : "item";`,
    correctedCode: `const label = count === 1 ? "item" : "items";`,
    explanation: "The singular and plural branches were swapped.",
  },

  {
    id: "h-closure",
    title: "Closure trap",
    language: "javascript",
    difficulty: "hard",
    bugType: "logic",
    brokenCode: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
    correctedCode: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
    explanation: "var is function-scoped; all closures share the same i. Use let for block scope.",
  },
  {
    id: "h-spread-shallow",
    title: "Shallow clone",
    language: "typescript",
    difficulty: "hard",
    bugType: "logic",
    brokenCode: `const copy = { ...original };
copy.meta.version = 2;`,
    correctedCode: `const copy = { ...original, meta: { ...original.meta } };
copy.meta.version = 2;`,
    explanation: "Spread only shallow-copies; nested objects still share references.",
  },
  {
    id: "h-promise-all",
    title: "Unhandled rejection",
    language: "typescript",
    difficulty: "hard",
    bugType: "logic",
    brokenCode: `const results = Promise.all([fetchA(), fetchB()]);
console.log(results);`,
    correctedCode: `const results = await Promise.all([fetchA(), fetchB()]);
console.log(results);`,
    explanation: "Promise.all returns a Promise; without await the log prints the pending Promise.",
  },
  {
    id: "h-regex",
    title: "Greedy regex",
    language: "javascript",
    difficulty: "hard",
    bugType: "logic",
    brokenCode: `const inner = str.match(/<(.*)>/)[1];`,
    correctedCode: `const inner = str.match(/<(.*?)>/)[1];`,
    explanation: "The greedy .* matches across multiple > characters. Use .*? for non-greedy.",
  },
];
