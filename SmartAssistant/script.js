// ====================================================================
// 1. GEMINI API CONFIG (FINALIZED - NO FIREBASE/AUTH)
// ====================================================================
// 🚨🚨🚨 ඔබගේ අලුත්ම GEMINI API KEY එක මෙහි සකසා ඇත! 🚨🚨🚨
const GEMINI_API_KEY = "AIzaSyC8pAU_EUK6Tr5g0Nv_2rZ2EUxKh3g66A4";
const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;


// ====================================================================
// 2. UI ELEMENTS & GLOBAL STATE
// ====================================================================
const chatBox = document.getElementById('main-chat-display');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat-button'); // New Chat Button

// Global state for conversation context (needed for continuous chat)
let conversationHistory = [];


// ====================================================================
// 3. MESSAGE SENDING & API INTERACTION 
// ====================================================================

/**
 * Adds a new message bubble to the chat interface.
 * @param {string} text - The message content.
 * @param {string} sender - 'user' or 'assistant'.
 * @returns {HTMLElement} - The created message div.
 */
function addMessage(text, sender) {
    // Hide welcome section once the first message is sent
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageDiv.appendChild(paragraph);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

/**
 * Handles sending the user's message and fetching the API response.
 */
async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    // 1. Display user message
    addMessage(userText, 'user');

    // 2. Add user message to local history for context (Gemini needs this)
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    userInput.value = '';
    autoResizeTextarea();

    // 3. Show typing indicator
    const typingIndicator = addMessage('Assistant is typing...', 'typing-indicator');

    try {
        // 4. Call the Gemini API with the full conversation history
        const responseText = await fetchGeminiResponse();

        // 5. Remove typing indicator and display assistant's response
        chatBox.removeChild(typingIndicator);
        addMessage(responseText, 'assistant');

        // 6. Add assistant's response to local history for the next turn
        conversationHistory.push({ role: "model", parts: [{ text: responseText }] });

    } catch (error) {
        console.error("Gemini API Error:", error);
        chatBox.removeChild(typingIndicator);

        let errorMessage = "Sorry, I encountered an error. Please check the console (F12) for details.";
        if (error.message.includes("400")) {
            errorMessage += " (Error 400: Invalid API Key or Safety Block)";
        }

        addMessage(errorMessage, 'assistant');
    }
}


// ====================================================================
// 4. UTILITY FUNCTIONS & EVENT LISTENERS
// ====================================================================

/**
 * Fetches the response from the Gemini API using the current conversationHistory.
 * @returns {Promise<string>} - The assistant's response text.
 */
async function fetchGeminiResponse() {
    // The entire conversationHistory is sent as the payload
    const payload = { contents: conversationHistory };

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error Details:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - Check Console for API details.`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "I couldn't generate a response for that query. (Safety or content block)";
}


/**
 * Clears the chat display and local history for a new conversation.
 */
function startNewChat() {
    conversationHistory = [];
    if (chatBox) chatBox.innerHTML = '';

    // Show welcome section again
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
    }

    // Also clear the sidebar history note (if you added one)
    const historyNote = document.querySelector('.history-note');
    if (historyNote) historyNote.style.display = 'block';

    if (userInput) userInput.focus();
}


/**
 * Automatically adjusts the height of the textarea to fit its content.
 */
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
}


// Attach listeners
sendButton.addEventListener('click', sendMessage);

newChatButton.addEventListener('click', startNewChat);

userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent adding a new line
        sendMessage();
    }
});

userInput.addEventListener('input', autoResizeTextarea);

// Initial state cleanup on load (optional but good practice)
document.addEventListener('DOMContentLoaded', () => {
    startNewChat();
});
