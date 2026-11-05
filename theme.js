(function () {
  var storageKey = "f1-site-theme";
  var storedTheme;

  try {
    storedTheme = window.localStorage.getItem(storageKey);
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") {
      throw error;
    }
    console.warn("Theme preference cannot be saved in this browser context.");
  }

  var defaultTheme = new Date().getHours() >= 18 ? "dark" : "light";
  document.documentElement.dataset.theme =
    storedTheme === "light" || storedTheme === "dark" ? storedTheme : defaultTheme;

  function addThemeSwitch() {
    var header = document.querySelector("header");
    if (!header) {
      console.error("Unable to add the theme switch: page header not found.");
      return;
    }

    var button = document.createElement("button");
    var label = document.createElement("span");
    var track = document.createElement("span");
    button.className = "theme-switch";
    button.type = "button";
    button.setAttribute("role", "switch");
    button.setAttribute("aria-label", "Dark mode");
    label.textContent = "Dark mode";
    track.className = "theme-switch-track";
    track.setAttribute("aria-hidden", "true");
    button.append(label, track);

    function updateSwitch(theme) {
      document.documentElement.dataset.theme = theme;
      button.setAttribute("aria-checked", String(theme === "dark"));
    }

    updateSwitch(document.documentElement.dataset.theme);
    button.addEventListener("click", function () {
      var theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      updateSwitch(theme);
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "SecurityError") {
          throw error;
        }
        console.warn("Theme preference cannot be saved in this browser context.");
      }
    });

    header.appendChild(button);
  }

  function addNavigationToggle() {
    var menu = document.querySelector("menu");
    if (!menu) {
      return;
    }

    var navigation = menu.querySelector("ul");
    if (!navigation) {
      console.error("Unable to add the navigation toggle: navigation list not found.");
      return;
    }

    if (!navigation.id) {
      navigation.id = "primary-navigation";
    }

    var button = menu.querySelector(".menu-toggle");
    if (!button) {
      button = document.createElement("button");
      button.className = "menu-toggle";
      button.type = "button";
      button.setAttribute("aria-label", "Menu di navigazione");
      button.append(
        document.createElement("span"),
        document.createElement("span"),
        document.createElement("span")
      );
      button.querySelectorAll("span").forEach(function (line) {
        line.setAttribute("aria-hidden", "true");
      });
      menu.insertBefore(button, navigation);
    }

    button.setAttribute("aria-controls", navigation.id);
    button.setAttribute("aria-expanded", "false");
    menu.classList.add("is-collapsible");
    button.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function loadChatWidget() {
    if (document.querySelector('script[src="f1-chat.js"]')) {
      return;
    }

    var script = document.createElement("script");
    script.src = "f1-chat.js";
    document.head.appendChild(script);
  }

  function highlightCurrentNavigationLink() {
    var menu = document.querySelector("menu");
    if (!menu) {
      return;
    }

    var currentPath = decodeURIComponent(window.location.pathname).toLowerCase();
    var links = menu.querySelectorAll("a[href]");
    var currentLink = null;

    links.forEach(function (link) {
      var linkPath = decodeURIComponent(new URL(link.href, window.location.href).pathname).toLowerCase();
      if (linkPath === currentPath) {
        currentLink = link;
      }
    });

    if (!currentLink && /(?:stagione-\d{4}|stagioni passate)\.html$/i.test(currentPath)) {
      links.forEach(function (link) {
        if (decodeURIComponent(new URL(link.href, window.location.href).pathname).toLowerCase().endsWith("/ultime stagioni.html")) {
          currentLink = link;
        }
      });
    }

    if (currentLink) {
      var button = currentLink.closest("button");
      if (button) {
        button.classList.add("active");
      }
      currentLink.setAttribute("aria-current", "page");
    }
  }

  loadChatWidget();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      addThemeSwitch();
      addNavigationToggle();
      highlightCurrentNavigationLink();
      loadChatWidget();
    }, { once: true });
  } else {
    addThemeSwitch();
    addNavigationToggle();
    highlightCurrentNavigationLink();
    loadChatWidget();
  }
})();
