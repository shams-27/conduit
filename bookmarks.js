/* ==========================================================================
   BOOKMARK TRAY
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. ELEMENTS & STATE
   -------------------------------------------------------------------------- */

const bookmarkForm = document.getElementById('bookmark-form');
const linkName = document.getElementById('link-name');
const linkUrl = document.getElementById('link-url');
const customLinksList = document.getElementById('custom-links-list');

// In-memory bookmark store, synced with localStorage
let savedLinks = [];

/* --------------------------------------------------------------------------
   2. RENDER & MUTATE
   -------------------------------------------------------------------------- */

// Re-renders the bookmark tray from savedLinks.
function displayCustomLinks() {
    customLinksList.innerHTML = '';
    if (savedLinks.length === 0) return;

    savedLinks.forEach((link, index) => {
        let domain = '';
        try { domain = new URL(link.url).hostname; } catch { /* leave empty */ }

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="link-wrapper" title="${link.name}">
                <a href="${link.url}" target="_blank">
                    <img src="${getFaviconUrl(domain)}" class="favicon" alt="${link.name}" onerror="this.style.display='none'">
                </a>
            </div>
            <button class="delete-link-btn" onclick="deleteLink(${index})" aria-label="Delete Bookmark">×</button>
        `;
        customLinksList.appendChild(li);
    });
}

/**
 * Removes a tray bookmark at the given index.
 * @param {number} index
 */
window.deleteLink = function (index) {
    savedLinks.splice(index, 1);
    displayCustomLinks();
    saveUserData();
};

// Add new tray bookmark on form submission
bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savedLinks.push({ name: linkName.value, url: linkUrl.value });
    displayCustomLinks();
    saveUserData();
    linkName.value = '';
    linkUrl.value = '';
});

/* --------------------------------------------------------------------------
   3. ADD-BOOKMARK MODAL
   -------------------------------------------------------------------------- */

const addLinkModal = document.getElementById('add-link-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

openModalBtn.addEventListener('click', () => openModal('add-link-modal'));
closeModalBtn.addEventListener('click', () => closeModal('add-link-modal'));

addLinkModal.addEventListener('click', (e) => {
    if (e.target === addLinkModal) closeModal('add-link-modal');
});

bookmarkForm.addEventListener('submit', () => {
    closeModal('add-link-modal');
    setTimeout(() => bookmarkForm.reset(), 100);
});

/* --------------------------------------------------------------------------
   4. LOCAL PERSISTENCE (localStorage)
   -------------------------------------------------------------------------- */

const LINKS_STORAGE_KEY = 'conduit.customLinks';

// Persists savedLinks to localStorage.
function saveUserData() {
    try {
        localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(savedLinks));
    } catch (error) {
        console.error("Local save failed:", error);
    }
}

// Loads bookmarks from localStorage.
function loadAndApplyUserData() {
    let links = [];

    try {
        const raw = localStorage.getItem(LINKS_STORAGE_KEY);
        if (raw) links = JSON.parse(raw);
    } catch (error) {
        console.error("Local load failed:", error);
    }

    savedLinks = Array.isArray(links) ? links : [];

    displayCustomLinks();
    applyMasonryLayout();
}

loadAndApplyUserData();