import { findBraceIssues, findMatchingBrace, nextNonSpace } from "./braces";

export interface LatexValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Commands validated structurally: name -> number of required {} arguments. */
const COMMAND_ARITY: Record<string, number> = {
  frac: 2,
  dfrac: 2,
  tfrac: 2,
  binom: 2,
  sqrt: 1,
  text: 1,
  textbf: 1,
  textit: 1,
  mathrm: 1,
  mathbf: 1,
  mathbb: 1,
  mathcal: 1,
  overline: 1,
  underline: 1,
  begin: 1,
  end: 1,
};

const validateCommands = (input: string, errors: string[], warnings: string[]): void => {
  const re = /\\([a-zA-Z]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    const name = match[1];
    const arity = COMMAND_ARITY[name];
    if (arity === undefined) continue; // conservative: unknown commands are fine

    let cursor = match.index + match[0].length;

    // \sqrt supports an optional [n] index argument.
    if (name === "sqrt") {
      const next = nextNonSpace(input, cursor);
      if (next !== -1 && input[next] === "[") {
        const close = input.indexOf("]", next);
        if (close === -1) {
          errors.push(`Unclosed optional argument for \\sqrt at position ${next}`);
          continue;
        }
        cursor = close + 1;
      }
    }

    for (let arg = 0; arg < arity; arg++) {
      const next = nextNonSpace(input, cursor);
      if (next === -1 || input[next] !== "{") {
        // A single-token argument (e.g. \sqrt2) is legal LaTeX, just fragile.
        if (next !== -1 && arity === 1 && /[A-Za-z0-9]/.test(input[next])) {
          warnings.push(`\\${name} uses a brace-less argument at position ${next}`);
          cursor = next + 1;
          continue;
        }
        errors.push(
          `Missing ${arg === 0 ? "first" : "second"} argument for \\${name} at position ${match.index}`,
        );
        break;
      }
      const close = findMatchingBrace(input, next);
      if (close === -1) {
        errors.push(`Unclosed argument for \\${name} at position ${next}`);
        break;
      }
      cursor = close + 1;
    }
  }
};

const validateEnvironments = (input: string, errors: string[]): void => {
  const re = /\\(begin|end)\s*\{([^}]*)\}/g;
  const stack: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    if (match[1] === "begin") stack.push(match[2]);
    else {
      const open = stack.pop();
      if (open === undefined) {
        errors.push(`\\end{${match[2]}} without a matching \\begin at position ${match.index}`);
      } else if (open !== match[2]) {
        errors.push(`\\begin{${open}} closed by \\end{${match[2]}} at position ${match.index}`);
      }
    }
  }
  for (const env of stack) errors.push(`\\begin{${env}} is never closed`);
};

const validateMathDelimiters = (input: string, warnings: string[]): void => {
  const withoutDisplay = input.replace(/\$\$/g, "");
  let count = 0;
  for (let i = 0; i < withoutDisplay.length; i++) {
    if (withoutDisplay[i] !== "$") continue;
    let backslashes = 0;
    for (let j = i - 1; j >= 0 && withoutDisplay[j] === "\\"; j--) backslashes++;
    if (backslashes % 2 === 1) continue;
    count++;
  }
  if (count % 2 !== 0) warnings.push("Odd number of inline math ($) delimiters");

  const open = (input.match(/\\\[/g) || []).length;
  const close = (input.match(/\\\]/g) || []).length;
  if (open !== close) warnings.push("Unbalanced display math delimiters \\[ ... \\]");
};

/**
 * Conservative structural validation of a LaTeX string. Unknown commands are
 * never treated as errors.
 */
export const validateLatex = (latex: string): LatexValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const issue of findBraceIssues(latex)) errors.push(issue.message);
  validateCommands(latex, errors, warnings);
  validateEnvironments(latex, errors);
  validateMathDelimiters(latex, warnings);

  return { valid: errors.length === 0, errors, warnings };
};
