// Reusable "tech explainer" scene layouts, referenced from scenes.json via `scene.layout`.
// Each layout is pure data → the renderer animates it. No drawing per video.

export type CodeLayout = {
  type: "code";
  code: string;
  language?: "sql" | "js" | "ts" | "python" | "bash" | "json" | "php" | "text";
  highlight?: number[]; // 1-based line numbers to highlight after typing
  typing?: boolean; // default true
  title?: string; // file name / tab label
};

export type TerminalLine = { kind: "cmd" | "out" | "ok" | "err" | "info"; text: string };
export type TerminalLayout = { type: "terminal"; lines: TerminalLine[]; title?: string };

export type TableLayout = {
  type: "table";
  columns: string[];
  rows: string[][]; // visible sample rows; use "…" rows to imply more
  target: number; // 0-based row index that matches
  scan?: boolean; // animate a row-by-row scan down to target (default true)
  label?: string; // e.g. "Full Table Scan"
};

export type ComparePanel = { title: string; items: string[]; tone?: "bad" | "good" | "neutral"; icon?: string };
export type CompareLayout = { type: "compare"; left: ComparePanel; right: ComparePanel };

export type BulletsLayout = { type: "bullets"; items: { icon?: string; text: string }[] };

// Balanced tree (e.g. B-Tree): levels[0] = root keys, each node's children are the next level's nodes split evenly.
export type TreeLayout = {
  type: "tree";
  levels: string[][];
  path: number[]; // node index per level to highlight as the search path
  leaf?: string; // result shown under the final node, e.g. "row #842117"
  label?: string;
};

export type Layout = CodeLayout | TerminalLayout | TableLayout | CompareLayout | BulletsLayout | TreeLayout;
