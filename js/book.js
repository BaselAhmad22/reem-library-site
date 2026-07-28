(() => {
  const id = Number(new URLSearchParams(location.search).get("id"));

  function render() {
    const book = (ElibraryApp.state.content.books || []).find((b) => b.id === id);
    const root = document.getElementById("bookDetail");
    if (!book) {
      root.innerHTML = `<p>${ElibraryApp.t("empty")}</p>`;
      return;
    }
    document.title = book.title;
    root.innerHTML = `
      <img src="${ElibraryApp.escapeAttr(book.coverUrl || "")}" alt="${ElibraryApp.escapeAttr(book.title)}" />
      <div>
        <p class="eyebrow">${ElibraryApp.escapeHtml(ElibraryApp.bookCategoryName(book))}</p>
        <h1 class="page-title">${ElibraryApp.escapeHtml(book.title)}</h1>
        <p class="author">${ElibraryApp.escapeHtml(book.author)}</p>
        <p>${ElibraryApp.escapeHtml(book.description || "")}</p>
        <ul class="meta-list">
          <li>${ElibraryApp.t("copies")}: ${book.availableCopies}</li>
          ${book.publishedYear ? `<li>${ElibraryApp.t("year")}: ${book.publishedYear}</li>` : ""}
          ${book.isbn ? `<li>${ElibraryApp.t("isbn")}: ${ElibraryApp.escapeHtml(book.isbn)}</li>` : ""}
          <li>${ElibraryApp.t("lang")}: ${ElibraryApp.escapeHtml(book.language)}</li>
        </ul>
      </div>`;
  }

  ElibraryApp.boot(render);
})();
