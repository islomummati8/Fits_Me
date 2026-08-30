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
const adminEditModeBtn = document.getElementById('adminEditModeBtn');

const ADMIN_EMAILS = ["islomummati8@gmail.com"];

// Image files (excluding Fits_Me.jpeg)
const PRODUCT_IMAGES = [
    "WhatsApp Image 2026-08-30 at 15.13.09 (1).jpeg",
    "WhatsApp Image 2026-08-30 at 15.13.09 (2).jpeg",
    "WhatsApp Image 2026-08-30 at 15.13.09.jpeg",
    "WhatsApp Image 2026-08-30 at 15.13.10 (1).jpeg",
    "WhatsApp Image 2026-08-30 at 15.13.10 (2).jpeg",
    "WhatsApp Image 2026-08-30 at 15.13.10 (3).jpeg",
    "WhatsApp Image 2026-08-30 at 15.13.10.jpeg",
];

// Store for product data
let productsData = {};
let isEditMode = false;
let currentUser = null;

// Initialize products from localStorage or create defaults
function initializeProducts() {
    const stored = localStorage.getItem('products_data');
    if (stored) {
        productsData = JSON.parse(stored);
    } else {
        PRODUCT_IMAGES.forEach((img, index) => {
            const cleanName = img.replace(/\.jpeg$/, '').replace(/WhatsApp Image 2026-08-30 at /, '');
            productsData[img] = {
                name: cleanName,
                price: 35 + (index * 5),
                image: img
            };
        });
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('products_data', JSON.stringify(productsData));
}

// Load and display products
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    Object.entries(productsData).forEach(([imgPath, product]) => {
        const card = document.createElement('div');
        card.className = 'product-card' + (isEditMode ? ' edit-mode' : '');
        card.innerHTML = `
            <div class="product-img">
                <img src="assets/${product.image}" alt="${product.name}" onerror="this.style.display='none'">
                ${isEditMode ? '<div class="edit-overlay"><button class="btn primary-btn" onclick="editProduct(\'' + imgPath + '\')"><i class="fas fa-edit"></i> Edit</button></div>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn secondary-btn" onclick="openChatWithProduct('${product.name}')">Order Now</button>
                    ${isEditMode ? '<button class="delete-btn" onclick="deleteProduct(\'' + imgPath + '\')"><i class="fas fa-trash"></i></button>' : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Edit product
window.editProduct = function(imgPath) {
    const product = productsData[imgPath];
    if (!product) return;
    
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editModal').dataset.currentImage = imgPath;
    document.getElementById('editModal').style.display = 'flex';
}

// Save product edit
window.saveProductEdit = function() {
    const imgPath = document.getElementById('editModal').dataset.currentImage;
    const newName = document.getElementById('editProductName').value.trim();
    const newPrice = parseFloat(document.getElementById('editProductPrice').value);
    
    if (!newName || isNaN(newPrice) || newPrice < 0) {
        alert('Please enter valid product name and price');
        return;
    }
    
    productsData[imgPath].name = newName;
    productsData[imgPath].price = newPrice;
    saveProducts();
    loadProducts();
    closeEditModal();
    alert('Product updated successfully!');
}

// Delete product
window.deleteProduct = function(imgPath) {
    if (confirm('Are you sure you want to delete this product?')) {
        delete productsData[imgPath];
        saveProducts();
        loadProducts();
    }
}

// Close edit modal
window.closeEditModal = function() {
    document.getElementById('editModal').style.display = 'none';
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    adminEditModeBtn.textContent = isEditMode ? '✓ Exit Edit Mode' : '<i class="fas fa-edit"></i> Edit Mode';
    adminEditModeBtn.style.background = isEditMode ? '#27ae60' : 'linear-gradient(135deg, #7b2cbf, #9d4edd)';
    loadProducts();
}

if (adminEditModeBtn) {
    adminEditModeBtn.addEventListener('click', toggleEditMode);
}

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Google orqali kirish tugmasi bosilganda
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login error:", error);
        }
    });
}

// Chiqish tugmasi bosilganda
if (googleLogoutBtn) {
    googleLogoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    });
}

// Autentifikatsiya holatini kuzatish
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        if (googleLoginBtn) googleLoginBtn.style.display = 'none';
        if (userProfileArea) userProfileArea.style.display = 'flex';
        if (headerUserAvatar) headerUserAvatar.src = user.photoURL || 'assets/Fits_Me.jpeg';

        // Faqat admin emaillariga Admin Panel tugmasini ko'rsatish
        if (ADMIN_EMAILS.includes(user.email)) {
            if (adminPanelBtn) adminPanelBtn.style.display = 'flex';
            if (adminEditModeBtn) adminEditModeBtn.style.display = 'flex';
        }
    } else {
        if (googleLoginBtn) googleLoginBtn.style.display = 'flex';
        if (userProfileArea) userProfileArea.style.display = 'none';
        if (adminPanelBtn) adminPanelBtn.style.display = 'none';
        if (adminEditModeBtn) {
            adminEditModeBtn.style.display = 'none';
            isEditMode = false;
            loadProducts();
        }
    }
});

// User ID
// Doimiy bitta User ID olish (localStorage orqali)
let userId = localStorage.getItem('chat_user_id');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('chat_user_id', userId);
}
console.log("Mening Doimiy User ID'm:", userId);

if (chatToggle) chatToggle.addEventListener('click', () => chatBox.classList.toggle('active'));
if (closeChat) closeChat.addEventListener('click', () => chatBox.classList.remove('active'));

// Real-time chat (Firestore)
const messagesRef = collection(db, `chats/${userId}/messages`);
const q = query(messagesRef, orderBy('createdAt', 'asc'));

onSnapshot(q, (snapshot) => {
    chatBody.innerHTML = '';
    if (snapshot.empty) {
        chatBody.innerHTML = `
            <div class="message admin-msg">
                <p>Hello! Leave your message, and we will reply shortly. 😊</p>
                <span class="msg-time">Just now</span>
            </div>
        `;
        return;
    }
    snapshot.forEach((docSnap) => {
        let msg = docSnap.data();
        let msgClass = msg.sender === 'admin' ? 'admin-msg' : 'user-msg';
        let html = `
            <div class="message ${msgClass}">
                <p>${escapeHTML(msg.text || '')}</p>
                <span class="msg-time">Just now</span>
            </div>
        `;
        chatBody.insertAdjacentHTML('beforeend', html);
    });
    chatBody.scrollTop = chatBody.scrollHeight;
});

async function sendUserMessage() {
    let text = chatInput.value.trim();
    console.log("Yuborilayotgan matn:", text); // Konsolda tekshirish uchun
    if(text === '') return;

    try {
        await addDoc(collection(db, `chats/${userId}/messages`), {
            text: text,
            sender: 'user',
            createdAt: serverTimestamp()
        });
        chatInput.value = '';
        console.log("Xabar muvaffaqiyatli ketdi!");
    } catch(e) {
        console.error("Xatolik yuz berdi:", e);
    }
}

if (sendBtn) {
    sendBtn.onclick = () => {
        sendUserMessage();
    };
}

if (chatInput) {
    chatInput.onkeypress = (e) => {
        if(e.key === 'Enter') {
            sendUserMessage();
        }
    };
}

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeProducts();
    loadProducts();
    
    // Close modal when clicking outside
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
});