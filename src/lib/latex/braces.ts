/**
 * Low-level brace utilities shared by the normalizer and the validator.
 * A backslash-escaped brace (\{ or \}) is never structural.
 */

export const isEscapedAt = (input: string, index: number): boolean => {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && input[i] === "\\"; i--) backslashes++;
  return backslashes % 2 === 1;
};

/**
 * Given the index of an opening "{", returns the index of its matching "}",
 * or -1 when the group is never closed.
 */
export const findMatchingBrace = (input: string, openIndex: number): number => {
  if (input[openIndex] !== "{") return -1;
  let depth = 0;
  for (let i = openIndex; i < input.length; i++) {
    const ch = input[i];
    if ((ch === "{" || ch === "}") && isEscapedAt(input, i)) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

/**
 * Skips whitespace and returns the index of the next non-space character,
 * or -1 when only whitespace remains.
 */
export const nextNonSpace = (input: string, from: number): number => {
  for (let i = from; i < input.length; i++) {
    if (!/\s/.test(input[i])) return i;
  }
  return -1;
};

export interface BraceIssue {
  message: string;
  position: number;
}

export const findBraceIssues = (input: string): BraceIssue[] => {
  const issues: BraceIssue[] = [];
  const stack: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if ((ch === "{" || ch === "}") && isEscapedAt(input, i)) continue;
    if (ch === "{") stack.push(i);
    else if (ch === "}") {
      if (stack.length === 0) {
        issues.push({ message: `Unmatched closing brace at position ${i}`, position: i });
      } else {
        stack.pop();
      }
    }
  }
  for (const pos of stack) {
    issues.push({ message: `Unmatched opening brace at position ${pos}`, position: pos });
  }
  return issues;
};
