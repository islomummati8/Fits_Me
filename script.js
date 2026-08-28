import { db } from "./firebase-config.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// Unique User ID generate qilish (har bir mijoz uchun alohida chat sessiyasi)
let userId = localStorage.getItem('fits_me_user_id');
if (!userId) {
    userId = 'user_' + Math.random().toString(36.substring(2, 9));
    localStorage.setItem('fits_me_user_id', userId);
}

chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'));
closeChat.addEventListener('click', () => chatBox.classList.remove('active'));

// Firestore dan real-time xabarlarni o'qish
const messagesRef = collection(db, `chats/${userId}/messages`);
const q = query(messagesRef, orderBy('createdAt', 'asc'));

onSnapshot(q, (snapshot) => {
    // Agar xabarlar bo'lmasa dastlabki xabarni qoldiramiz
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

// Xabar yuborish
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