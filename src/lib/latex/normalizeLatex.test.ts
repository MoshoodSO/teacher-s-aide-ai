import { describe, expect, it } from "vitest";
import { normalizeLatex, normalizeLatexWithReport } from "./normalizeLatex";
import { validateLatex } from "./validateLatex";

describe("normalizeLatex", () => {
  it("TEST 1: converts escaped math delimiters", () => {
    expect(normalizeLatex("\\$a \\neq 0\\$")).toBe("$a \\neq 0$");
  });

  it("TEST 2: fixes escaped delimiters and superscripts together", () => {
    expect(normalizeLatex("\\$ax\\^{}2 + bx + c = 0\\$")).toBe("$ax^2 + bx + c = 0$");
  });

  it("TEST 3: normalizes malformed superscripts", () => {
    expect(normalizeLatex("x\\^{}2")).toBe("x^2");
    expect(normalizeLatex("x\\^2")).toBe("x^2");
    expect(normalizeLatex("x\\^{}{2}")).toBe("x^{2}");
  });

  it("TEST 4: leaves valid superscripts untouched", () => {
    expect(normalizeLatex("x^{2}")).toBe("x^{2}");
    expect(normalizeLatex("x^{n+1}")).toBe("x^{n+1}");
  });

  it("TEST 5: repairs superscripts inside \\sqrt", () => {
    expect(normalizeLatex("\\sqrt{b\\^{}2-4ac}")).toBe("\\sqrt{b^2-4ac}");
  });

  it("TEST 6: restores the intended fraction around a sqrt", () => {
    expect(normalizeLatex("\\sqrt{b\\^{}2-4ac}}{2a}")).toBe("\\frac{\\sqrt{b^2-4ac}}{2a}");
  });

  it("TEST 7: preserves literal currency", () => {
    expect(normalizeLatex("The price is \\$50.")).toBe("The price is \\$50.");
    expect(normalizeLatex("It costs \\$50 or \\$60 depending on size.")).toBe(
      "It costs \\$50 or \\$60 depending on size.",
    );
  });

  it("TEST 8: leaves display math untouched", () => {
    const input = "\\[\nx^{2} + y^{2} = z^{2}\n\\]";
    expect(normalizeLatex(input)).toBe(input);
  });

  it("TEST 9: leaves valid fractions untouched", () => {
    expect(normalizeLatex("\\frac{x+1}{x-1}")).toBe("\\frac{x+1}{x-1}");
    expect(normalizeLatex("\\frac{\\sqrt{x^2+1}}{2}")).toBe("\\frac{\\sqrt{x^2+1}}{2}");
  });

  it("handles markdown mixed with latex", () => {
    expect(normalizeLatex("The quadratic equation is \\$ax\\^{}2 + bx + c = 0\\$.")).toBe(
      "The quadratic equation is $ax^2 + bx + c = 0$.",
    );
    expect(normalizeLatex("## Heading\n\nNormal *markdown* text stays put.")).toBe(
      "## Heading\n\nNormal *markdown* text stays put.",
    );
  });

  it("produces a repair report", () => {
    const report = normalizeLatexWithReport("\\$ax\\^{}2 + bx + c = 0\\$");
    expect(report.normalized).toBe("$ax^2 + bx + c = 0$");
    expect(report.changes).toContain("Normalized escaped superscript");
    expect(report.changes).toContain("Converted escaped math delimiters");
    expect(report.valid).toBe(true);
  });
});

describe("validateLatex", () => {
  it("accepts valid latex", () => {
    expect(validateLatex("\\sqrt{x^2+1}").valid).toBe(true);
    expect(validateLatex("\\frac{x+1}{x-1}").valid).toBe(true);
    expect(validateLatex("\\begin{align}a&=b\\end{align}").valid).toBe(true);
  });

  it("TEST 10: reports unmatched braces", () => {
    const result = validateLatex("\\sqrt{x^2+1}}");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Unmatched closing brace at position \d+/);

    const openResult = validateLatex("\\sqrt{x^2+1");
    expect(openResult.valid).toBe(false);
  });

  it("reports missing \\frac argument", () => {
    const result = validateLatex("\\frac{x+1}");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("\\frac"))).toBe(true);
  });

  it("reports mismatched environments", () => {
    expect(validateLatex("\\begin{align}x\\end{equation}").valid).toBe(false);
  });

  it("does not reject unknown commands", () => {
    expect(validateLatex("\\somefuturecommand{x}").valid).toBe(true);
  });
});
