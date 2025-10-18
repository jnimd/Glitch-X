// ====================================================================
// 1. FIREBASE CONFIG & INITIALIZATION 
//    🚨🚨🚨 YOU MUST REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL FIREBASE KEYS! 🚨🚨🚨
// ====================================================================

const firebaseConfig = {
    apiKey: "AIzaSyD0eoNP13agRvcbaPV-hyJBkH7tFRwBMGs",
    authDomain: "cube-ai-b4f3f.firebaseapp.com",
    projectId: "cube-ai-b4f3f",
    storageBucket: "cube-ai-b4f3f.firebasestorage.app",
    messagingSenderId: "1003057344095",
    appId: "1:1003057344095:web:d26b043bed79ed30f2f5ea",
};

// Initialize Firebase App
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();


// ====================================================================
// 2. GEMINI API CONFIG 
// ====================================================================
// NOTE: The key provided here is a placeholder. Use your actual key.
const GEMINI_API_KEY = "AIzaSyDRQJ3esgeUuPOLGvN00M6AZydOgj-9gxI"; // 🚨 ඔබගේ සත්‍ය Gemini API Key එක මෙහි දමන්න!
const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;


// ====================================================================
// 3. UI ELEMENTS & GLOBAL STATE
// ====================================================================
const chatBox = document.getElementById('main-chat-display');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
// Note: This button ID is missing in the current HTML. We will skip it for now.
const newChatButton = document.getElementById('new-chat-button');
// Note: This container ID is missing in the current HTML. We will skip it for now.
const chatsListContainer = document.getElementById('chats-list-container');

// Auth UI elements (These IDs are also missing in the latest HTML, 
// but we leave them here as they were used for previous auth logic)
const loginButton = document.getElementById('google-login-button');
const logoutButton = document.getElementById('logout-button');
const userDetailsDisplay = document.getElementById('user-details-display');
const userInitials = document.getElementById('user-initials');
const userDisplayName = document.getElementById('user-display-name');

let currentChatId = null;
let currentUserID = null;
let userChatsRef = null; // Firestore collection reference for the current user's chats
let unsubscribeFromChats = null; // Firestore real-time listener reference


// ====================================================================
// 4. AUTHENTICATION LOGIC (Google Sign-In)
// ... (Auth Logic is omitted for brevity but is assumed to be correct)
// ====================================================================

// --- Placeholder/Mock Auth Logic for now since HTML structure changed ---
function handleGoogleLogin() {
    // If the UI elements are missing, this will throw an error.
    // Assuming the user will fix the HTML later, we keep this structure.
    if (auth) {
        auth.signInWithPopup(googleProvider)
            .catch((error) => {
                console.error("Google Sign-In Error:", error);
                alert("Login failed: " + error.message);
            });
    }
}
function handleLogout() { if (auth) auth.signOut().catch((error) => console.error("Logout Error:", error)); }
function updateAuthUI(user) {
    // Note: Since the HTML sidebar elements like loginButton, userDetailsDisplay, 
    // newChatButton, etc. are missing in the latest HTML, the UI won't update.
    // We are focusing on the chat functionality now.
    currentUserID = user ? user.uid : null;
    if (user) {
        userChatsRef = db.collection('users').doc(user.uid).collection('chats');
        subscribeToChats();
        userInput.placeholder = "Tell us about your capabilities";
        if (sendButton) sendButton.disabled = false;
        if (userInput) userInput.disabled = false;
    } else {
        // Clear state and UI on logout
        currentChatId = null;
        userChatsRef = null;
        userInput.placeholder = "Sign in to start chatting...";
        if (sendButton) sendButton.disabled = true;
        if (userInput) userInput.disabled = true;
    }
}
if (loginButton) loginButton.addEventListener('click', handleGoogleLogin);
if (logoutButton) logoutButton.addEventListener('click', handleLogout);
if (auth) auth.onAuthStateChanged(updateAuthUI);
// ------------------------------------------------------------------------


