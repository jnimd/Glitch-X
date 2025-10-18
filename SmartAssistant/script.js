// ====================================================================
// 1. FIREBASE CONFIG & INITIALIZATION 
//    🚨🚨🚨 YOU MUST REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL FIREBASE KEYS! 🚨🚨🚨
// ====================================================================
const firebaseConfig = {
    // ⚠️ REPLACE WITH YOUR ACTUAL FIREBASE API KEY!
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
// 2. GEMINI API CONFIG (ඔබ ලබා දුන් Key එක යොදා ඇත)
// ====================================================================
const GEMINI_API_KEY = "AIzaSyCh4lGPRj5Yq3BT-U6ElOSaBmrdCvRhM5U"; 
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
let userChatsRef = null; 
let unsubscribeFromChats = null; 
let conversationHistory = []; // Local state for context in the *current* chat
let isSendingMessage = false; // ⬅️ NEW: Flag to prevent re-render while typing
let isChatSyncing = false; // Flag to know if the chat is currently being set up


// ====================================================================
// 4. AUTHENTICATION LOGIC (Google Sign-In)
// ====================================================================

function handleGoogleLogin() {
    auth.signInWithPopup(googleProvider)
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
            alert("Login failed. Check the Firebase Console's 'Authorized domains' and Ad Blocker settings: " + error.message);
        });
}

function handleLogout() {
    auth.signOut()
        .catch((error) => {
            console.error("Logout Error:", error);
        });
}

/**
 * Updates UI and state based on authentication status.
 */
function updateAuthUI(user) {
    const isUserLoggedIn = !!user;
    
    // Toggle UI Elements
    if(loginButton) loginButton.classList.toggle('hidden', isUserLoggedIn);
    if(userDetailsDisplay) userDetailsDisplay.classList.toggle('hidden', !isUserLoggedIn);
    if(newChatButton) newChatButton.disabled = !isUserLoggedIn;
    if(sendButton) sendButton.disabled = !isUserLoggedIn;
    if(userInput) userInput.disabled = !isUserLoggedIn;

    if (user) {
        // Logged In State
        currentUserID = user.uid;
        userChatsRef = db.collection('users').doc(user.uid).collection('chats');
        
        // Update user display info
        if(userDisplayName) userDisplayName.textContent = user.displayName ? user.displayName.split(' ')[0] : 'User';
        if(userInitials) userInitials.textContent = user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U';
        
        if(userInput) userInput.placeholder = "Start chatting...";

        // Hide welcome section after login
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) welcomeSection.style.display = 'none';

        subscribeToChats();

    } else {
        // Logged Out State
        currentUserID = null;
        currentChatId = null;
        userChatsRef = null;
        conversationHistory = [];
        
        if (unsubscribeFromChats) {
            unsubscribeFromChats();
            unsubscribeFromChats = null;
        }

        if(chatBox) chatBox.innerHTML = ''; // Clear main chat display
        if(chatsListContainer) chatsListContainer.innerHTML = '<div class="group-title">CHATS</div><p class="history-note">Sign in to view history.</p>';

        if(userInput) userInput.placeholder = "Sign in to start chatting...";
        
        // Show Welcome Section when logged out
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) welcomeSection.style.display = 'block';
    }
}

// Attach listeners to Auth buttons
if(loginButton) loginButton.addEventListener('click', handleGoogleLogin);
if(logoutButton) logoutButton.addEventListener('click', handleLogout);

// Listen for Auth state changes
auth.onAuthStateChanged(updateAuthUI);

// ====================================================================
// 5. FIRESTORE & CHAT HISTORY LOGIC
// ====================================================================
function subscribeToChats() {
    if (!userChatsRef || !chatsListContainer) return;

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
            
            // Render History (Sidebar)
            renderChatHistory(chats);

            if (chats.length === 0) {
                newChat(true); 
            } else if (!currentChatId || !chats.find(c => c.id === currentChatId)) {
                isChatSyncing = true; // Set flag when first selecting a chat
                selectChat(chats[0]?.id, chats); 
            } else if (!isSendingMessage && !isChatSyncing) { // ⬅️ FIX: Only re-render if not sending or initial sync is done
                renderChatMessages(chats.find(c => c.id === currentChatId));
            }
            
            // isChatSyncing should be handled after selectChat is called
            if (isChatSyncing && currentChatId) {
                 isChatSyncing = false;
            }

        }, error => {
            console.error("Firestore Chats Listener Error:", error);
        });
}

async function newChat(select = true) {
    if (!userChatsRef || !currentUserID) return;

    try {
        const newChatData = {
            title: "New chat...",
            messages: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await userChatsRef.add(newChatData);

        if (select) {
            currentChatId = docRef.id;
            conversationHistory = []; // Reset local history for new chat
            if(chatBox) chatBox.innerHTML = '';
            showInitialMessage();
            if(userInput) userInput.focus();
        }
    } catch (e) {
        console.error("Error creating new chat:", e);
    }
}

function selectChat(id, chats) {
    if (!id) return; 

    currentChatId = id;
    const chat = chats.find(c => c.id === id);
    
    if (chat) {
        // Load messages into the local history for context in Gemini API call
        conversationHistory = chat.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.text }]
        }));
        renderChatMessages(chat);
    }
    if(userInput) userInput.focus();
}

