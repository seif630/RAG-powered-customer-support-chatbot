const form = document.getElementById("chat-form");
const chatWindow = document.getElementById("chat-window");
const input = document.getElementById("message-input");
const statusPill = document.getElementById("status-pill");
const thresholdInput = document.getElementById("threshold-input");
const thresholdValue = document.getElementById("threshold-value");

let lastIntent = null;

function addMessage(content, role, meta = "") {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  article.innerHTML = `<p>${content}</p>${meta ? `<small>${meta}</small>` : ""}`;
  chatWindow.appendChild(article);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

thresholdInput.addEventListener("input", () => {
  thresholdValue.textContent = Number(thresholdInput.value).toFixed(2);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  statusPill.textContent = "Thinking...";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        threshold: Number(thresholdInput.value),
        last_intent: lastIntent
      }),
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    const data = await res.json();
    
    if (data.matched_intent && data.matched_intent !== "unknown") {
      lastIntent = data.matched_intent;
    }

    const meta = data.matched_intent
      ? `intent: ${data.matched_intent} • score: ${data.score}`
      : `score: ${data.score}`;

    addMessage(data.answer, "bot", meta);
    statusPill.textContent = "Ready";
  } catch (err) {
    addMessage("Something went wrong. Please try again.", "bot");
    statusPill.textContent = "Error";
  }
});
