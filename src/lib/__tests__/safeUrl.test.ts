import { describe, expect, it } from "vitest";
import { safeHref } from "../safeUrl";

describe("safeHref", () => {
  it("allows https, mailto, tel and same-site paths", () => {
    expect(safeHref("https://github.com/shahvannsh")).toBe("https://github.com/shahvannsh");
    expect(safeHref("mailto:shahvannsh@gmail.com?subject=Hi")).toBe("mailto:shahvannsh@gmail.com?subject=Hi");
    expect(safeHref("tel:+918668995892")).toBe("tel:+918668995892");
    expect(safeHref("/Vannsh-Shah-Resume.pdf")).toBe("/Vannsh-Shah-Resume.pdf");
  });

  it("blocks script, data, plain http and protocol-relative links", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      " javascript:alert(1)",
      "data:text/html;base64,PHNjcmlwdD4=",
      "vbscript:msgbox(1)",
      "http://example.com",
      "//evil.example.com/x",
      "/\\evil.example.com",
      "not a url",
      "",
    ]) {
      expect(safeHref(bad)).toBe("#");
    }
  });
});
