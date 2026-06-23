import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const resourceCards = document.querySelectorAll('.card');
const bookmarkForm = document.getElementById('bookmark-form');
const linkName = document.getElementById('link-name');
const linkUrl = document.getElementById('link-url');
const customLinksList = document.getElementById('custom-links-list');
const scratchpad = document.getElementById('scratchpad');
const provider = new GoogleAuthProvider();
const loginBtn = document.getElementById('login-btn');
const userProfile = document.getElementById('user-profile');
const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// Notebook Elements
const noteListMenu = document.getElementById('note-list');
const addNoteBtn = document.getElementById('add-note-btn');

const customIconMap = {
    "docs.google.com": "https://img.icons8.com/color/96/google-docs--v1.png",
    "sheets.google.com": "https://img.icons8.com/color/96/google-sheets.png",
    "slides.google.com": "https://img.icons8.com/color/96/google-slides.png",
    "drive.google.com": "https://img.icons8.com/color/96/google-drive.png",
    "www.gmail.com": "https://img.icons8.com/color/96/gmail.png",
    "github.com": "https://github.githubassets.com/favicons/favicon.svg",
    "web.whatsapp.com": "https://img.icons8.com/color/96/whatsapp.png",
};

// --- NOTEBOOK CORE STATE & LOGIC ---
let notes = [];
let activeNoteId = null;

function renderNoteList() {
    if (!noteListMenu) return;
    noteListMenu.innerHTML = '';

    if (notes.length === 0) {
        scratchpad.value = '';
        scratchpad.placeholder = 'Click "+ New Note" above to create your first note!';
        scratchpad.disabled = true;
        return;
    }

    scratchpad.disabled = false;
    scratchpad.placeholder = 'Drop temporary code snippets, assignment dates, or commands here...';

    const activeNoteExists = notes.some(n => n.id === activeNoteId);
    if (!activeNoteExists && notes.length > 0) {
        activeNoteId = notes[0].id;
    }

    notes.forEach(note => {
        const li = document.createElement('li');
        li.className = `note-list-item ${note.id === activeNoteId ? 'active' : ''}`;
        li.innerHTML = `
            <span class="note-title">${note.title}</span>
            <button class="delete-note-btn" data-id="${note.id}">&times;</button>
        `;

        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-note-btn')) return;
            activeNoteId = note.id;
            scratchpad.value = note.content;
            renderNoteList();
        });

        const deleteBtn = li.querySelector('.delete-note-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${note.title}"?`)) {
                    notes = notes.filter(n => n.id !== note.id);
                    if (activeNoteId === note.id) {
                        activeNoteId = notes[0]?.id || null;
                    }
                    saveNotes();
                    renderNoteList();
                    const activeNote = notes.find(n => n.id === activeNoteId);
                    scratchpad.value = activeNote ? activeNote.content : '';
                }
            });
        }
        noteListMenu.appendChild(li);
    });
}

function saveNotes() {
    saveUserDataToCloud();
}

if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
        const title = prompt("Enter note title:", "New Note");
        if (title && title.trim() !== '') {
            const newNote = { id: Date.now().toString(), title: title.trim(), content: '' };
            notes.push(newNote);
            activeNoteId = newNote.id;
            scratchpad.value = '';
            renderNoteList();
            saveNotes();
            noteListMenu.scrollTop = noteListMenu.scrollHeight;
        }
    });
}

let typingTimer;
scratchpad.addEventListener('input', (e) => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
        activeNote.content = e.target.value;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            saveUserDataToCloud();
        }, 1000);
    }
});

// --- BOOKMARKS LOGIC ---
let savedLinks = [];

function getFaviconUrl(domain) {
    if (customIconMap[domain]) {
        return customIconMap[domain];
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function displayCustomLinks() {
    customLinksList.innerHTML = '';

    if (savedLinks.length === 0) {
        customLinksList.innerHTML = `<li style="color: var(--text-muted); font-size: 0.8rem; padding: 0 5px; white-space: nowrap;">Empty</li>`;
        return;
    }

    savedLinks.forEach((link, index) => {
        const li = document.createElement('li');
        let domain = '';
        try {
            domain = new URL(link.url).hostname;
        } catch (e) {
            domain = '';
        }

        const faviconUrl = getFaviconUrl(domain);

        li.innerHTML = `
            <div class="link-wrapper" title="${link.name}">
                <a href="${link.url}" target="_blank">
                    <img src="${faviconUrl}" class="favicon" alt="${link.name}" onerror="this.style.display='none'">
                </a>
            </div>
            <button class="delete-link-btn" onclick="deleteLink(${index})" aria-label="Delete Bookmark">×</button>
        `;
        customLinksList.appendChild(li);
    });
}

bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newLink = { name: linkName.value, url: linkUrl.value };
    savedLinks.push(newLink);
    displayCustomLinks();
    saveUserDataToCloud();
    linkName.value = '';
    linkUrl.value = '';
});

