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

  function loadVoiceflowChat() {
    if (document.querySelector('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]')) {
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.type = "text/javascript";
    script.onload = function () {
      if (!window.voiceflow || !window.voiceflow.chat) {
        console.error("Voiceflow chat failed to initialize.");
        return;
      }

      window.voiceflow.chat.load({
        verify: { projectID: "6aecf3b261d33073a2b41079" },
        url: "https://general-runtime.voiceflow.com",
        voice: {
          url: "https://runtime-api.voiceflow.com"
        }
      });
      brandVoiceflowLauncher();
    };
    document.head.appendChild(script);
  }

  function brandVoiceflowLauncher() {
    var attempts = 0;
    var maxAttempts = 40;
    var observer;

    function applyBranding() {
      var shadowRoot = window.voiceflow &&
        window.voiceflow.chat &&
        window.voiceflow.chat._shadowRoot;
      var launcher;
      var image;
      var style;

      if (!shadowRoot) {
        return false;
      }

      launcher = shadowRoot.querySelector(".vfrc-launcher");
      image = shadowRoot.querySelector(".vfrc-launcher--media img");
      if (!launcher || !image) {
        return false;
      }

      image.src = new URL("f1_logo.png", document.baseURI).href;
      image.alt = "Parco Chiuso";
      launcher.setAttribute("aria-label", "Apri F1 Assistant - Parco Chiuso");
      launcher.title = "F1 Assistant - Parco Chiuso";

      if (!shadowRoot.querySelector("#parco-chiuso-voiceflow-style")) {
        style = document.createElement("style");
        style.id = "parco-chiuso-voiceflow-style";
        style.textContent = [
          ":host, :host *, .vfrc-widget, .vfrc-widget * { font-family: 'Inter', Arial, Helvetica, sans-serif !important; }",
          ":host h1, :host h2, :host h3, :host h4, :host h5, :host h6, :host [role='heading'], .vfrc-header--title, .vfrc-assistant-info--title, .vfrc-widget h1, .vfrc-widget h2, .vfrc-widget h3, .vfrc-widget h4, .vfrc-widget h5, .vfrc-widget h6, .vfrc-widget [role='heading'] { font-family: 'Barlow Condensed', 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif !important; }",
          ":host input, :host textarea, :host button, .vfrc-widget input, .vfrc-widget textarea, .vfrc-widget button { font-family: 'Inter', Arial, Helvetica, sans-serif !important; }",
          ".vfrc-launcher__container { right: 24px !important; bottom: 24px !important; }",
          ".vfrc-launcher { width: 60px !important; height: 60px !important; min-width: 60px !important; padding: 8px !important; border: 2px solid #e10600 !important; border-radius: 50% !important; background: #17191e !important; box-shadow: 0 10px 28px rgba(0,0,0,.35), 0 0 0 5px rgba(225,6,0,.12) !important; transition: transform .25s ease, box-shadow .25s ease !important; }",
          ".vfrc-launcher:hover, .vfrc-launcher:focus-visible { transform: translateY(-3px) scale(1.04) !important; box-shadow: 0 14px 32px rgba(0,0,0,.45), 0 0 0 7px rgba(225,6,0,.16) !important; }",
          ".vfrc-launcher--media { width: 35px !important; height: 35px !important; margin: 0 !important; border-radius: 50% !important; overflow: hidden !important; background: #17191e !important; }",
          ".vfrc-launcher--media img { width: 35px !important; height: 35px !important; object-fit: contain !important; }",
          ".vfrc-launcher__label { display: none !important; }",
          "@media (max-width: 480px) { .vfrc-launcher__container { right: 14px !important; bottom: 14px !important; } }"
        ].join("");
        shadowRoot.appendChild(style);
      }

      return true;
    }

    function tryBranding() {
      attempts += 1;
      if (applyBranding() || attempts >= maxAttempts) {
        if (observer) {
          observer.disconnect();
        }
        return;
      }
      window.setTimeout(tryBranding, 250);
    }

    observer = new MutationObserver(function () {
      if (applyBranding()) {
        observer.disconnect();
      }
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    tryBranding();
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

  loadVoiceflowChat();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      addThemeSwitch();
      addNavigationToggle();
      highlightCurrentNavigationLink();
      loadVoiceflowChat();
    }, { once: true });
  } else {
    addThemeSwitch();
    addNavigationToggle();
    highlightCurrentNavigationLink();
    loadVoiceflowChat();
  }
})();
