import { useState } from "react";
import { fetchChatResponse } from './api';
import { motion } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, title, description }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab"  // Keep cursor behavior if you like
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="activityCard"
    >
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

function App() {
  const [prompt, setPrompt] = useState("I'd like to run a 2 hour workshop for the members of Kobra Kai to imagine a karate friendly future. When creating activities, please reference the openly available work and methodologies of Ideo, the Institute of the Future, and Studio D.");
  const [response, setResponse] = useState("");
  const [introText, setIntroText] = useState("");
  const [workshopActivities, setWorkshopActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setWorkshopActivities([]);

    try {
      const data = await fetchChatResponse(prompt);
      console.log("Raw API response:", data);

      let rawContent = data.choices?.[0]?.message?.content || "[]";
      console.log("Raw content from AI:", rawContent);

      if (rawContent.trim().startsWith("{") || rawContent.trim().startsWith("[")) {
        try {
          const activities = JSON.parse(rawContent);
          const enriched = activities.map((a, index) => ({ ...a, id: `activity-${index}` }));
          setWorkshopActivities(enriched);
        } catch (error) {
          console.error("Error parsing structured response:", error);
          setWorkshopActivities([{ id: "error", title: "Error", description: "Could not load activities." }]);
        }
      } else {
        setIntroText(rawContent);
      }

    } catch (error) {
      console.error("Error parsing response:", error);
      setWorkshopActivities([{ id: "error", title: "Error", description: "could not load activities." }]);
    }
    setLoading(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = workshopActivities.findIndex(a => a.id === active.id);
      const newIndex = workshopActivities.findIndex(a => a.id === over?.id);
      setWorkshopActivities(arrayMove(workshopActivities, oldIndex, newIndex));
    }
  };

  const copyToClipboard = async () => {
    try {
      const text = workshopActivities.map(a => `${a.title}: ${a.description}`).join("\n\n");
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard! ✅");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

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
    <div className="container">
      <h1>Workshop Walrus 1.0</h1>
      <h2>Oh hello there ya billowin’ butterbean. Won't ya describe the type of workshop you'd like to build?</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              handleSubmit(e);
            }
          }}
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            fontSize: "16px",
            fontFamily: "Inter, sans-serif",
            resize: "vertical",
            borderRadius: "6px",
            border: "1px solid #444",
            backgroundColor: "#13121D",
            color: "#fff",
            boxSizing: "border-box",
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6, ease: "easeOut" }}
        >
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            WORKSHOP ACTIVITIES
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={copyToClipboard}>📋 Copy</button>
              <button onClick={downloadCSV}>📂 Download CSV</button>
            </div>
          </h3>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={workshopActivities.map(a => a.id)} strategy={verticalListSortingStrategy}>
              {workshopActivities.map((activity) => (
                <SortableItem
                  key={activity.id}
                  id={activity.id}
                  title={activity.title}
                  description={activity.description}
                />
              ))}
            </SortableContext>
          </DndContext>
        </motion.div>
      )}
    </div>
  );
}

export default App;