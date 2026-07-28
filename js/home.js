ElibraryApp.boot(() => {
  const { content } = ElibraryApp.state;
  const cats = content.categories || [];
  document.getElementById("categoryStrip").innerHTML =
    cats.map((c) => ElibraryApp.categoryCard(c)).join("");

  const featured = content.featuredBooks?.length
    ? content.featuredBooks
    : (content.books || []).filter((b) => b.isFeatured);
  document.getElementById("featuredGrid").innerHTML =
    featured.slice(0, 8).map((b) => ElibraryApp.bookCard(b)).join("")
    || `<p>${ElibraryApp.t("empty")}</p>`;

  const latest = [...(content.books || [])].slice(0, 8);
  document.getElementById("latestGrid").innerHTML =
    latest.map((b) => ElibraryApp.bookCard(b)).join("")
    || `<p>${ElibraryApp.t("empty")}</p>`;
});
