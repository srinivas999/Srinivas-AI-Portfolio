(function () {
  const STORAGE_KEY = "siteSettingsCache";
  const path = window.location.pathname || "";
  const currentPage =
    /about\.html$/i.test(path) || /[/\\]about$/i.test(path)
      ? "about"
      : /projects\.html$/i.test(path) || /[/\\]projects$/i.test(path)
        ? "projects"
        : /contact\.html$/i.test(path) || /[/\\]contact$/i.test(path)
          ? "contact"
          : /ott-movies\.html$/i.test(path) || /[/\\]ott-movies$/i.test(path)
            ? "ott"
            : "home";

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const settings = JSON.parse(raw);
    const root = document.documentElement;

    root.dataset.hideHome = String(settings.show_home === false);
    root.dataset.hideAbout = String(settings.show_about === false);
    root.dataset.hideProjects = String(settings.show_projects === false);
    root.dataset.hideContact = String(settings.show_contact === false);
    root.dataset.homepageMode = settings.homepage_mode || "portfolio";

    if (currentPage === "home" && settings.homepage_mode === "ott_only") {
      window.location.replace("ott-movies.html");
    }
  } catch (error) {
    console.error("Site settings init error:", error);
  }
})();
