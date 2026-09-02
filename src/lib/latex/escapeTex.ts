/**
 * Splits content into math and prose segments so that TeX escaping is only
 * applied to prose. Math segments ($...$, $$...$$, \[...\]) are emitted
 * verbatim, which keeps valid LaTeX untouched.
 */

interface Segment {
  text: string;
  math: boolean;
}

const splitMathSegments = (input: string): Segment[] => {
  const segments: Segment[] = [];
  let buffer = "";
  let i = 0;

  const pushProse = () => {
    if (buffer) segments.push({ text: buffer, math: false });
    buffer = "";
  };

  const consumeUntil = (start: number, closer: string): number => input.indexOf(closer, start);

  while (i < input.length) {
    const isEscaped = i > 0 && input[i - 1] === "\\";

    if (input.startsWith("$$", i) && !isEscaped) {
      const end = consumeUntil(i + 2, "$$");
      if (end !== -1) {
        pushProse();
        segments.push({ text: input.slice(i, end + 2), math: true });
        i = end + 2;
        continue;
      }
    }

    if (input.startsWith("\\[", i)) {
      const end = consumeUntil(i + 2, "\\]");
      if (end !== -1) {
        pushProse();
        segments.push({ text: input.slice(i, end + 2), math: true });
        i = end + 2;
        continue;
      }
    }

    if (input[i] === "$" && !isEscaped) {
      const end = (() => {
        for (let j = i + 1; j < input.length; j++) {
          if (input[j] === "$" && input[j - 1] !== "\\") return j;
        }
        return -1;
      })();
      if (end !== -1 && !/\n\s*\n/.test(input.slice(i, end))) {
        pushProse();
        segments.push({ text: input.slice(i, end + 1), math: true });
        i = end + 1;
        continue;
      }
    }

    buffer += input[i];
    i++;
  }

  pushProse();
  return segments;
};

const escapeProse = (text: string): string =>
  text
    // keep already-escaped sequences intact
    .replace(/(?<!\\)([&%#])/g, "\\$1")
    .replace(/(?<!\\)_/g, "\\_")
    .replace(/(?<!\\)\$/g, "\\$");

/** Escapes TeX-special characters in prose while preserving math segments. */
export const escapeTextOutsideMath = (input: string): string =>
  splitMathSegments(input)
    .map((segment) => (segment.math ? segment.text : escapeProse(segment.text)))
    .join("");
