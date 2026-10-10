const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

// Check whether AXIOM's backend is running.
app.get("/api/health", (req, res) => {
res.json({
ok: true,
name: "AXIOM",
message: "AXIOM backend is running!"
});
});

// Connect AXIOM to its AI.
app.post("/api/chat", async (req, res) => {
try {
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  return res.status(503).json({
    error: "AI is not connected yet. Configure the API key in Render."
  });
}

const message = req.body?.message;

if (typeof message !== "string" || !message.trim()) {
  return res.status(400).json({
    error: "Please enter a message."
  });
}

if (message.length > 8000) {
  return res.status(413).json({
    error: "Please shorten your message."
  });
}

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey });

const result = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: message
});

res.json({
  reply: result.text || "I couldn't generate a response."
});

} catch (error) {
console.error("AXIOM AI error:", error.message);

res.status(500).json({
  error: "The AI request failed. Check the backend logs."
});

}
});

app.listen(PORT, "0.0.0.0", () => {
console.log("AXIOM is running on port ${PORT}");
});
