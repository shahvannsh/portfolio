// Applies the saved (or system) colour theme before first paint. Kept as a file, not inline, so the CSP can forbid inline scripts.
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    if (theme === "light") document.documentElement.classList.add("light");
  } catch (e) {}
})();
