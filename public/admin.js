import { db, auth } from "./firebase-config.js";
import { collection, getDocs, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
const adminEmailDisplay = document.getElementById('adminEmailDisplay');

let activeUserId = null;
let unsubscribeMessages = null;
let unsubscribeChats = null;

// Faqat admin ekanligini tekshirish
onAuthStateChanged(auth, (user) => {
    if (user && ADMIN_EMAILS.includes(user.email)) {
        adminMainContainer.style.display = 'flex';
        accessDenied.style.display = 'none';
        adminEmailDisplay.textContent = user.email;
        loadUsersChatsRealtime();
    } else {
        adminMainContainer.style.display = 'none';
        accessDenied.style.display = 'flex';
    }
});

// Realtime rejimida chat yozgan foydalanuvchilarni chiqarish
function loadUsersChatsRealtime() {
    if (unsubscribeChats) unsubscribeChats();

    const chatsRef = collection(db, 'chats');
    unsubscribeChats = onSnapshot(chatsRef, (snapshot) => {
        usersChatList.innerHTML = '';
        
        if (snapshot.empty) {
            usersChatList.innerHTML = '<p style="padding: 10px; color: #777;">Hozircha chatlar yo\'q</p>';
            return;
        }

        snapshot.forEach((userDoc) => {
            let uId = userDoc.id;
            let div = document.createElement('div');
            div.className = 'chat-user-item';
            div.innerHTML = `<i class="fas fa-user"></i> Client: ${uId.substring(0, 8)}`;
            div.addEventListener('click', () => {
                // Aktiv chat elementini belgilash uchun active class qo'shish mumkin
                document.querySelectorAll('.chat-user-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                selectUserChat(uId);
            });
            usersChatList.appendChild(div);
        });
    });
}

function selectUserChat(uId) {
    activeUserId = uId;
    selectedChatHeader.innerHTML = `<i class="fas fa-user-circle"></i> Active Chat: ${uId}`;
    adminReplyFooter.style.display = 'flex';

    if (unsubscribeMessages) unsubscribeMessages();

    const messagesRef = collection(db, `chats/${uId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        adminMessagesBody.innerHTML = '';
        snapshot.forEach((doc) => {
            let msg = doc.data();
            // Agar xabar admin tomonidan yozilgan bo'lsa boshqacha, userdan bo'lsa boshqachaklass
            let msgClass = msg.sender === 'admin' ? 'admin-msg' : 'user-msg';
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

async function sendAdminMessage() {
    let text = adminReplyInput.value.trim();
    if (text === '' || !activeUserId) return;

    try {
        await addDoc(collection(db, `chats/${activeUserId}/messages`), {
            text: text,
            sender: 'admin',
            createdAt: serverTimestamp()
        });
        adminReplyInput.value = '';
    } catch (e) {
        console.error("Error:", e);
    }
}

adminSendBtn.addEventListener('click', sendAdminMessage);
adminReplyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAdminMessage();
});