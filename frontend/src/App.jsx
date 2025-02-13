import { useState } from "react";
import { fetchChatResponse } from './api';

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [introText, setIntroText] = useState("");
  const [workshopActivities, setWorkshopActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setWorkshopActivities([]); // Clear previous response

    try {
      const data = await fetchChatResponse(prompt);
      console.log("Raw API response:", data); //debug

      //Extract JSON response safely
      let rawContent = data.choices?.[0]?.message?.content || "[]";
      console.log("Raw content from AI:", rawContent); //debug
      


      if (rawContent.trim().startsWith("{") || rawContent.trim().startsWith("[")) {
        try {
          const activities = JSON.parse(rawContent); // ✅ Safely parse JSON
          setWorkshopActivities(activities);
        } catch (error) {
          console.error("Error parsing structured response:", error);
          setWorkshopActivities([{ title: "Error", description: "Could not load activities." }]);
        }
      } else {
        // ✅ If response is not JSON, store it as plain text
        setIntroText(rawContent);
      }

    } catch (error) {
      console.error("Error parsing response:", error);
      setWorkshopActivities([{
        title: "Error",
        description: "could not load activities.",
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>Workshop Walrus 1.0</h1>
      <h2>Oh hello there ya blubberin' bumble but. Won't ya describe the type of workshop you'd like to build?</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your message..."
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px"}}>
          {loading ? "Loading..." : "Send"}
        </button>
      </form>
        
      {introText && (
  <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd" }}>
    <strong>ChatGPT Response:</strong>
    <p>{introText}</p>
  </div>
)}

{workshopActivities.length > 0 && (
  <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
    <strong>Workshop Activities:</strong>
    {workshopActivities.map((activity, index) => (
      <div key={index} style={{ border: "1px solid #ddd", padding: "10px", margin: "10px", borderRadius: "5px" }}>
        <h3>{activity.title}</h3>
        <p>{activity.description}</p>
      </div>
    ))}
  </div>
)}
    </div>
  
  )
}

export default App
