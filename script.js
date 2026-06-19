import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const searchBar = document.getElementById('search-bar');
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

// New Notebook Elements
const notebookTabs = document.getElementById('notebook-tabs');
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

// --- MULTI-NOTEBOOK CORE STATE & LOGIC ---
let notes = JSON.parse(localStorage.getItem('study_companion_notes')) || [
    { id: Date.now().toString(), title: 'Main Note', content: localStorage.getItem('study_companion_scratchpad') || '' }
];
let activeNoteId = notes[0]?.id;

function renderTabs() {
    if (!notebookTabs) return;
    notebookTabs.innerHTML = '';

    notes.forEach(note => {
        const tab = document.createElement('button');
        tab.className = `note-tab ${note.id === activeNoteId ? 'active' : ''}`;
        tab.innerHTML = `
            ${note.title}
            ${notes.length > 1 ? `<span class="delete-note-btn" data-id="${note.id}">&times;</span>` : ''}
        `;

        // Switch tab content
        tab.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-note-btn')) return;
            activeNoteId = note.id;
            scratchpad.value = note.content;
            renderTabs();
        });

        // Delete tab action
        const deleteBtn = tab.querySelector('.delete-note-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${note.title}"?`)) {
                    notes = notes.filter(n => n.id !== note.id);
                    if (activeNoteId === note.id) activeNoteId = notes[0].id;
                    saveNotes();
                    renderTabs();
                    scratchpad.value = notes.find(n => n.id === activeNoteId).content;
                }
            });
        }
        notebookTabs.appendChild(tab);
    });
}

function saveNotes() {
    localStorage.setItem('study_companion_notes', JSON.stringify(notes));
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
            renderTabs();
            saveNotes();
        }
    });
}

let typingTimer;
scratchpad.addEventListener('input', (e) => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
        activeNote.content = e.target.value;
        localStorage.setItem('study_companion_notes', JSON.stringify(notes));

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            saveUserDataToCloud();
        }, 1000);
    }
});

// Setup Initial Text Area View
scratchpad.value = notes.find(n => n.id === activeNoteId)?.content || '';
renderTabs();


// --- BOOKMARKS LOGIC ---
let savedLinks = JSON.parse(localStorage.getItem('study_companion_links')) || [];

function getFaviconUrl(domain) {
    if (customIconMap[domain]) {
        return customIconMap[domain];
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function displayCustomLinks() {
    customLinksList.innerHTML = '';

    if (savedLinks.length === 0) {
        customLinksList.innerHTML = `<li style="color: var(--text-muted); font-size: 0.9rem;">No custom links added yet.</li>`;
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
            <div class="link-wrapper">
                <img src="${faviconUrl}" class="favicon" alt="" onerror="this.style.display='none'">
                <a href="${link.url}" target="_blank">${link.name}</a>
            </div>
            <button class="delete-link-btn" onclick="deleteLink(${index})" aria-label="Delete Bookmark">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        customLinksList.appendChild(li);
    });
}

bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newLink = {
        name: linkName.value,
        url: linkUrl.value
    };

    savedLinks.push(newLink);
    localStorage.setItem('study_companion_links', JSON.stringify(savedLinks));
    displayCustomLinks();

    saveUserDataToCloud();

    linkName.value = '';
    linkUrl.value = '';
});

window.deleteLink = function (index) {
    savedLinks.splice(index, 1);
    localStorage.setItem('study_companion_links', JSON.stringify(savedLinks));
    displayCustomLinks();
    saveUserDataToCloud();
}

displayCustomLinks();


// --- FILTER & STATIC SEARCH LOGIC ---
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

displayStaticLinksIcons();

const menuItems = document.querySelectorAll('.menu-list li');

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

        if (searchBar.value !== '') {
            searchBar.value = '';
        }
    });
});

searchBar.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();

    if (term === '') {
        const activeTarget = document.querySelector('.menu-list li.active').getAttribute('data-target');
        applyCategoryFilter(activeTarget);
        return;
    }

    resourceCards.forEach(card => {
        const categoryData = card.getAttribute('data-category');
        const keywords = categoryData ? categoryData.toLowerCase() : "";
        const contentText = card.textContent.toLowerCase();

        if (keywords.includes(term) || contentText.includes(term)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});


// --- CLOUD SYNC LOGIC ---
async function saveUserDataToCloud() {
    if (!window.auth.currentUser) return;

    try {
        const userId = window.auth.currentUser.uid;
        await setDoc(doc(window.db, "users", userId), {
            links: savedLinks,
            notes: notes, // Syncing notebook array instead of basic text field
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

            // Safe Sync Fallback: Convert legacy cloud string to structured object arrays
            if (data.notes && data.notes.length > 0) {
                notes = data.notes;
            } else {
                notes = [{ id: Date.now().toString(), title: 'Main Note', content: data.scratchpadText || '' }];
            }
        } else {
            savedLinks = JSON.parse(localStorage.getItem('study_companion_links')) || [];
            notes = JSON.parse(localStorage.getItem('study_companion_notes')) || [
                { id: Date.now().toString(), title: 'Main Note', content: localStorage.getItem('study_companion_scratchpad') || '' }
            ];
            await saveUserDataToCloud();
        }

        activeNoteId = notes[0]?.id;
        scratchpad.value = notes.find(n => n.id === activeNoteId)?.content || '';

        localStorage.setItem('study_companion_links', JSON.stringify(savedLinks));
        localStorage.setItem('study_companion_notes', JSON.stringify(notes));

        displayCustomLinks();
        renderTabs();
    } else {
        loginBtn.style.display = 'block';
        userProfile.style.display = 'none';
        userNameSpan.textContent = '';

        savedLinks = JSON.parse(localStorage.getItem('study_companion_links')) || [];
        notes = JSON.parse(localStorage.getItem('study_companion_notes')) || [
            { id: Date.now().toString(), title: 'Main Note', content: localStorage.getItem('study_companion_scratchpad') || '' }
        ];

        activeNoteId = notes[0]?.id;
        scratchpad.value = notes.find(n => n.id === activeNoteId)?.content || '';

        displayCustomLinks();
        renderTabs();
    }
});


// --- AUTH INTERFACE UI BINDINGS ---
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


// --- BOOKMARK TRIGGER MODAL UI ---
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