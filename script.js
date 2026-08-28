import { db, auth } from "./firebase-config.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleLogoutBtn = document.getElementById('googleLogoutBtn');
const userProfileArea = document.getElementById('userProfileArea');
const headerUserAvatar = document.getElementById('headerUserAvatar');
const adminPanelBtn = document.getElementById('adminPanelBtn');

const ADMIN_EMAILS = ["islomummati8@gmail.com"]; // Admin emaillari ro'yxati

// Google Auth 
const provider = new GoogleAuthProvider();

googleLoginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login error:", error);
    }
});

googleLogoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error:", error);
    }
});

// Autentifikatsiya holatini kuzatish
onAuthStateChanged(auth, (user) => {
    if (user) {
        googleLoginBtn.style.display = 'none';
        userProfileArea.style.display = 'flex';
        headerUserAvatar.src = user.photoURL || 'assets/Fits_Me.jpeg';

        // Faqat admin emaillariga Admin Panel tugmasini ko'rsatish
        if (ADMIN_EMAILS.includes(user.email)) {
            adminPanelBtn.style.display = 'flex';
        }
    } else {
        googleLoginBtn.style.display = 'flex';
        userProfileArea.style.display = 'none';
        adminPanelBtn.style.display = 'none';
    }
});

// User ID
let userId = localStorage.getItem('fits_me_user_id');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('fits_me_user_id', userId);
}

chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'));
closeChat.addEventListener('click', () => chatBox.classList.remove('active'));

// Real-time chat
const messagesRef = collection(db, `chats/${userId}/messages`);
const q = query(messagesRef, orderBy('createdAt', 'asc'));

onSnapshot(q, (snapshot) => {
    if(snapshot.empty) return;
    chatBody.innerHTML = '';
    snapshot.forEach((doc) => {
        let msg = doc.data();
        let msgClass = msg.sender === 'admin' ? 'admin-msg' : 'user-msg';
        let html = `
            <div class="message ${msgClass}">
                <p>${escapeHTML(msg.text)}</p>
                <span class="msg-time">Just now</span>
            </div>
        `;
        chatBody.insertAdjacentHTML('beforeend', html);
    });
    chatBody.scrollTop = chatBody.scrollHeight;
});

async function sendUserMessage() {
    let text = chatInput.value.trim();
    if(text === '') return;

    try {
        await addDoc(collection(db, `chats/${userId}/messages`), {
            text: text,
            sender: 'user',
            createdAt: serverTimestamp()
        });
        chatInput.value = '';
    } catch(e) {
        console.error("Error sending message: ", e);
    }
}

sendBtn.addEventListener('click', sendUserMessage);
chatInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendUserMessage();
});

window.openChatWithProduct = function(productName) {
    chatBox.classList.add('active');
    chatInput.value = `Hello, I want to order "${productName}".`;
    chatInput.focus();
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}