/**
 * Unit tests for fence-language display label mapping.
 */

import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { getCodeLanguage, getLanguageLabel } from "./codeLanguage";

describe("getLanguageLabel", () => {
  it("maps common aliases to Title Case / dialect labels", () => {
    expect(getLanguageLabel("ts")).toBe("TypeScript");
    expect(getLanguageLabel("typescript")).toBe("TypeScript");
    expect(getLanguageLabel("tsx")).toBe("TSX");
    expect(getLanguageLabel("js")).toBe("JavaScript");
    expect(getLanguageLabel("javascript")).toBe("JavaScript");
    expect(getLanguageLabel("jsx")).toBe("JSX");
    expect(getLanguageLabel("html")).toBe("HTML");
    expect(getLanguageLabel("css")).toBe("CSS");
    expect(getLanguageLabel("bash")).toBe("Bash");
    expect(getLanguageLabel("sh")).toBe("Bash");
    expect(getLanguageLabel("shell")).toBe("Bash");
  });

  it("looks up aliases case-insensitively", () => {
    expect(getLanguageLabel("TypeScript")).toBe("TypeScript");
    expect(getLanguageLabel("JavaScript")).toBe("JavaScript");
    expect(getLanguageLabel("TS")).toBe("TypeScript");
  });

  it("passes through unknown fence tokens", () => {
    expect(getLanguageLabel("python")).toBe("python");
    expect(getLanguageLabel("Rust")).toBe("Rust");
  });
});

describe("getCodeLanguage", () => {
  it("reads the language-* class from a code child", () => {
    const children = createElement("code", { className: "language-ts hljs" });
    expect(getCodeLanguage(children)).toBe("ts");
  });

  it("returns null when there is no language class", () => {
    const children = createElement("code", { className: "hljs" });
    expect(getCodeLanguage(children)).toBeNull();
    expect(getCodeLanguage(null)).toBeNull();
  });
});