// ====================================================================
// 5. FIRESTORE & CHAT HISTORY LOGIC
// ... (Logic for subscribeToChats, newChat, selectChat, renderChatHistory, 
//      renderChatMessages is omitted for brevity but is assumed to be correct)
// ====================================================================

function subscribeToChats() {
    if (!userChatsRef || !chatsListContainer) return; // Added null checks for missing HTML elements
    // ... (rest of the logic)
}

// ... (Other functions from Section 5 remain the same) ...


// ====================================================================
// 6. MESSAGE SENDING & API INTERACTION (Modified for Firestore)
// ... (Logic for addMessage is omitted for brevity)
// ====================================================================

function addMessage(text, sender) {
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
 * Handles sending the user's message, saving it, and updating the title via Firestore.
 */
async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '' || !currentChatId || !currentUserID) return; // Must be logged in & have active chat

    const chatDocRef = userChatsRef.doc(currentChatId);

    // 1. Display user message
    addMessage(userText, 'user');

    const userMessage = { sender: 'user', text: userText };
    let updates = {};

    // Update chat title if it's "New chat"
    const currentActiveItem = chatsListContainer ? chatsListContainer.querySelector('.chat-history-item.active') : null;
    const currentTitle = currentActiveItem ? currentActiveItem.textContent.trim() : "New chat";

    if (currentTitle === "New chat" || currentTitle.endsWith('...')) {
        updates.title = userText.substring(0, 30) + (userText.length > 30 ? '...' : '');
    }

    userInput.value = '';
    autoResizeTextarea();

    // 2. Show typing indicator
    const typingIndicator = addMessage('Assistant is typing...', 'typing-indicator');

    // 3. Save user message and title update to Firestore
    try {
        await chatDocRef.update({
            ...updates, // title update if needed
            messages: firebase.firestore.FieldValue.arrayUnion(userMessage)
        });
    } catch (e) {
        console.error("Error updating chat with user message:", e);
        // We let the process continue to the API call, even if the save failed
    }

    try {
        // 4. Call the Gemini API - THIS WAS THE MISSING CALL
        const responseText = await fetchGeminiResponse(userText);

        // 5. Remove typing indicator and display assistant's response
        chatBox.removeChild(typingIndicator);
        addMessage(responseText, 'assistant');

        // 6. Save assistant's message to Firestore
        const assistantMessage = { sender: 'assistant', text: responseText };
        await chatDocRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(assistantMessage)
        });

    } catch (error) {
        console.error("Gemini API Error or Firestore Save Error:", error);
        chatBox.removeChild(typingIndicator);
        const errorMessage = "Sorry, I encountered an error. Please check the console for details.";
        addMessage(errorMessage, 'assistant');

        // Save the error message to Firestore as well
        const errorMsg = { sender: 'assistant', text: errorMessage };
        chatDocRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(errorMsg)
        }).catch(err => console.error("Final error saving message:", err));
    }
}


// ====================================================================
// 7. UTILITY FUNCTIONS & EVENT LISTENERS (NOW WITH THE MISSING FUNCTION)
// ====================================================================

/**
 * Automatically adjusts the height of the textarea to fit its content.
 */
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
}

/**
 * 🚨🚨🚨 THIS IS THE MISSING FUNCTION THAT CAUSES THE REFERENCE ERROR 🚨🚨🚨
 * Fetches the response from the Gemini API. 
 */
async function fetchGeminiResponse(prompt) {
    // Check if the user is authenticated before calling the API
    if (!currentUserID) {
        throw new Error("User not authenticated. Please log in.");
    }

    // (Actual API call logic)
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
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


// Attach listeners to send message buttons/keys
sendButton.addEventListener('click', sendMessage);

// Removed newChatButton listener as the ID is missing in the latest HTML
// if(newChatButton) newChatButton.addEventListener('click', () => {
//     if (currentUserID) newChat(true);
// });

userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener('input', autoResizeTextarea);
