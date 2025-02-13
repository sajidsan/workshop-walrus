import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
console.log("Loaded API Key:", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No"); //test that the API key is loaded


const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests

app.post("/api/chat", async (req, res) => {
  try {
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
          { role: "user", content: req.body.prompt }],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching OpenAI response:", error);
    res.status(500).json({ error: "Failed to fetch OpenAI response" });
  }
});

// ✅ Add this test route to verify the server is working
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

app.listen(3001, () => console.log("✅ Server running on http://localhost:3001"));