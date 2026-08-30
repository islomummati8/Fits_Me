import { db, auth } from "./firebase-config.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const ADMIN_EMAILS = ["islomummati8@gmail.com"];

const adminMainContainer = document.getElementById('adminMainContainer');
const accessDenied = document.getElementById('accessDenied');
const usersChatList = document.getElementById('usersChatList');
const adminMessagesBody = document.getElementById('adminMessagesBody');
const selectedChatHeader = document.getElementById('selectedChatHeader');
const adminReplyFooter = document.getElementById('adminReplyFooter');
const adminReplyInput = document.getElementById('adminReplyInput');
const adminSendBtn = document.getElementById('adminSendBtn');

let activeUserId = null;

// Admin ekanligini tekshirish
onAuthStateChanged(auth, (user) => {
    if (user && ADMIN_EMAILS.includes(user.email)) {
        if(adminMainContainer) adminMainContainer.style.display = 'flex';
        if(accessDenied) accessDenied.style.display = 'none';
        loadUsersChats();
    } else {
        if(adminMainContainer) adminMainContainer.style.display = 'none';
        if(accessDenied) accessDenied.style.display = 'flex';
    }
});

// Barcha mijozlar chatlarini yuklash (Aniq va ishlaydigan usул)
async function loadUsersChats() {
    try {
        const chatsRef = collection(db, 'chats');
        
        // Real-time kuzatish
        onSnapshot(chatsRef, (snapshot) => {
            usersChatList.innerHTML = '';
            if (snapshot.empty) {
                usersChatList.innerHTML = '<p style="padding: 15px; color: #777;">Hozircha chatlar yo\'q</p>';
                return;
            }

            snapshot.forEach((docSnap) => {
                let uId = docSnap.id;
                let div = document.createElement('div');
                div.className = 'chat-user-item';
                div.style.cssText = 'padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #eee; color: #333; font-weight: 500; transition: background 0.2s;';
                div.innerHTML = `<i class="fas fa-user" style="margin-right: 8px;"></i> 👤 Client: ${uId}`;
                
                div.addEventListener('click', () => {
                    document.querySelectorAll('.chat-user-item').forEach(el => el.style.background = 'transparent');
                    div.style.background = '#e2d9f3';
                    selectUserChat(uId);
                });
                usersChatList.appendChild(div);
            });
        });
    } catch (error) {
        console.error("Chatlarni yuklashda xatolik:", error);
    }
}

// Tanlangan chatni ochish va xabarlarni o'qish
function selectUserChat(uId) {
    activeUserId = uId;
    if(selectedChatHeader) selectedChatHeader.innerHTML = `<span>Active Chat: ${uId}</span>`;
    if(adminReplyFooter) adminReplyFooter.style.display = 'flex';

    const messagesRef = collection(db, 'chats', uId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    onSnapshot(q, (snapshot) => {
        adminMessagesBody.innerHTML = '';
        if (snapshot.empty) {
            adminMessagesBody.innerHTML = '<p style="color: #777; text-align:center; margin-top:20px;">Xabarlar yo\'q</p>';
            return;
        }

        snapshot.forEach((docSnap) => {
            let msg = docSnap.data();
            let isAdm = msg.sender === 'admin';
            let html = `
                <div style="margin-bottom: 10px; display: flex; justify-content: ${isAdm ? 'flex-end' : 'flex-start'};">
                    <div style="max-width: 70%; padding: 10px 14px; border-radius: 10px; background: ${isAdm ? '#7e3af2' : '#f0f0f0'}; color: ${isAdm ? '#fff' : '#333'};">
                        <p style="margin: 0; word-break: break-word;"><b>${msg.sender}:</b> ${msg.text || ''}</p>
                    </div>
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
    if (text === '' || !activeUserId) return;

    try {
        await addDoc(collection(db, 'chats', activeUserId, 'messages'), {
            text: text,
            sender: 'admin',
            createdAt: serverTimestamp()
        });
        adminReplyInput.value = '';
    } catch (e) {
        console.error("Admin xabar yuborishda xatolik:", e);
    }
}

if (adminSendBtn) {
    adminSendBtn.onclick = sendAdminMessage;
}

if (adminReplyInput) {
    adminReplyInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            sendAdminMessage();
        }
    };
}