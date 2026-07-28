(function () {
  const host = location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "";

  if (window.ELIBRARY_API_BASE) return;

  window.ELIBRARY_API_BASE = isLocal
    ? "http://localhost:5080"
    : "https://reem-library-api.onrender.com";
})();
