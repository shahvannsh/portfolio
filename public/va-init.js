// Queues analytics events until Vercel Web Analytics loads (file, not inline, for the CSP).
window.va =
  window.va ||
  function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
