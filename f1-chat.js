(function () {
  var GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
  var MODEL = "gemini-2.0-flash";
  var STORAGE_KEY = "parco-chiuso-f1-chat";
  var systemPrompt = "You are the official Formula 1 assistant for the blog 'Parco Chiuso.' Respond to users in an enthusiastic, clear, and concise manner (max 100 words per response) regarding F1 regulations, drivers, standings, history, and technical aspects.";
  var root = document.querySelector("[data-f1-chat]");

  if (!root) {
    return;
  }

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
})();
