(() => {
  const API_BASE = (window.ELIBRARY_API_BASE || "").replace(/\/$/, "");
  const I18N = window.ELIB_I18N;
  const listeners = new Set();

  const state = {
    lang: localStorage.getItem("elib-lang") || "ar",
    content: null,
    live: false
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function t(key) {
    const v = I18N[state.lang]?.[key];
    return typeof v === "function" ? v : (v ?? key);
  }

  function emit() {
    listeners.forEach((fn) => {
      try { fn(state); } catch (e) { console.error(e); }
    });
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("ltr", state.lang !== "ar");
    const langBtn = $("#langBtn");
    if (langBtn) langBtn.textContent = state.lang === "ar" ? "EN" : "ع";

    $$("[data-i18n]").forEach((el) => {
      const val = I18N[state.lang][el.dataset.i18n];
      if (typeof val === "string") el.textContent = val;
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = I18N[state.lang][el.dataset.i18nPlaceholder] || "";
    });
  }

  function bindSettings() {
    const s = state.content?.settings;
    if (!s) return;
    const name = state.lang === "ar" ? s.nameAr : s.nameEn;
    const tagline = state.lang === "ar" ? s.taglineAr : s.taglineEn;
    const about = state.lang === "ar" ? s.aboutAr : s.aboutEn;
    const address = state.lang === "ar" ? s.addressAr : s.addressEn;

    $$("[data-bind='name']").forEach((el) => (el.textContent = name));
    $$("[data-bind='tagline']").forEach((el) => (el.textContent = tagline));
    $$("[data-bind='about']").forEach((el) => (el.textContent = about));
    $$("[data-bind='address']").forEach((el) => (el.textContent = address));
    $$("[data-bind='email']").forEach((el) => (el.textContent = s.email || "—"));
    $$("[data-bind='phone']").forEach((el) => (el.textContent = s.phone || "—"));
    $$("[data-bind-href='email']").forEach((el) => { el.href = s.email ? `mailto:${s.email}` : "#"; });

    document.title = name;
    const wa = (s.whatsApp || "").replace(/\D/g, "");
    const msg = encodeURIComponent(state.lang === "ar" ? "مرحبا، أود الاستفسار عن المكتبة" : "Hi, I'd like to ask about the library");
    $$("[data-whatsapp]").forEach((el) => {
      el.href = wa ? `https://wa.me/${wa}?text=${msg}` : "#";
    });

    const booksEl = $("#statBooks");
    const catsEl = $("#statCats");
    const featEl = $("#statFeatured");
    const authorsEl = $("#statAuthors");
    const books = state.content.books || [];
    if (booksEl) booksEl.textContent = state.content.totalBooks || books.length || 0;
    if (catsEl) catsEl.textContent = state.content.categories?.length || 0;
    if (featEl) featEl.textContent = books.filter((b) => b.isFeatured).length;
    if (authorsEl) authorsEl.textContent = new Set(books.map((b) => b.author)).size;
  }

  function setLive(on) {
    state.live = on;
    const banner = $("#liveBanner");
    if (!banner) return;
    banner.classList.toggle("on", on);
    banner.querySelector("span:last-child").textContent = on ? t("liveOn") : t("liveOff");
  }

  async function loadContent() {
    try {
      const res = await fetch(`${API_BASE}/api/public/content`);
      if (!res.ok) throw new Error("API error");
      state.content = await res.json();
    } catch (err) {
      console.warn("API unavailable", err);
      state.content = {
        settings: {
          nameAr: "مكتبة ريم الإلكترونية",
          nameEn: "Reem Digital Library",
          nameEn: "Al-Noor Digital Library",
          taglineAr: "اقرأ · اكتشف · تعلّم",
          taglineEn: "Read · Discover · Learn",
          aboutAr: "المحتوى غير متاح حالياً. شغّل الـ API على المنفذ 5080.",
          aboutEn: "Content unavailable. Start the API on port 5080.",
          email: "", phone: "", addressAr: "", addressEn: "", whatsApp: ""
        },
        categories: [],
        featuredBooks: [],
        books: [],
        totalBooks: 0
      };
    }
    applyI18n();
    bindSettings();
    emit();
  }

  let hub = null;
  async function connectRealtime() {
    if (!window.signalR || hub) return;
    hub = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/library`)
      .withAutomaticReconnect()
      .build();

    hub.on("libraryChanged", async (evt) => {
      if (["book", "category", "settings"].includes(evt.entity)) {
        await loadContent();
      }
    });
    hub.onreconnecting(() => setLive(false));
    hub.onreconnected(() => setLive(true));
    hub.onclose(() => setLive(false));

    try {
      await hub.start();
      setLive(true);
    } catch {
      setLive(false);
    }
  }

  function categoryName(c) {
    return state.lang === "ar" ? c.nameAr : c.nameEn;
  }
  function bookCategoryName(b) {
    return state.lang === "ar" ? b.categoryNameAr : b.categoryNameEn;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("'", "&#39;");
  }

  function bookCard(book) {
    const feat = book.isFeatured
      ? `<span class="feat-badge">${t("featuredBadge")}</span>` : "";
    return `
      <a class="book-card" href="book.html?id=${book.id}">
        <div class="cover-wrap">${feat}
          <img src="${escapeAttr(book.coverUrl || "")}" alt="${escapeAttr(book.title)}" loading="lazy" />
        </div>
        <div class="body">
          <h3>${escapeHtml(book.title)}</h3>
          <p class="author">${escapeHtml(book.author)}</p>
          <span class="cat-tag">${escapeHtml(bookCategoryName(book))}</span>
        </div>
      </a>`;
  }

  function categoryCard(cat) {
    const icons = ["📖", "💻", "📜", "🌟", "🔬", "📚"];
    const ico = icons[cat.id % icons.length];
    return `
      <a class="cat-card" href="catalog.html?cat=${encodeURIComponent(cat.slug)}">
        <div class="ico">${ico}</div>
        <strong>${escapeHtml(categoryName(cat))}</strong>
        <span>${cat.booksCount} ${t("statBooks")}</span>
      </a>`;
  }

  function initSearch() {
    const go = (q) => {
      const query = (q || "").trim();
      if (query) location.href = `catalog.html?q=${encodeURIComponent(query)}`;
      else location.href = "catalog.html";
    };
    $$("#globalSearchForm, #heroSearchForm").forEach((form) => {
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input[type=search], input[type=text]");
        go(input?.value);
      });
    });
  }

  function setActiveNav() {
    const page = location.pathname.split("/").pop() || "index.html";
    $$(".subnav a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("active", href === page || (page === "" && href === "index.html"));
    });
  }

  function initHeader() {
    const btn = $("#menuBtn");
    const nav = $("#subNavInner");
    btn?.addEventListener("click", () => nav?.classList.toggle("open"));
    $("#langBtn")?.addEventListener("click", () => {
      state.lang = state.lang === "ar" ? "en" : "ar";
      localStorage.setItem("elib-lang", state.lang);
      applyI18n();
      bindSettings();
      setLive(state.live);
      emit();
    });
    initSearch();
    setActiveNav();
  }

  function initLoader() {
    const loader = $("#pageLoader");
    if (!loader) return;
    const hide = () => loader.classList.add("hide");
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide);
    setTimeout(hide, 4000);
  }

  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  async function boot(pageInit) {
    initLoader();
    initHeader();
    await loadContent();
    await connectRealtime();
    if (typeof pageInit === "function") pageInit(state);
    onChange(() => {
      if (typeof pageInit === "function") pageInit(state);
      initReveal();
    });
    initReveal();
  }

  window.ElibraryApp = {
    state, t, onChange, boot, bookCard, categoryCard, categoryName, bookCategoryName,
    escapeHtml, escapeAttr, loadContent, applyI18n, bindSettings
  };
})();