function renderChatHistory(chats) {
    if (!chatsListContainer) return; 

    const chatGroup = chatsListContainer;
    chatGroup.innerHTML = '<div class="group-title">CHATS</div>'; // Clear existing chats

    if (chats.length === 0) {
         chatGroup.innerHTML += '<p class="history-note">No chats yet. Start one!</p>';
         return;
    }

    chats.forEach(chat => {
        const item = document.createElement('a');
        item.href = "#";
        item.classList.add('nav-link', 'chat-history-item');
        if (chat.id === currentChatId) {
            item.classList.add('active');
        }
        item.textContent = chat.title || "Untitled Chat";
        item.addEventListener('click', (e) => {
            e.preventDefault();
            selectChat(chat.id, chats); 
        });
        chatGroup.appendChild(item);
    });
}

function renderChatMessages(chat) {
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) welcomeSection.style.display = 'none';

    if(chatBox) chatBox.innerHTML = ''; 

    if (chat && chat.messages && chat.messages.length > 0) {
        chat.messages.forEach(msg => {
            addMessage(msg.text, msg.sender);
        });
    } else {
        showInitialMessage();
    }
    if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

function showInitialMessage() {
    const initialMsg = document.createElement('div');
    initialMsg.innerHTML = '<p class="sub-text" style="text-align:center; padding-top:20px;">Your new conversation starts here. Ask me anything!</p>';
    if(chatBox) chatBox.appendChild(initialMsg);
}

// ====================================================================
// 6. MESSAGE SENDING & API INTERACTION (Error Fix Applied)
// ====================================================================

function addMessage(text, sender) {
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) welcomeSection.style.display = 'none';
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageDiv.appendChild(paragraph);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '' || !currentChatId || !currentUserID) return; 

    const chatDocRef = userChatsRef.doc(currentChatId);

    // 1. Display user message
    addMessage(userText, 'user');
    const userMessageForSave = { sender: 'user', text: userText };
    let updates = {};

    // Prepare message for Gemini history
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    // Update chat title if it's "New chat..."
    const activeChatTitle = document.querySelector('.chat-history-item.active')?.textContent;
    if (activeChatTitle && activeChatTitle.includes('New chat...')) { 
        updates.title = userText.substring(0, 30) + (userText.length > 30 ? '...' : '');
    }

    userInput.value = '';
    autoResizeTextarea();

    // 2. Show typing indicator
    const typingIndicator = addMessage('Assistant is typing...', 'typing-indicator'); // ⬅️ Indicator is added
    
    isSendingMessage = true; // ⬅️ FIX: Set flag ON immediately

    // 3. Save user message and title update to Firestore
    try {
        // This update triggers the onSnapshot listener, which is now blocked by the flag
        await chatDocRef.update({
            ...updates, 
            messages: firebase.firestore.FieldValue.arrayUnion(userMessageForSave)
        });
    } catch (e) {
        console.error("Error updating chat with user message:", e);
    }

    try {
        // 4. Call the Gemini API with the full conversation history
        const responseText = await fetchGeminiResponse(); 

        // 5. Remove typing indicator safely and display assistant's response
        if (typingIndicator && chatBox.contains(typingIndicator)) { 
            chatBox.removeChild(typingIndicator);
        }
        addMessage(responseText, 'assistant');

        // 6. Update local history and save assistant's message to Firestore
        conversationHistory.push({ role: "model", parts: [{ text: responseText }] });
        const assistantMessageForSave = { sender: 'assistant', text: responseText };

        await chatDocRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(assistantMessageForSave)
        });

    } catch (error) {
        console.error("Gemini API Error or Firestore Save Error:", error);
        
        // ⚠️ Remove typing indicator safely even if an error occurs
        if (typingIndicator && chatBox.contains(typingIndicator)) { 
            chatBox.removeChild(typingIndicator);
        }
        
        const errorMessage = "Sorry, I encountered an error. Check the console and ensure your Firebase domains are authorized/Ad Blocker is disabled.";
        addMessage(errorMessage, 'assistant');

        // Save the error message to Firestore as well
        const errorMsg = { sender: 'assistant', text: errorMessage };
        chatDocRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(errorMsg)
        }).catch(err => console.error("Final error saving message:", err));
    } finally {
        isSendingMessage = false; // ⬅️ FIX: Always turn flag OFF after API attempt
    }
}


// ====================================================================
// 7. UTILITY FUNCTIONS & EVENT LISTENERS
// ====================================================================

async function fetchGeminiResponse() {
    const payload = { contents: conversationHistory }; // Sends the full context

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error Details:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "I couldn't generate a response for that query. (Safety or content block)";
}

function autoResizeTextarea() {
    if(userInput) {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    }
}

// Attach all event listeners
if(sendButton) sendButton.addEventListener('click', sendMessage);

if(newChatButton) newChatButton.addEventListener('click', () => {
    if (currentUserID) newChat(true); // Only create new chat if logged in
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
