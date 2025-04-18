const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const fetchChatResponse = async (prompt) => {
    const response = await fetch(`${API_BASE_URL}/api/chat`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }

    return response.json();
};