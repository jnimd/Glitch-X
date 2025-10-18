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
// 🚨🚨🚨 REPLACE THIS WITH YOUR ACTUAL GEMINI API KEY! 🚨🚨🚨
const GEMINI_API_KEY = "AIzaSyDRQJ3esgeUuPOLGvN00M6AZydOgj-9gxI"; 
const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;


// ====================================================================
// 3. UI ELEMENTS & GLOBAL STATE
// ====================================================================
const chatBox = document.getElementById('main-chat-display');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// 🚨 WARNING: These IDs are MISSING in your current index.html. 
// Add them for full functionality.
const newChatButton = document.getElementById('new-chat-button');
const chatsListContainer = document.getElementById('chats-list-container');

// Auth UI elements (Also missing in HTML)
const loginButton = document.getElementById('google-login-button');
const logoutButton = document.getElementById('logout-button');
const userDetailsDisplay = document.getElementById('user-details-display');
const userInitials = document.getElementById('user-initials');
const userDisplayName = document.getElementById('user-display-name');

let currentChatId = null;
let currentUserID = null;
let userChatsRef = null; 
let unsubscribeFromChats = null; 


// ====================================================================
// 4. AUTHENTICATION LOGIC (Google Sign-In)
//    NOTE: UI updates are wrapped in checks due to missing HTML IDs.
// ====================================================================

function handleGoogleLogin() {
    auth.signInWithPopup(googleProvider)
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
            alert("Login failed: " + error.message);
        });
}

function handleLogout() {
    auth.signOut()
        .catch((error) => {
            console.error("Logout Error:", error);
        });
}

function updateAuthUI(user) {
    const isUserLoggedIn = !!user;
    if(userInput) userInput.disabled = !isUserLoggedIn;
    if(sendButton) sendButton.disabled = !isUserLoggedIn;
    if(newChatButton) newChatButton.disabled = !isUserLoggedIn; 

    if(userInput) userInput.placeholder = isUserLoggedIn ? "Tell us about your capabilities" : "Sign in to start chatting...";

    if (user) {
        currentUserID = user.uid;
        userChatsRef = db.collection('users').doc(user.uid).collection('chats');
        
        // Skip UI updates for missing elements
        // if(loginButton) loginButton.classList.add('hidden');
        
        subscribeToChats();

    } else {
        currentUserID = null;
        currentChatId = null;
        userChatsRef = null;

        if (unsubscribeFromChats) {
            unsubscribeFromChats();
            unsubscribeFromChats = null;
        }

        if(chatBox) chatBox.innerHTML = ''; // Clear main chat display
    }
}

// Attach listeners to Auth buttons (wrapped in checks)
if(loginButton) loginButton.addEventListener('click', handleGoogleLogin);
if(logoutButton) logoutButton.addEventListener('click', handleLogout);

auth.onAuthStateChanged(updateAuthUI);


// ====================================================================
// 5. FIRESTORE & CHAT HISTORY LOGIC
//    NOTE: History rendering is partially disabled until HTML is fixed.
// ====================================================================

function subscribeToChats() {
    if (!userChatsRef) return;
    if (unsubscribeFromChats) {
        unsubscribeFromChats();
    }

    unsubscribeFromChats = userChatsRef
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // renderChatHistory(chats); // Disabled due to missing HTML ID

            if (chats.length === 0) {
                newChat(true);
            } else if (!currentChatId || !chats.find(c => c.id === currentChatId)) {
                selectChat(chats[0].id, chats);
            } else {
                renderChatMessages(chats.find(c => c.id === currentChatId));
            }
        }, error => {
            console.error("Firestore Chats Listener Error:", error);
        });
}

