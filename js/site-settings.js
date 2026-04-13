(function () {
  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    return;
  }

  const STORAGE_KEY = "siteSettingsCache";
  const SETTINGS_TABLE_NAME = "site_settings";
  const SETTINGS_ROW_ID = 1;
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

  const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  function setLinkVisibility(href, isVisible) {
    document.querySelectorAll(`a[href="${href}"]`).forEach((link) => {
      const item = link.closest("li") || link;
      item.hidden = !isVisible;
    });
  }

  function setElementVisibility(selector, isVisible) {
    document.querySelectorAll(selector).forEach((element) => {
      element.hidden = !isVisible;
    });
  }

  function applyVisibility(settings) {
    const root = document.documentElement;
    const showHome = settings.show_home !== false;
    const showAbout = settings.show_about !== false;
    const showProjects = settings.show_projects !== false;
    const showContact = settings.show_contact !== false;

    root.dataset.hideHome = String(!showHome);
    root.dataset.hideAbout = String(!showAbout);
    root.dataset.hideProjects = String(!showProjects);
    root.dataset.hideContact = String(!showContact);

    setLinkVisibility("index.html", showHome);
    setLinkVisibility("about.html", showAbout);
    setLinkVisibility("projects.html", showProjects);
    setLinkVisibility("contact.html", showContact);

    if (currentPage === "home") {
      setElementVisibility("#about", showAbout);
      setElementVisibility("#projects", showProjects);
      setElementVisibility("#contact", showContact);
    }
  }

  function applyHomepageMode(settings) {
    const homepageMode = settings.homepage_mode || "portfolio";
    document.documentElement.dataset.homepageMode = homepageMode;

    if (currentPage === "home" && homepageMode === "ott_only") {
      window.location.replace("ott-movies.html");
    }
  }

  async function loadSiteSettings() {
    const { data, error } = await supabaseClient
      .from(SETTINGS_TABLE_NAME)
      .select("*")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("Site settings load error:", error);
      }
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (storageError) {
      console.error("Site settings cache error:", storageError);
    }

    applyVisibility(data);
    applyHomepageMode(data);
  }

  loadSiteSettings();
})();
