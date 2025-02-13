export const fetchChatResponse = async (prompt) => {
    try {
        const response = await fetch("http://localhost:3001/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });
        
        if (!response.ok) {
            throw new Error('HTTP error. Status: ${response.status}')
        }

        const data = await response.json();
        console.log("Frontend received data:", data);
        return data;  
    } catch (error) {
        console.error("Error fetching chat response:", error);
        return { choices: [{ message: { content: "Error fetching response" } }] }; // Fallback error
    }
};