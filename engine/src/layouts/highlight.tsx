// Tiny dependency-free syntax highlighter (keywords / strings / numbers / comments).
import type { CodeLayout } from "./types";

export const CODE_COLORS = {
  keyword: "#ff7b72",
  string: "#a5d6ff",
  number: "#79c0ff",
  comment: "#8b949e",
  func: "#d2a8ff",
  plain: "#e6edf3",
  variable: "#ffa657",
  type: "#7ee787",
  punct: "#c9d1d9",
};

const KEYWORDS: Record<string, string[]> = {
  sql: ["select", "from", "where", "create", "index", "on", "insert", "into", "values", "update", "set", "delete", "join", "left", "inner", "order", "by", "group", "limit", "and", "or", "not", "null", "as", "explain", "analyze", "unique", "table", "primary", "key", "drop", "alter", "add"],
  js: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "await", "async", "import", "from", "export", "new", "class", "true", "false", "null", "undefined", "try", "catch", "throw"],
  ts: ["const", "let", "function", "return", "if", "else", "for", "await", "async", "import", "from", "export", "new", "class", "interface", "type", "true", "false", "null", "undefined"],
  python: ["def", "return", "if", "elif", "else", "for", "while", "in", "import", "from", "as", "class", "with", "True", "False", "None", "and", "or", "not", "await", "async"],
  bash: ["sudo", "npm", "git", "cd", "ls", "echo", "export", "docker", "psql"],
  json: ["true", "false", "null"],
  php: ["class", "extends", "implements", "interface", "abstract", "public", "private", "protected", "function", "echo", "return", "new", "if", "else", "foreach", "as", "null", "true", "false", "static", "self", "parent", "use", "namespace"],
  text: [],
};

type Tok = { text: string; color: string };

export const tokenize = (line: string, language: CodeLayout["language"] = "text"): Tok[] => {
  const kw = new Set((KEYWORDS[language] ?? []).map((k) => k.toLowerCase()));
  const re = /(--.*$|\/\/.*$|#.*$)|('[^']*'?|"[^"]*"?|`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|(\$[A-Za-z_][A-Za-z0-9_]*)|([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;
  const out: Tok[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const [t, comment, str, num, variable, fn, word, ws] = m;
    if (comment && (language === "sql" ? t.startsWith("--") : language === "php" ? t.startsWith("//") || t.startsWith("#") : language === "python" || language === "bash" ? t.startsWith("#") : t.startsWith("//")))
      out.push({ text: t, color: CODE_COLORS.comment });
    else if (comment) out.push({ text: t, color: CODE_COLORS.plain });
    else if (str) out.push({ text: t, color: CODE_COLORS.string });
    else if (num) out.push({ text: t, color: CODE_COLORS.number });
    else if (variable) out.push({ text: t, color: CODE_COLORS.variable });
    else if (fn) out.push({ text: t, color: kw.has(fn.toLowerCase()) ? CODE_COLORS.keyword : CODE_COLORS.func });
    else if (word)
      out.push({
        text: t,
        color: kw.has(word.toLowerCase()) ? CODE_COLORS.keyword : language === "php" && /^[A-Z]/.test(word) ? CODE_COLORS.type : CODE_COLORS.plain,
      });
    else if (ws) out.push({ text: t, color: CODE_COLORS.plain });
    else out.push({ text: t, color: CODE_COLORS.punct });
  }
  return out;
};