async function newChat(select = true) {
    if (!userChatsRef || !currentUserID) return;

    try {
        const newChatData = {
            title: "New chat",
            messages: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await userChatsRef.add(newChatData);

        if (select) {
            currentChatId = docRef.id;
            if(userInput) userInput.focus();
        }
    } catch (e) {
        console.error("Error creating new chat:", e);
    }
}

function selectChat(id, chats) {
    currentChatId = id;
    const chat = chats.find(c => c.id === id);
    if (chat) {
        renderChatMessages(chat);
    }
    if(userInput) userInput.focus();
}

function renderChatHistory(chats) {
    // This is the function that relies on the missing 'chatsListContainer'
    // ... (logic skipped) ...
}

function renderChatMessages(chat) {
    if(chatBox) chatBox.innerHTML = ''; 

    if (chat && chat.messages && chat.messages.length > 0) {
        chat.messages.forEach(msg => {
            addMessage(msg.text, msg.sender);
        });
    } else if(chatBox) {
        // Show welcome message again when a new empty chat is selected
        const welcomeMessage = document.createElement('div');
        welcomeMessage.innerHTML = '<h2>Start a New Chat</h2><p class="sub-text">Your conversation will be saved here.</p>';
        welcomeMessage.style.textAlign = 'center';
        welcomeMessage.style.marginTop = '100px';
        chatBox.appendChild(welcomeMessage);
    }
    if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}


// ====================================================================
// 6. MESSAGE SENDING & API INTERACTION 
// ====================================================================

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageDiv.appendChild(paragraph);

    if(chatBox) chatBox.appendChild(messageDiv);
    if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

async function sendMessage() {
    const userText = userInput ? userInput.value.trim() : ''; 
    if (userText === '' || !currentChatId || !currentUserID) return; 

    const chatDocRef = userChatsRef.doc(currentChatId);

    // 1. Display user message
    addMessage(userText, 'user');

    const userMessage = { sender: 'user', text: userText };
    let updates = {};

    // Fallback title logic
    const currentActiveItem = chatsListContainer ? chatsListContainer.querySelector('.chat-history-item.active') : null;
    const currentTitle = currentActiveItem ? currentActiveItem.textContent.trim() : "New chat"; 

    if (currentTitle === "New chat" || currentTitle.endsWith('...')) {
        updates.title = userText.substring(0, 30) + (userText.length > 30 ? '...' : '');
    }

    if(userInput) userInput.value = '';
    autoResizeTextarea();

    // 2. Show typing indicator
    const typingIndicator = addMessage('Assistant is typing...', 'typing-indicator');

    // 3. Save user message and title update to Firestore
    try {
        await chatDocRef.update({
            ...updates, 
            messages: firebase.firestore.FieldValue.arrayUnion(userMessage)
        });
    } catch (e) {
        console.error("Error updating chat with user message:", e);
    }

    try {
        // 4. Call the Gemini API - THIS IS THE FIXED LINE!
        const responseText = await fetchGeminiResponse(userText); 

        // 5. Remove typing indicator and display assistant's response
        if(chatBox && typingIndicator) chatBox.removeChild(typingIndicator);
        addMessage(responseText, 'assistant');

        // 6. Save assistant's message to Firestore
        const assistantMessage = { sender: 'assistant', text: responseText };
        await chatDocRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(assistantMessage)
        });

    } catch (error) {
        console.error("Gemini API Error or Firestore Save Error:", error);
        if(chatBox && typingIndicator) chatBox.removeChild(typingIndicator);
        const errorMessage = "Sorry, I encountered an error. Please check the console for details. (Check API Key!)";
        addMessage(errorMessage, 'assistant');

        // Save the error message to Firestore as well
        const errorMsg = { sender: 'assistant', text: errorMessage };
        chatDocRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(errorMsg)
        }).catch(err => console.error("Final error saving message:", err));
    }
}


// ====================================================================
// 7. UTILITY FUNCTIONS & EVENT LISTENERS
// ====================================================================

/**
 * Automatically adjusts the height of the textarea to fit its content.
 */
function autoResizeTextarea() {
    if(userInput) {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    }
}

/**
 * 🚨🚨🚨 THE MISSING FUNCTION DEFINITION (NOW INCLUDED) 🚨🚨🚨
 * Fetches the response from the Gemini API. 
 */
async function fetchGeminiResponse(prompt) {
    if (!currentUserID) {
        throw new Error("User not authenticated. Please log in.");
    }
    if (GEMINI_API_KEY === "AIzaSyDRQJ3esgeUuPOLGvN00M6AZydOgj-9gxI") {
        throw new Error("API Key is the placeholder. Please replace it with your actual Gemini API Key.");
    }

    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error Details:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - Check Console for API details (e.g., if key is invalid or quota exceeded).`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "I couldn't generate a response for that query. (Safety or content block)";
}


// Attach listeners to send message buttons/keys
if(sendButton) sendButton.addEventListener('click', sendMessage);

if (newChatButton) newChatButton.addEventListener('click', () => {
    if (currentUserID) newChat(true);
});

if(userInput) {
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    userInput.addEventListener('input', autoResizeTextarea);
}
