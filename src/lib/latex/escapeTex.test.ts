import { describe, expect, it } from "vitest";
import { escapeTextOutsideMath } from "./escapeTex";

describe("escapeTextOutsideMath", () => {
  it("keeps math segments verbatim", () => {
    expect(escapeTextOutsideMath("Solve $x^2 + y_1 = 0$ now")).toBe("Solve $x^2 + y_1 = 0$ now");
    expect(escapeTextOutsideMath("\\[ x^2 \\]")).toBe("\\[ x^2 \\]");
    expect(escapeTextOutsideMath("$$\\frac{a}{b}$$")).toBe("$$\\frac{a}{b}$$");
  });

  it("escapes specials in prose only", () => {
    expect(escapeTextOutsideMath("Cost & fees 50% of item_1")).toBe(
      "Cost \\& fees 50\\% of item\\_1",
    );
  });

  it("does not double-escape", () => {
    expect(escapeTextOutsideMath("Cost \\& fees \\$50")).toBe("Cost \\& fees \\$50");
  });
});
