(() => {
  const params = new URLSearchParams(location.search);
  let activeCategory = params.get("cat") || "";
  let searchQuery = params.get("q") || "";

  function render() {
    const { content } = ElibraryApp.state;
    const searchInput = document.getElementById("searchInput");
    if (searchInput && searchQuery) searchInput.value = searchQuery;

    const chips = document.getElementById("categoryChips");
    const allLabel = ElibraryApp.t("allCategories");
    chips.innerHTML = `<button type="button" class="chip ${!activeCategory ? "active" : ""}" data-slug="">${allLabel}</button>` +
      (content.categories || []).map((c) =>
        `<button type="button" class="chip ${activeCategory === c.slug ? "active" : ""}" data-slug="${c.slug}">${ElibraryApp.categoryName(c)}</button>`
      ).join("");

    chips.querySelectorAll(".chip").forEach((btn) => {
      btn.onclick = () => {
        activeCategory = btn.dataset.slug || "";
        render();
      };
    });

    const q = searchQuery.trim().toLowerCase();
    let list = [...(content.books || [])];
    if (activeCategory) list = list.filter((b) => b.categorySlug === activeCategory);
    if (q) list = list.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));

    const resultsFn = window.ELIB_I18N[ElibraryApp.state.lang].results;
    document.getElementById("resultsMeta").textContent =
      typeof resultsFn === "function" ? resultsFn(list.length) : `${list.length}`;

    document.getElementById("catalogGrid").innerHTML =
      list.map((b) => ElibraryApp.bookCard(b)).join("") || `<p>${ElibraryApp.t("empty")}</p>`;
  }

  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    render();
  });

  ElibraryApp.boot(render);
})();
