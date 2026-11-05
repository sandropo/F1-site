(function () {
  var races = [
    { name: "Australia", shortName: "GP d'Australia", fp1: "2026-03-06T02:30:00Z", weekendStart: "2026-03-06T00:00:00Z", end: "2026-03-08T23:59:59Z" },
    { name: "Cina", shortName: "GP di Cina", fp1: "2026-03-13T03:30:00Z", weekendStart: "2026-03-13T00:00:00Z", end: "2026-03-15T23:59:59Z" },
    { name: "Giappone", shortName: "GP del Giappone", fp1: "2026-03-27T02:30:00Z", weekendStart: "2026-03-27T00:00:00Z", end: "2026-03-29T23:59:59Z" },
    { name: "Miami", shortName: "GP di Miami", fp1: "2026-05-01T16:30:00Z", weekendStart: "2026-05-01T00:00:00Z", end: "2026-05-03T23:59:59Z" },
    { name: "Canada", shortName: "GP del Canada", fp1: "2026-05-22T16:30:00Z", weekendStart: "2026-05-22T00:00:00Z", end: "2026-05-24T23:59:59Z" },
    { name: "Monaco", shortName: "GP di Monaco", fp1: "2026-06-05T11:30:00Z", weekendStart: "2026-06-05T00:00:00Z", end: "2026-06-07T23:59:59Z" },
    { name: "Barcellona-Catalogna", shortName: "GP di Barcellona-Catalogna", fp1: "2026-06-12T11:30:00Z", weekendStart: "2026-06-12T00:00:00Z", end: "2026-06-14T23:59:59Z" },
    { name: "Austria", shortName: "GP d'Austria", fp1: "2026-06-26T11:30:00Z", weekendStart: "2026-06-26T00:00:00Z", end: "2026-06-28T23:59:59Z" },
    { name: "Gran Bretagna", shortName: "GP di Gran Bretagna", fp1: "2026-07-03T11:30:00Z", weekendStart: "2026-07-03T00:00:00Z", end: "2026-07-05T23:59:59Z" },
    { name: "Belgio", shortName: "GP del Belgio", fp1: "2026-07-17T11:30:00Z", weekendStart: "2026-07-17T00:00:00Z", end: "2026-07-19T23:59:59Z" },
    { name: "Ungheria", shortName: "GP d'Ungheria", fp1: "2026-07-24T11:30:00Z", weekendStart: "2026-07-24T00:00:00Z", end: "2026-07-26T23:59:59Z" },
    { name: "Paesi Bassi", shortName: "GP dei Paesi Bassi", fp1: "2026-08-21T10:30:00Z", weekendStart: "2026-08-21T00:00:00Z", end: "2026-08-23T23:59:59Z" },
    { name: "Italia", shortName: "GP d'Italia", fp1: "2026-09-04T10:30:00Z", weekendStart: "2026-09-04T00:00:00Z", end: "2026-09-06T23:59:59Z" },
    { name: "Madrid", shortName: "GP di Madrid", fp1: "2026-09-11T11:30:00Z", weekendStart: "2026-09-11T00:00:00Z", end: "2026-09-13T23:59:59Z" },
    { name: "Azerbaijan", shortName: "GP dell'Azerbaijan", fp1: "2026-09-25T08:30:00Z", weekendStart: "2026-09-24T00:00:00Z", end: "2026-09-26T23:59:59Z" },
    { name: "Bahrain", shortName: "GP del Bahrain", fp1: "2026-10-02T11:30:00Z", weekendStart: "2026-10-02T00:00:00Z", end: "2026-10-04T23:59:59Z" },
    { name: "Singapore", shortName: "GP di Singapore", fp1: "2026-10-09T09:30:00Z", weekendStart: "2026-10-09T00:00:00Z", end: "2026-10-11T23:59:59Z" },
    { name: "Stati Uniti", shortName: "GP degli Stati Uniti", fp1: "2026-10-23T17:30:00Z", weekendStart: "2026-10-23T00:00:00Z", end: "2026-10-25T23:59:59Z" },
    { name: "Messico", shortName: "GP del Messico", fp1: "2026-10-30T18:30:00Z", weekendStart: "2026-10-30T00:00:00Z", end: "2026-11-01T23:59:59Z" },
    { name: "San Paolo", shortName: "GP di San Paolo", fp1: "2026-11-06T15:30:00Z", weekendStart: "2026-11-06T00:00:00Z", end: "2026-11-08T23:59:59Z" },
    { name: "Las Vegas", shortName: "GP di Las Vegas", fp1: "2026-11-21T00:30:00Z", weekendStart: "2026-11-20T00:00:00Z", end: "2026-11-22T23:59:59Z" },
    { name: "Qatar", shortName: "GP del Qatar", fp1: "2026-11-27T13:30:00Z", weekendStart: "2026-11-27T00:00:00Z", end: "2026-11-29T23:59:59Z" },
    { name: "Abu Dhabi", shortName: "GP di Abu Dhabi", fp1: "2026-12-04T09:30:00Z", weekendStart: "2026-12-04T00:00:00Z", end: "2026-12-06T23:59:59Z" }
  ];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function update() {
    var now = new Date();
    var activeRace = races.find(function (race) {
      return now >= new Date(race.fp1) && now <= new Date(race.end);
    });
    var nextRace = races.find(function (race) {
      return now < new Date(race.fp1);
    });
    var state = activeRace ? "live" : nextRace ? "upcoming" : "complete";
    var race = activeRace || nextRace || races[races.length - 1];
    var countdown = document.querySelector("[data-f1-countdown]");
    var status = document.querySelector("[data-f1-race-status]");
    var raceName = document.querySelectorAll("[data-f1-race-name]");
    var dateLabel = document.querySelector("[data-f1-race-date]");
    var tickerState = document.querySelector("[data-f1-ticker-state]");
    var tickerName = document.querySelector("[data-f1-ticker-name]");

    raceName.forEach(function (element) {
      element.textContent = race.shortName;
    });
    if (dateLabel) {
      dateLabel.textContent = activeRace
        ? "Weekend in corso"
        : nextRace
          ? "FP1: " + new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(nextRace.fp1))
          : "Stagione 2026 conclusa";
    }

    if (tickerState) {
      tickerState.textContent = state === "live" ? "● WEEKEND DI GARA" : state === "upcoming" ? "PROSSIMO APPUNTAMENTO" : "STAGIONE CONCLUSA";
      tickerState.classList.toggle("is-live", state === "live");
    }
    if (tickerName) {
      tickerName.textContent = race.shortName;
    }
    if (status) {
      status.textContent = state === "live"
        ? "Weekend di gara in corso"
        : state === "upcoming"
          ? "Countdown alla prima sessione di prove libere"
          : "La stagione 2026 è terminata";
      status.classList.toggle("is-live", state === "live");
    }
    if (!countdown) {
      return;
    }
    countdown.classList.toggle("is-live", state === "live");
    if (state === "live") {
      countdown.textContent = "IN CORSO";
      return;
    }
    if (state === "complete") {
      countdown.textContent = "FINE STAGIONE";
      return;
    }

    var remaining = Math.max(0, new Date(nextRace.fp1).getTime() - now.getTime());
    var totalSeconds = Math.floor(remaining / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    countdown.innerHTML = "<div><strong>" + pad(days) + "</strong><span>GIORNI</span></div>" +
      "<div><strong>" + pad(hours) + "</strong><span>ORE</span></div>" +
      "<div><strong>" + pad(minutes) + "</strong><span>MIN</span></div>" +
      "<div><strong>" + pad(seconds) + "</strong><span>SEC</span></div>";
  }

  function start() {
    update();
    window.setInterval(update, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
