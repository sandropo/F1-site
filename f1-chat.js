(function () {
  var GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
  var MODEL = "gemini-2.0-flash";
  var STORAGE_KEY = "parco-chiuso-f1-chat";
  var systemPrompt = "You are the official Formula 1 assistant for the blog 'Parco Chiuso.' Respond to users in an enthusiastic, clear, and concise manner (max 100 words per response) regarding F1 regulations, drivers, standings, history, and technical aspects.";

  function createWidget() {
    var root = document.querySelector("[data-f1-chat]");
    if (root) {
      return root;
    }

    root = document.createElement("div");
    root.className = "f1-chat";
    root.setAttribute("data-f1-chat", "");
    root.innerHTML = [
      '<button class="f1-chat-fab" type="button" aria-label="Apri F1 Assistant" aria-controls="f1-chat-window" aria-expanded="false">',
      '<img src="f1_logo.png" alt="" aria-hidden="true"><span class="f1-chat-fab-pulse" aria-hidden="true"></span></button>',
      '<section class="f1-chat-window" id="f1-chat-window" aria-label="F1 Assistant - Parco Chiuso" aria-hidden="true">',
      '<header class="f1-chat-header"><div class="f1-chat-heading"><span class="f1-chat-avatar" aria-hidden="true">F1</span>',
      '<div><h2>F1 Assistant - Parco Chiuso</h2><p><span class="f1-chat-online-dot" aria-hidden="true"></span> Online</p></div></div>',
      '<button class="f1-chat-close" type="button" aria-label="Chiudi F1 Assistant">×</button></header>',
      '<div class="f1-chat-messages" data-f1-chat-messages aria-live="polite" aria-label="Conversazione">',
      '<div class="f1-chat-message is-bot"><p>Ciao! Sono l\'assistente di Parco Chiuso. Chiedimi qualcosa sulla Formula 1.</p></div></div>',
      '<form class="f1-chat-form" data-f1-chat-form><label class="sr-only" for="f1-chat-input">Scrivi una domanda</label>',
      '<input id="f1-chat-input" type="text" name="message" maxlength="500" placeholder="Chiedi qualcosa sulla F1..." autocomplete="off" required>',
      '<button type="submit">Invia <span aria-hidden="true">→</span></button></form>',
      '<p class="f1-chat-disclaimer">Le risposte sono generate dall\'AI e possono contenere imprecisioni.</p></section>'
    ].join("");
    document.body.appendChild(root);
    return root;
  }

  function initialize() {
    var root = createWidget();
    var fab = root.querySelector(".f1-chat-fab");
    var windowElement = root.querySelector(".f1-chat-window");
    var closeButton = root.querySelector(".f1-chat-close");
    var messagesElement = root.querySelector("[data-f1-chat-messages]");
    var form = root.querySelector("[data-f1-chat-form]");
    var input = form.querySelector("input");
    var submitButton = form.querySelector("button");
    var conversation = [];

    function scrollToLatest() {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    function saveConversation() {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
      } catch (error) {
        console.warn("Chat history cannot be saved in this browser context.");
      }
    }

    function addMessage(text, type) {
      var message = document.createElement("div");
      var paragraph = document.createElement("p");
      message.className = "f1-chat-message is-" + type;
      paragraph.textContent = text;
      message.appendChild(paragraph);
      messagesElement.appendChild(message);
      scrollToLatest();
      return message;
    }

    function addLoadingMessage() {
      var message = document.createElement("div");
      message.className = "f1-chat-message is-bot is-loading";
      message.setAttribute("role", "status");
      message.innerHTML = "<span></span><span></span><span></span><strong>The assistant is writing...</strong>";
      messagesElement.appendChild(message);
      scrollToLatest();
      return message;
    }

    function renderStoredConversation() {
      var savedConversation;

      try {
        savedConversation = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
      } catch (error) {
        savedConversation = [];
      }

      if (!Array.isArray(savedConversation)) {
        return;
      }

      savedConversation.forEach(function (message) {
        if (message && (message.role === "user" || message.role === "model") && typeof message.text === "string") {
          conversation.push(message);
          addMessage(message.text, message.role === "user" ? "user" : "bot");
        }
      });
    }

    function setOpen(isOpen) {
      root.classList.toggle("is-open", isOpen);
      fab.setAttribute("aria-expanded", String(isOpen));
      windowElement.setAttribute("aria-hidden", String(!isOpen));
      if (isOpen) {
        input.focus();
        scrollToLatest();
      }
    }

    function setBusy(isBusy) {
      input.disabled = isBusy;
      submitButton.disabled = isBusy;
      submitButton.classList.toggle("is-loading", isBusy);
    }

    async function requestAnswer() {
      var response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent?key=" + encodeURIComponent(GEMINI_API_KEY),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: conversation.map(function (message) {
              return { role: message.role, parts: [{ text: message.text }] };
            }),
            generationConfig: { maxOutputTokens: 180, temperature: 0.7 }
          })
        }
      );

      if (!response.ok) {
        throw new Error("Gemini request failed with status " + response.status);
      }

      var data = await response.json();
      var answer = data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text;

      if (!answer) {
        throw new Error("Gemini returned no answer.");
      }

      return answer.trim();
    }

    fab.addEventListener("click", function () {
      setOpen(!root.classList.contains("is-open"));
    });

    closeButton.addEventListener("click", function () {
      setOpen(false);
    });

    form.addEventListener("submit", async function (event) {
      var userText;
      var loadingMessage;
      var answer;

      event.preventDefault();
      userText = input.value.trim();
      if (!userText || input.disabled) {
        return;
      }

      addMessage(userText, "user");
      conversation.push({ role: "user", text: userText });
      saveConversation();
      input.value = "";
      setBusy(true);
      loadingMessage = addLoadingMessage();

      try {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
          throw new Error("Gemini API key is not configured.");
        }
        answer = await requestAnswer();
        loadingMessage.remove();
        addMessage(answer, "bot");
        conversation.push({ role: "model", text: answer });
        saveConversation();
      } catch (error) {
        console.error("F1 Assistant error:", error);
        loadingMessage.remove();
        addMessage("Non riesco a rispondere in questo momento. Riprova tra poco.", "bot");
      } finally {
        setBusy(false);
        input.focus();
      }
    });

    renderStoredConversation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
