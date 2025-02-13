import { useState } from "react";
import { fetchChatResponse } from './api';
import { motion } from "framer-motion";

function App() {
  const [prompt, setPrompt] = useState("I'd like to run a 2 hour workshop for 5 people to imagine a walrus friendly future loosely based on the methodologies of Jan Chipchase and Studio D.");
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


  // 🟢 Function to Copy Activities to Clipboard
  const copyToClipboard = async () => {
    try {
      const text = workshopActivities.map(a => `${a.title}: ${a.description}`).join("\n\n");
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard! ✅");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // 🟢 Function to Download CSV
  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      workshopActivities.map(a => `"${a.title}","${a.description}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "workshop_activities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" >
      
      <h1>Workshop Walrus 1.0</h1>
      <h2>Oh hello there ya blubberin' bumble butt. Won't ya describe the type of workshop you'd like to build?</h2>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              handleSubmit(e); // Call form submission
            }
          }}
          style={{
            width: "100%", // Ensures it spans the container
    minHeight: "120px", // Keeps it larger
    padding: "12px",
    fontSize: "16px",
    fontFamily: "Inter, sans-serif", // Ensures consistent styling
    resize: "vertical", // Allows resizing but keeps default size
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#13121D",
    color: "#fff", // Makes text readable
    boxSizing: "border-box", // Prevents size issues
    }}
/>
        
        <button type="submit" disabled={loading}>
          
            {loading ? "Loading..." : "Cmd + Enter"}
          
        </button>
      </form>
        
          {introText && (
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd" }}>
        <strong>Notes:</strong>
        <p>{introText}</p>
      </div>
    )}

      {workshopActivities.length > 0 && (
        <motion.div 
          className="activityContainer"
          initial={{ opacity: 0, y: 20 }} // Start invisible and slightly lower
          animate={{ opacity: 1, y: 0 }} // Animate to full visibility and move up
          transition={{ duration: .6, ease: "easeOut" }} // Smooth transition
          
        >
      
      <h3 style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        WORKSHOP ACTIVITIES
        <div style={{ display: "flex", gap: "8px" }}>
         <button onClick={copyToClipboard}>📋 Copy</button>
         <button onClick={downloadCSV}>📂 Download CSV</button>
        </div>
      </h3>
            {workshopActivities.map((activity, index) => (
              <motion.div 
                key={index}
                className="activityCard-wrapper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: .3 + index * 0.1 }} // Staggered effect
                
                >

                <div className="activityCard" key={index}>
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                </div>
              </motion.div>
            ))}
        
        </motion.div>
      )}
    </div>
  
  )
}

export default App
