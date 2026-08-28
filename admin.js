import { db } from "./firebase-config.js";
import { collection, getDocs, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const usersChatList = document.getElementById('usersChatList');
const adminMessagesBody = document.getElementById('adminMessagesBody');
const selectedChatHeader = document.getElementById('selectedChatHeader');
const adminReplyFooter = document.getElementById('adminReplyFooter');
const adminReplyInput = document.getElementById('adminReplyInput');
const adminSendBtn = document.getElementById('adminSendBtn');

let activeUserId = null;
let unsubscribeMessages = null;

// Barcha chat qilgan foydalanuvchilarni yuklash
async function loadUsersChats() {
    usersChatList.innerHTML = '';
    const chatsSnapshot = await getDocs(collection(db, 'chats'));
    
    chatsSnapshot.forEach((userDoc) => {
        let uId = userDoc.id;
        let div = document.createElement('div');
        div.className = 'chat-user-item';
        div.innerHTML = `<i class="fas fa-user"></i> Client ID: ${uId.substring(0, 8)}...`;
        div.click = () => selectUserChat(uId);
        div.addEventListener('click', () => selectUserChat(uId));
        usersChatList.appendChild(div);
    });
}

function selectUserChat(uId) {
    activeUserId = uId;
    selectedChatHeader.innerHTML = `<i class="fas fa-user-circle"></i> Active Chat: ${uId}`;
    adminReplyFooter.style.display = 'flex';

    // Avvalgi listener ni o'chirish
    if(unsubscribeMessages) unsubscribeMessages();

    const messagesRef = collection(db, `chats/${uId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        adminMessagesBody.innerHTML = '';
        snapshot.forEach((doc) => {
            let msg = doc.data();
            let msgClass = msg.sender === 'admin' ? 'user-msg' : 'admin-msg'; // Admin uchun teskari rang
            let html = `
                <div class="message ${msgClass}">
                    <p><b>${msg.sender.toUpperCase()}:</b> ${msg.text}</p>
                </div>
            `;
            adminMessagesBody.insertAdjacentHTML('beforeend', html);
        });
        adminMessagesBody.scrollTop = adminMessagesBody.scrollHeight;
    });
}

// Admin tomonidan javob yuborish
async function sendAdminMessage() {
    let text = adminReplyInput.value.trim();
    if(text === '' || !activeUserId) return;

    try {
        await addDoc(collection(db, `chats/${activeUserId}/messages`), {
            text: text,
            sender: 'admin',
            createdAt: serverTimestamp()
        });
        adminReplyInput.value = '';
    } catch(e) {
        console.error("Error sending admin reply:", e);
    }
}

adminSendBtn.addEventListener('click', sendAdminMessage);
adminReplyInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendAdminMessage();
});

loadUsersChats();