window.deleteLink = function (index) {
    savedLinks.splice(index, 1);
    displayCustomLinks();
    saveUserDataToCloud();
}

// --- STATIC LINKS ICON GENERATION ---
function displayStaticLinksIcons() {
    const staticLinks = document.querySelectorAll('.card:not([data-category="custom personal favorites"]) .link-list a');

    staticLinks.forEach(link => {
        let domain = '';
        try {
            domain = new URL(link.href).hostname;
        } catch (e) {
            return;
        }

        const faviconUrl = getFaviconUrl(domain);
        const wrapper = document.createElement('div');
        wrapper.className = 'link-wrapper';

        const img = document.createElement('img');
        img.src = faviconUrl;
        img.className = 'favicon';
        img.alt = '';
        img.setAttribute('onerror', "this.style.display='none'");

        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(img);
        wrapper.appendChild(link);
    });
}

// Initialize Lists and Icons
displayStaticLinksIcons();
displayCustomLinks();
renderNoteList();

// --- CATEGORY NAV FILTER LOGIC ---
const menuItems = document.querySelectorAll('#category-menu li');

function applyCategoryFilter(targetId) {
    resourceCards.forEach(card => {
        if (targetId === 'all' || card.getAttribute('id') === targetId) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        applyCategoryFilter(target);
    });
});

// --- CLOUD SYNC LOGIC ---
async function saveUserDataToCloud() {
    if (!window.auth.currentUser) return;
    try {
        const userId = window.auth.currentUser.uid;
        await setDoc(doc(window.db, "users", userId), {
            links: savedLinks,
            notes: notes,
            updatedAt: new Date()
        });
        console.log("Cloud synchronized successfully!");
    } catch (e) {
        console.error("Error syncing with cloud: ", e);
    }
}

onAuthStateChanged(window.auth, async (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userNameSpan = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (user) {
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';

        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        userNameSpan.textContent = `Hi, ${firstName}`;

        if (user.photoURL) {
            userAvatar.src = user.photoURL;
            userAvatar.style.display = 'block';
        } else {
            userAvatar.style.display = 'none';
        }

        const docRef = doc(window.db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            savedLinks = data.links || [];
            notes = data.notes || [];
        } else {
            savedLinks = [];
            notes = [];
            await saveUserDataToCloud();
        }

        activeNoteId = notes[0]?.id || null;
        const cloudActiveNote = notes.find(n => n.id === activeNoteId);
        scratchpad.value = cloudActiveNote ? cloudActiveNote.content : '';

        displayCustomLinks();
        renderNoteList();
    } else {
        loginBtn.style.display = 'block';
        userProfile.style.display = 'none';
        userNameSpan.textContent = '';

        savedLinks = [];
        notes = [];
        activeNoteId = null;
        scratchpad.value = '';

        displayCustomLinks();
        renderNoteList();
    }
});

// --- AUTH UI BINDINGS ---
const profileTrigger = document.getElementById('profile-trigger');
const dropdownMenu = document.getElementById('dropdown-menu');
const userProfileContainer = document.getElementById('user-profile');

profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
    userProfileContainer.classList.toggle('active');
});

document.addEventListener('click', () => {
    dropdownMenu.classList.remove('show');
    userProfileContainer.classList.remove('active');
});

logoutBtn.onclick = () => {
    signOut(window.auth).catch((error) => console.error("Logout Error:", error));
};

document.getElementById('login-btn').onclick = () => {
    signInWithPopup(window.auth, provider);
};

// --- BOOKMARK MODAL ---
const modal = document.getElementById('add-link-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

openModalBtn.addEventListener('click', () => {
    modal.classList.add('show');
});

const closeModal = () => {
    modal.classList.remove('show');
};

closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

document.getElementById('bookmark-form').addEventListener('submit', () => {
    document.getElementById('add-link-modal').classList.remove('show');
    setTimeout(() => {
        document.getElementById('bookmark-form').reset();
    }, 100);
});