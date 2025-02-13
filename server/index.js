import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();  // Load .env variables

console.log("DEBUG: Loaded OPENAI_API_KEY →", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");
console.log("DEBUG: Full Env Variables →", process.env);

console.log("Loaded API Key:", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");

// ✅ Create Express App
const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests

// ✅ Ensure OpenAI API Key Exists
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing! Add it to Railway's environment variables.");
  process.exit(1); // Stop the server
}

// ✅ POST Route for ChatGPT API
app.post("/api/chat", async (req, res) => {
  try {
    if (!req.body.prompt) {
      return res.status(400).json({ error: "Missing prompt in request body." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful workshop walrus, an expert in designing and facilitating workshops. "
              + "When given a workshop description, always return a structured list of activities. "
              + "Each activity must have a title and a short description. "
              + "Strictly follow this format with no extra text: "
              + '[{"title": "Activity Name", "description": "Brief Description"}]',
          },
          { role: "user", content: req.body.prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching OpenAI response:", error);
    res.status(500).json({ error: "Failed to fetch OpenAI response." });
  }
});

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// ✅ Add a GET Handler for /api/chat to Prevent Confusion
app.get("/api/chat", (req, res) => {
  res.status(400).json({ error: "This route only accepts POST requests. Please send a POST request with a JSON body." });
});

// ✅ Ensure Dynamic Port for Railway
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));