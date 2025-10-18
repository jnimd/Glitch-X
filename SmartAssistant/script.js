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
const GEMINI_API_KEY = "AIzaSyDRQJ3esgeUuPOLGvN00M6AZydOgj-9gxI";
const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;


// ====================================================================
// 3. UI ELEMENTS & GLOBAL STATE
// ====================================================================
const chatBox = document.getElementById('main-chat-display');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat-button');
const chatsListContainer = document.getElementById('chats-list-container');

// Auth UI elements
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
// ====================================================================

/**
 * Handles Google Sign-In using a Popup.
 */
function handleGoogleLogin() {
    auth.signInWithPopup(googleProvider)
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
            alert("Login failed: " + error.message);
        });
}

/**
 * Handles User Logout.
 */
function handleLogout() {
    auth.signOut()
        .catch((error) => {
            console.error("Logout Error:", error);
        });
}

/**
 * Updates the UI based on the user's authentication state.
 */
function updateAuthUI(user) {
    // Enable/Disable main chat controls
    const isUserLoggedIn = !!user;
    userInput.disabled = !isUserLoggedIn;
    sendButton.disabled = !isUserLoggedIn;
    newChatButton.disabled = !isUserLoggedIn;

    // Update placeholder text
    userInput.placeholder = isUserLoggedIn ? "Tell us about your capabilities" : "Sign in to start chatting...";

    if (user) {
        // --- LOGGED IN ---
        currentUserID = user.uid;
        // Set the Firestore path to the current user's chat history
        userChatsRef = db.collection('users').doc(user.uid).collection('chats');

        // Update UI
        loginButton.classList.add('hidden');
        userDetailsDisplay.classList.remove('hidden');

        userDisplayName.textContent = user.displayName || 'User';
        const nameParts = (user.displayName || 'G U').split(' ');
        // Get initials from first and last name (if available)
        userInitials.textContent = (nameParts[0][0] + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '')).toUpperCase();

        // Start loading and listening to chat history
        subscribeToChats();

    } else {
        // --- LOGGED OUT ---
        currentUserID = null;
        currentChatId = null;
        userChatsRef = null;

        // Stop listening to chat history
        if (unsubscribeFromChats) {
            unsubscribeFromChats();
            unsubscribeFromChats = null;
        }

        // Update UI
        loginButton.classList.remove('hidden');
        userDetailsDisplay.classList.add('hidden');
        // Clear history list and show 'Sign in' prompt
        chatsListContainer.innerHTML = '<div class="group-title">CHATS</div><a class="nav-link" style="padding:10px 15px; color:var(--sub); cursor:default;">Sign in to view history.</a>';
        chatBox.innerHTML = ''; // Clear main chat display

    }
}

// Attach listeners to Auth buttons
loginButton.addEventListener('click', handleGoogleLogin);
logoutButton.addEventListener('click', handleLogout);

// Listen for authentication state changes (This runs on page load and on sign in/out)
auth.onAuthStateChanged(updateAuthUI);


// ====================================================================
// 5. FIRESTORE & CHAT HISTORY LOGIC
// ====================================================================

/**
 * Subscribes to the user's chat history in real-time.
 */
function subscribeToChats() {
    if (!userChatsRef) return;

    // Unsubscribe from any previous listener
    if (unsubscribeFromChats) {
        unsubscribeFromChats();
    }

    // Listen to changes in the 'chats' collection, ordered by creation time (descending)
    unsubscribeFromChats = userChatsRef
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            renderChatHistory(chats);

            // Logic to select the current/first chat upon history load
            if (chats.length === 0) {
                // If list is empty, start a brand new one
                newChat(true);
            } else if (!currentChatId || !chats.find(c => c.id === currentChatId)) {
                // If no chat is active or the active one was deleted, select the first one
                selectChat(chats[0].id, chats);
            } else {
                // The current chat is still active, just re-render its messages (in case of title change)
                renderChatMessages(chats.find(c => c.id === currentChatId));
            }
        }, error => {
            console.error("Firestore Chats Listener Error:", error);
            // Optionally display an error message in the chat box
        });
}

/**
 * Starts a new chat session in Firestore.
 */
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
            // Note: renderChatHistory/renderChatMessages is handled by the real-time listener
            userInput.focus();
        }
    } catch (e) {
        console.error("Error creating new chat:", e);
    }
}

/**
 * Selects and loads a specific chat session.
 */
function selectChat(id, chats) {
    currentChatId = id;
    const chat = chats.find(c => c.id === id);
    if (chat) {
        renderChatMessages(chat);
    }
    // renderChatHistory is handled by the real-time listener
    userInput.focus();
}

/**
 * Renders the list of chats in the sidebar navigation.
 */
function renderChatHistory(chats) {
    const groupTitle = chatsListContainer.querySelector('.group-title');
    chatsListContainer.innerHTML = '';
    if (groupTitle) {
        chatsListContainer.appendChild(groupTitle);
    }

    chats.forEach(chat => {
        const chatItem = document.createElement('a');
        chatItem.href = "#";
        chatItem.classList.add('chat-history-item');
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        chatItem.textContent = chat.title;
        chatItem.dataset.chatId = chat.id;

        chatItem.addEventListener('click', (e) => {
            e.preventDefault();
            selectChat(chat.id, chats);
        });

        chatsListContainer.appendChild(chatItem);
    });
}

/**
 * Renders the messages of the current chat session in the main display.
 */
function renderChatMessages(chat) {
    chatBox.innerHTML = ''; // Clear display

    if (chat && chat.messages && chat.messages.length > 0) {
        chat.messages.forEach(msg => {
            addMessage(msg.text, msg.sender);
        });
    } else {
        // Show welcome message again when a new empty chat is selected
        const welcomeMessage = document.createElement('div');
        welcomeMessage.innerHTML = '<h2>Start a New Chat</h2><p class="sub-text">Your conversation will be saved here.</p>';
        welcomeMessage.style.textAlign = 'center';
        welcomeMessage.style.marginTop = '100px';
        chatBox.appendChild(welcomeMessage);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}


// ====================================================================
// 6. MESSAGE SENDING & API INTERACTION (Modified for Firestore)
// ====================================================================

/**
 * Handles adding a message to the UI.
 */
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    // Sanitize the text just in case
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
    const currentActiveItem = chatsListContainer.querySelector('.chat-history-item.active');
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
        // 4. Call the Gemini API
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
// 7. UTILITY FUNCTIONS & EVENT LISTENERS
// ====================================================================

/**
 * Automatically adjusts the height of the textarea to fit its content.
 */
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
}


// Attach listeners to send message buttons/keys
sendButton.addEventListener('click', sendMessage);
newChatButton.addEventListener('click', () => {
    if (currentUserID) newChat(true);
});

userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


userInput.addEventListener('input', autoResizeTextarea);
