/**
 * Unit tests for blog reading-time estimates (200 WPM, 1-minute floor).
 */

import { describe, expect, it } from "vitest";
import { readingMinutes } from "./readingTime";

function words(count: number): string {
  return Array.from({ length: count }, () => "word").join(" ");
}

describe("readingMinutes", () => {
  it("returns a minimum of 1 minute estimated reading time for empty post", () => {
    expect(readingMinutes("")).toBe(1);
  });

  it("returns 1 minute for 200 words or fewer", () => {
    expect(readingMinutes(words(199))).toBe(1);
    expect(readingMinutes(words(200))).toBe(1);
  });

  it("rounds up at 201 words", () => {
    expect(readingMinutes(words(201))).toBe(2);
  });

  it("does not count heading markers as words", () => {
    expect(readingMinutes(`# ${words(200)}`)).toBe(1);
  });

  it("does not count images as words", () => {
    expect(
      readingMinutes(
        `${words(200)} ![alt text](https://example.com/photo.png)`,
      ),
    ).toBe(1);
  });

  it("counts link labels and not URLs", () => {
    // 199 + "hello world" = 201 → 2; a single [text](url) token would stay at 1
    expect(
      readingMinutes(`${words(199)} [hello world](https://example.com/path)`),
    ).toBe(2);
  });

  it("counts words inside fenced code blocks", () => {
    // 50 outside + 151 inside = 201 → 2; ignoring the fence would stay at 1
    const markdown = `${words(50)}\n\`\`\`js\n${words(151)}\n\`\`\`\n`;
    expect(readingMinutes(markdown)).toBe(2);
  });
});
