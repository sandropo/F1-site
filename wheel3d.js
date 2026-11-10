const viewer = document.querySelector("#steering-wheel-viewer");

if (viewer) {
  const section = viewer.closest(".wheel-section");
  const viewerWrap = viewer.closest(".wheel-viewer-wrap");
  const fallback = viewerWrap.querySelector(".wheel-fallback");
  const details = {
    index: section.querySelector(".wheel-detail-index"),
    title: section.querySelector(".wheel-detail-title"),
    function: section.querySelector(".wheel-detail-function"),
    example: section.querySelector(".wheel-detail-example")
  };
  const hotspots = [...viewer.querySelectorAll(".wheel-hotspot")];
  const controls = [...section.querySelectorAll("[data-wheel-control]")];
  const resetButton = section.querySelector("[data-wheel-reset]");
  const initialCameraOrbit = viewer.getAttribute("camera-orbit");
  const initialCameraTarget = viewer.getAttribute("camera-target");
  let selectedHotspot = null;
  let fallbackTimer;

  function showDetails(hotspot) {
    const number = hotspot.querySelector(".wheel-hotspot-dot").textContent;
    details.index.textContent = `COMANDO ${number} · VOLANTE`;
    details.title.textContent = hotspot.dataset.title;
    details.function.textContent = hotspot.dataset.function;
    details.example.textContent = hotspot.dataset.example;
    selectedHotspot = hotspot;

    controls.forEach((control) => {
      control.setAttribute(
        "aria-pressed",
        String(control.dataset.wheelControl === hotspot.slot.replace("hotspot-", ""))
      );
    });
  }

  function focusCamera(hotspot) {
    viewer.removeAttribute("auto-rotate");
    viewer.interpolationDecay = 120;
    viewer.setAttribute("camera-target", hotspot.dataset.position);
    viewer.setAttribute("camera-orbit", hotspot.dataset.orbit);
  }

  function selectHotspot(hotspot, focus = false) {
    showDetails(hotspot);
    hotspots.forEach((item) => {
      item.setAttribute(
        "aria-expanded",
        String(item === hotspot && (focus || item.matches(":hover")))
      );
    });
    if (focus) focusCamera(hotspot);
  }

  function closeTooltips() {
    hotspots.forEach((hotspot) => hotspot.setAttribute("aria-expanded", "false"));
  }

  function resetView() {
    closeTooltips();
    viewer.setAttribute("camera-target", initialCameraTarget);
    viewer.setAttribute("camera-orbit", initialCameraOrbit);
    viewer.setAttribute("auto-rotate", "");
    selectedHotspot = null;
    controls.forEach((control) => control.setAttribute("aria-pressed", "false"));
    details.index.textContent = "SELEZIONA UN COMANDO";
    details.title.textContent = "La strategia, sotto i pollici.";
    details.function.textContent =
      "Seleziona un hotspot per scoprire a cosa serve ogni comando durante un Gran Premio.";
    details.example.textContent =
      "Fai clic su un marker per inquadrare il comando sul modello.";
  }

  function showFallback() {
    clearTimeout(fallbackTimer);
    viewerWrap.classList.add("is-fallback");
    fallback.hidden = false;
    hotspots.forEach((hotspot) => {
      hotspot.hidden = true;
      hotspot.setAttribute("aria-expanded", "false");
    });
    viewer.setAttribute("aria-hidden", "true");
  }

  hotspots.forEach((hotspot) => {
    hotspot.addEventListener("pointerenter", () => selectHotspot(hotspot));
    hotspot.addEventListener("pointerleave", () => {
      if (document.activeElement !== hotspot) {
        hotspot.setAttribute("aria-expanded", "false");
      }
    });
    hotspot.addEventListener("focus", () => selectHotspot(hotspot));
    hotspot.addEventListener("click", () => selectHotspot(hotspot, true));
  });

  controls.forEach((control) => {
    control.setAttribute("aria-pressed", "false");
    control.addEventListener("click", () => {
      const hotspot = hotspots.find(
        (item) => item.slot === `hotspot-${control.dataset.wheelControl}`
      );
      if (hotspot && !hotspot.hidden) selectHotspot(hotspot, true);
      else if (hotspot) showDetails(hotspot);
    });
  });

  resetButton.addEventListener("click", resetView);

  document.addEventListener("pointerdown", (event) => {
    if (!viewer.contains(event.target) && !event.target.closest("[data-wheel-control]")) {
      closeTooltips();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const focusedHotspot = selectedHotspot;
    closeTooltips();
    focusedHotspot?.focus();
  });

  viewer.addEventListener("load", () => {
    clearTimeout(fallbackTimer);
    fallback.hidden = true;
    viewerWrap.classList.remove("is-fallback");
    viewer.removeAttribute("aria-hidden");
    hotspots.forEach((hotspot) => {
      hotspot.hidden = false;
    });
  });
  viewer.addEventListener("error", showFallback);

  function startFallbackTimer() {
    clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => {
      if (!viewer.loaded) showFallback();
    }, 20000);
  }

  if (customElements.get("model-viewer")) {
    startFallbackTimer();
  } else if (window.customElements && window.customElements.whenDefined) {
    customElements.whenDefined("model-viewer").then(() => {
      startFallbackTimer();
    }).catch(showFallback);
  } else {
    startFallbackTimer();
  }
}
