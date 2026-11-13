const ALLOWED_PROTOCOLS = new Set(["https:", "mailto:", "tel:"]);

/**
 * Returns the URL only if it is a plain same-site path or uses https, mailto or tel; otherwise "#".
 * A defence in depth so a bad value in the data (or a future change) can never produce a javascript: or data: link.
 */
export function safeHref(href: string): string {
  const value = href.trim();
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    return value;
  }
  try {
    return ALLOWED_PROTOCOLS.has(new URL(value).protocol) ? value : "#";
  } catch {
    return "#";
  }
}
