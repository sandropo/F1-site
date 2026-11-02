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

  document.documentElement.dataset.theme = storedTheme === "light" ? "light" : "dark";

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addThemeSwitch, { once: true });
  } else {
    addThemeSwitch();
  }
})();
