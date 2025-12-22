import React, { useState, useRef, useEffect } from 'react';

// IMPORTANT: Replace the empty string below with your actual Gemini API Key 
// if you are running this locally without an automated environment injection system.
const API_KEY =  "AIzaSyCbY-eIjTL8BP1Fe7lM0VJCmltprUYxfy0"
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

// Define the system instruction to set the persona
// *** MODIFIED: Removed the instruction to use LaTeX syntax ***
const SYSTEM_INSTRUCTION = "You are AgroBot, an expert AI assistant specializing in smart farming, agronomy, crop recommendations, pest management, and nutrient advice. You provide concise, practical, and helpful advice to farmers. Use standard text and unicode symbols (like °C or pH) for scientific terms.";

const Chatbot = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial check for API Key status
    useEffect(() => {
        if (!API_KEY) {
            console.warn("AGROBOT WARNING: API_KEY is missing. Please ensure your Gemini API Key is set in frontend/src/components/Chatbot.jsx or injected via environment variables for the chatbot to work.");
        }
    }, []);

    // Scroll to the bottom whenever chat history updates
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatHistory]);

    // Function to handle the API call to Gemini
    const sendMessage = async (userQuery) => {
        if (!userQuery.trim()) return;
        
        // Check API Key immediately before sending
        if (!API_KEY) {
            setChatHistory(prev => [...prev, { role: "bot", text: "Error: The AI key is not configured. Please check the code for API_KEY placeholder." }]);
            return;
        }


        // 1. Add user message to history
        const newUserMessage = { role: "user", text: userQuery };
        setChatHistory(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        // 2. Prepare the payload for the Gemini API
        const payload = {
            contents: [{ role: "user", parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            // Enable Google Search grounding for up-to-date farming information
            tools: [{ "google_search": {} }],
        };
        
        let responseText = "Sorry, I encountered an error communicating with the AI model. Check the console for details.";

        try {
            // Implement Exponential Backoff for robust fetching
            for (let attempt = 0; attempt < 3; attempt++) {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    const candidate = result.candidates?.[0];
                    responseText = candidate?.content?.parts?.[0]?.text || "No response received.";
                    
                    // Extract Grounding Sources (Citations)
                    let sources = [];
                    const groundingMetadata = candidate?.groundingMetadata;
                    if (groundingMetadata && groundingMetadata.groundingAttributions) {
                        sources = groundingMetadata.groundingAttributions
                            .map(attr => ({ 
                                uri: attr.web?.uri, 
                                title: attr.web?.title 
                            }))
                            .filter(source => source.uri && source.title);
                    }
                    
                    // Format response text with citations
                    if (sources.length > 0) {
                        const citationText = sources.map((s, index) => 
                            `[^${index + 1}: ${s.title}](${s.uri})`
                        ).join(' ');
                        responseText += `\n\n**Sources:** ${citationText}`;
                    }
                    
                    break; // Exit loop on success
                } else if (response.status === 429 && attempt < 2) {
                    // Handle rate limiting with exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    console.warn(`Rate limit exceeded. Retrying in ${delay / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw new Error(`API returned status ${response.status} (${response.statusText})`);
                }
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            // ResponseText remains the default error message
        } finally {
            setIsLoading(false);
            // 3. Add bot message to history
            setChatHistory(prev => [...prev, { role: "bot", text: responseText }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            sendMessage(input);
        }
    };
    
    // --- CORRECTED RENDERING LOGIC (No LaTeX Parsing) ---
    const renderMessage = (text) => {
        // 1. Perform all string replacements (Markdown) on the full text
        const processedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>');            // Italics
            
        
        // 2. Split the processed text by newlines to render as separate paragraphs
        const lines = processedText.split('\n');

        // 3. Map the string lines to <p> elements using dangerouslySetInnerHTML
        return lines.map((line, i) => (
            // The magic fix: Inject the processed string as inner HTML for the line
            <p 
                key={i} 
                style={{ margin: '0.2em 0' }} 
                dangerouslySetInnerHTML={{ __html: line }} 
            />
        ));
    };
    // --- END CORRECTED RENDERING LOGIC ---


    return (
        <div style={{ 
            maxWidth: '450px', 
            margin: '20px auto', 
            borderRadius: '10px', 
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', 
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
        }}>
            <header style={{ 
                padding: '15px', 
                backgroundColor: '#2ecc71', // Agro-friendly green
                color: 'white', 
                borderTopLeftRadius: '10px', 
                borderTopRightRadius: '10px',
                fontSize: '1.2em',
                fontWeight: 'bold',
                textAlign: 'center'
            }}>
                AgroBot AI Assistant
            </header>

            {/* Chat Messages Area */}
            <div style={{ 
                flexGrow: 1, 
                padding: '15px', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {chatHistory.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                        Ask AgroBot anything about farming, soil, pests, or nutrients!
                        <p style={{marginTop: '5px', fontSize: '0.9em'}}>Example: *What is the optimal pH for growing wheat?*</p>
                    </div>
                )}
                {chatHistory.map((msg, index) => (
                    <div key={index} style={{
                        maxWidth: '80%',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.role === 'user' ? '#d9ead3' : '#f0f0f0',
                        padding: '10px 15px',
                        borderRadius: '15px',
                        borderTopLeftRadius: msg.role === 'user' ? '15px' : '0',
                        borderTopRightRadius: msg.role === 'user' ? '0' : '15px',
                        fontSize: '0.9em',
                        whiteSpace: 'pre-wrap',
                        textAlign: 'left'
                    }}>
                        {renderMessage(msg.text)} 
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: '10px 15px', color: '#2ecc71' }}>
                        ...AgroBot is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '15px', borderTop: '1px solid #ccc', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Ask AgroBot..."
                    style={{ 
                        flexGrow: 1, 
                        padding: '10px', 
                        borderRadius: '20px', 
                        border: '1px solid #ccc', 
                        fontSize: '1em' 
                    }}
                />
                <button
                    onClick={() => sendMessage(input)}
                    disabled={isLoading || !input.trim()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isLoading ? '#ccc' : '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;