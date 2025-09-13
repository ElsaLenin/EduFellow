
// server.js

// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Replace with your actual Gemini API key
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY_HERE");

// In-memory reminders (can move to DB later)
let reminders = [];

// Test route
app.get("/", (req, res) => {
  res.send("✅ Gemini Server with Reminders is running!");
});

// Chat with Gemini
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ reply: "⚠️ No message received." });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(userMessage);
    const botReply = result.response.text();
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ reply: "⚠️ Error connecting to Gemini API." });
  }
});

// ➕ Add a reminder
app.post("/reminders", (req, res) => {
  const { title, time } = req.body;
  if (!title || !time) {
    return res.status(400).json({ message: "⚠️ Title and time are required." });
  }

  const reminder = { id: Date.now(), title, time: new Date(time), notified: false };
  reminders.push(reminder);

  res.json({ message: "✅ Reminder added!", reminder });
});

// 📋 Get all reminders
app.get("/reminders", (req, res) => {
  res.json(reminders);
});

// Background job: check every 30s
setInterval(() => {
  const now = new Date();
  reminders.forEach(rem => {
    if (!rem.notified && now >= rem.time) {
      console.log(`🔔 Reminder: ${rem.title}`);
      rem.notified = true;
    }
  });
}, 30000);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server with Reminders running on http://localhost:${PORT}`);
});
