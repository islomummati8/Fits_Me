// Chat elementlarini olish
const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// Chat oynasini ochish/yopish
chatToggle.addEventListener('click', () => {
    chatBox.classList.toggle('active');
});

closeChat.addEventListener('click', () => {
    chatBox.classList.remove('active');
});

// Xabar yuborish funksiyasi
function sendMessage() {
    let text = chatInput.value.trim();
    if (text === "") return;

    // Foydalanuvchi xabarini chiqarish
    let userMsgHTML = `
        <div class="message user-msg">
            <p>${escapeHTML(text)}</p>
            <span class="msg-time">Hozir</span>
        </div>
    `;
    chatBody.insertAdjacentHTML('beforeend', userMsgHTML);
    chatInput.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    // Avtomatik javob (Agar admin hali javob bermagan bo'lsa, xabarni qabul qilganini bildirish)
    setTimeout(() => {
        let adminReplyHTML = `
            <div class="message admin-msg">
                <p>Xabaringiz qabul qilindi! fitsme.uae@gmail.com orqali tez orada admin javob yozadi.</p>
                <span class="msg-time">Hozir</span>
            </div>
        `;
        chatBody.insertAdjacentHTML('beforeend', adminReplyHTML);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

// Tugma va Enter bosilganda ishlashi
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Mahsulotdagi "Buyurtma berish" bosilganda chatni ochib, o'sha mahsulot haqida yozish
function openChatWithProduct(productName) {
    chatBox.classList.add('active');
    chatInput.value = `Salom, men "${productName}" pijasini buyurtma qilmoqchiman.`;
    chatInput.focus();
}

// Xavfsizlik uchun HTML belgilarini tozalash
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}