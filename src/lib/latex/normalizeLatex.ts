import { findBraceIssues, findMatchingBrace, isEscapedAt } from "./braces";
import { validateLatex, type LatexValidationResult } from "./validateLatex";

export interface LatexRepairReport {
  original: string;
  normalized: string;
  changes: string[];
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface RuleResult {
  output: string;
  changed: boolean;
}

type Rule = { label: string; apply: (input: string) => RuleResult };

/* ------------------------------------------------------------------ *
 * Rule 1: malformed superscripts / subscripts
 * x\^{}2 -> x^2 ,  x\^2 -> x^2 ,  x\^{}{2} -> x^{2}
 * Only when the caret clearly acts as a superscript operator, i.e. it
 * follows a token and is followed by a token or a braced group.
 * ------------------------------------------------------------------ */
const escapedScriptRule = (symbol: "^" | "_", label: string): Rule => {
  const esc = symbol === "^" ? "\\^" : "\\_";
  const pattern = new RegExp(
    `([A-Za-z0-9\\)\\]\\}])\\s*\\${esc}(?:\\{\\})?(\\{[^{}]*\\}|[A-Za-z0-9])`,
    "g",
  );
  return {
    label,
    apply: (input) => {
      const output = input.replace(pattern, (_m, before: string, after: string) =>
        `${before}${symbol}${after}`,
      );
      return { output, changed: output !== input };
    },
  };
};

/* ------------------------------------------------------------------ *
 * Rule 2: escaped math delimiters  \$ ... \$  ->  $ ... $
 * Only when the two escaped dollars form a pair whose content looks
 * like mathematics. Lone \$ (currency, e.g. "\$50") is preserved.
 * ------------------------------------------------------------------ */
const looksLikeMath = (content: string): boolean => {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 200) return false;
  if (/\n\s*\n/.test(trimmed)) return false;
  // Pure money-ish content is not math.
  if (/^\d[\d,.]*$/.test(trimmed)) return false;
  const hasCommand = /\\[a-zA-Z]+/.test(trimmed);
  const hasScript = /[\^_]/.test(trimmed);
  const hasRelationOrOperator = /[=<>+\-*/]|\\(neq|leq|geq|times|div|cdot|pm)/.test(trimmed);
  const hasSymbolToken = /[A-Za-z0-9]/.test(trimmed);
  return hasCommand || hasScript || (hasRelationOrOperator && hasSymbolToken);
};

const findEscapedDollarIndexes = (input: string): number[] => {
  const positions: number[] = [];
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "$" && isEscapedAt(input, i)) positions.push(i);
  }
  return positions;
};

const escapedDelimiterRule: Rule = {
  label: "Converted escaped math delimiters",
  apply: (input) => {
    const positions = findEscapedDollarIndexes(input);
    if (positions.length < 2) return { output: input, changed: false };

    const unescapeAt: number[] = [];
    for (let i = 0; i + 1 < positions.length; ) {
      const start = positions[i];
      const end = positions[i + 1];
      const content = input.slice(start + 1, end - 1); // exclude the trailing backslash
      if (looksLikeMath(content)) {
        unescapeAt.push(start - 1, end - 1); // indexes of the backslashes
        i += 2;
      } else {
        i += 1;
      }
    }
    if (unescapeAt.length === 0) return { output: input, changed: false };

    const drop = new Set(unescapeAt);
    let output = "";
    for (let i = 0; i < input.length; i++) {
      if (drop.has(i)) continue;
      output += input[i];
    }
    return { output, changed: true };
  },
};

/* ------------------------------------------------------------------ *
 * Rule 3: \sqrt{...}}{...}  ->  \frac{\sqrt{...}}{...}
 * Applied only when the extra closing brace is genuinely unmatched, so
 * the intended \frac structure is unambiguous.
 * ------------------------------------------------------------------ */
const sqrtFractionRule: Rule = {
  label: "Restored missing \\frac around \\sqrt expression",
  apply: (input) => {
    const unmatchedClosings = new Set(
      findBraceIssues(input)
        .filter((issue) => issue.message.startsWith("Unmatched closing"))
        .map((issue) => issue.position),
    );
    if (unmatchedClosings.size === 0) return { output: input, changed: false };

    let output = input;
    let changed = false;
    let searchFrom = 0;
    for (;;) {
      const sqrtIndex = output.indexOf("\\sqrt{", searchFrom);
      if (sqrtIndex === -1) break;
      searchFrom = sqrtIndex + 6;

      const groupOpen = sqrtIndex + 5;
      const groupClose = findMatchingBrace(output, groupOpen);
      if (groupClose === -1) continue;

      const extra = groupClose + 1;
      if (output[extra] !== "}" || !unmatchedClosings.has(extra)) continue;

      const denomOpen = extra + 1;
      if (output[denomOpen] !== "{") continue;
      const denomClose = findMatchingBrace(output, denomOpen);
      if (denomClose === -1) continue;

      const numerator = output.slice(sqrtIndex, groupClose + 1);
      const denominator = output.slice(denomOpen, denomClose + 1);
      const replacement = `\\frac{${numerator}}${denominator}`;
      output = output.slice(0, sqrtIndex) + replacement + output.slice(denomClose + 1);
      changed = true;
      // positions shifted; recompute unmatched braces and restart
      return changed ? sqrtFractionRule.apply(output) : { output, changed };
    }
    return { output, changed };
  },
};

/* ------------------------------------------------------------------ *
 * Rule 4: doubled backslash escapes of math delimiters produced by
 * over-escaping pipelines: \\[ -> \[ is NOT touched (valid), but
 * \\$ (escaped backslash + $) stays untouched too. Instead we clean up
 * the redundant \{\} pair left behind by broken escapes: \^{}\ -> ^
 * ------------------------------------------------------------------ */
const strayCaretGroupRule: Rule = {
  label: "Removed empty group after caret",
  apply: (input) => {
    const output = input.replace(/\^\{\}([A-Za-z0-9{])/g, "^$1");
    return { output, changed: output !== input };
  },
};

const RULES: Rule[] = [
  escapedScriptRule("^", "Normalized escaped superscript"),
  escapedScriptRule("_", "Normalized escaped subscript"),
  strayCaretGroupRule,
  escapedDelimiterRule,
  sqrtFractionRule,
];

/** Normalizes/repairs LaTeX and reports every change made. */
export const normalizeLatexWithReport = (latex: string): LatexRepairReport => {
  const original = latex ?? "";
  let current = original;
  const changes: string[] = [];

  for (const rule of RULES) {
    const { output, changed } = rule.apply(current);
    if (changed) {
      current = output;
      if (!changes.includes(rule.label)) changes.push(rule.label);
    }
  }

  const validation: LatexValidationResult = validateLatex(current);
  return {
    original,
    normalized: current,
    changes,
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
  };
};

/** Convenience wrapper returning only the repaired LaTeX. */
export const normalizeLatex = (latex: string): string => normalizeLatexWithReport(latex).normalized;
