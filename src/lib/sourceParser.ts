export interface ParsedBlock {
  text: string;
  lineType: "heading" | "code" | "body";
}

export function parseSourceText(raw: string): ParsedBlock[] {
  const lines = raw.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        if (codeBuffer.length > 0) {
          blocks.push({ text: codeBuffer.join(" "), lineType: "code" });
          codeBuffer = [];
        }
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      if (trimmed.length > 0) codeBuffer.push(trimmed);
      continue;
    }

    if (trimmed.length === 0) continue;

    const lineType = detectLineType(trimmed);
    blocks.push({ text: cleanLine(trimmed), lineType });
  }

  if (codeBuffer.length > 0) {
    blocks.push({ text: codeBuffer.join(" "), lineType: "code" });
  }

  return blocks.filter((b) => b.text.length > 0);
}

function detectLineType(line: string): "heading" | "code" | "body" {
  if (/^#{1,6}\s/.test(line)) return "heading";

  const isAllCapsWords = line.split(/\s+/).every(
    (w) => w === w.toUpperCase() && /[A-Z]/.test(w)
  );
  if (isAllCapsWords && line.split(/\s+/).length <= 10) return "heading";

  if (line.length < 60 && line.endsWith(":")) return "heading";

  const symbolDensity = (line.match(/[{}()[\]<>=;|&@$\/\\]/g) || []).length / line.length;
  if (symbolDensity > 0.15) return "code";

  return "body";
}

function cleanLine(line: string): string {
  let cleaned = line.replace(/^#{1,6}\s*/, "");
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  cleaned = cleaned.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1");
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}
