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

/**
 * Only allows http/https URLs. Blocks javascript:, data:, and other
 * schemes that could be used to inject scripts via a stored bookmark.
 * If the input has no scheme at all (e.g. "github.com" or
 * "diu.edu.bd/portal"), assumes https:// rather than rejecting it —
 * most people don't type the protocol by hand.
 * @param {string} rawUrl
 * @returns {string|null} the normalized URL, or null if it's not safe
 */
function sanitizeBookmarkUrl(rawUrl) {
    const trimmed = (rawUrl ?? '').trim();
    if (!trimmed) return null;

    // No "scheme:" prefix at all -> assume https
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
        // Reject bare schemes with no real host, e.g. "https://" or "https:///"
        if (!parsed.hostname) return null;
        return parsed.href;
    } catch {
        return null;
    }
}

// Re-renders the bookmark tray from savedLinks.
// Built with DOM APIs (not innerHTML) so a bookmark name/url can never be
// interpreted as markup.
function displayCustomLinks() {
    customLinksList.innerHTML = '';
    if (savedLinks.length === 0) return;

    savedLinks.forEach((link, index) => {
        let domain = '';
        try { domain = new URL(link.url).hostname; } catch { /* leave empty */ }

        const li = document.createElement('li');

        const wrapper = document.createElement('div');
        wrapper.className = 'link-wrapper';
        wrapper.title = link.name;

        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        const img = document.createElement('img');
        img.src = getFaviconUrl(domain);
        img.className = 'favicon';
        img.alt = link.name;
        img.addEventListener('error', () => { img.style.display = 'none'; });

        a.appendChild(img);
        wrapper.appendChild(a);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-link-btn';
        deleteBtn.setAttribute('aria-label', `Delete ${link.name} bookmark`);
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteLink(index));

        li.appendChild(wrapper);
        li.appendChild(deleteBtn);
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

    const safeUrl = sanitizeBookmarkUrl(linkUrl.value);
    if (!safeUrl) {
        linkUrl.setCustomValidity('Please enter a valid http:// or https:// URL.');
        linkUrl.reportValidity();
        return; // bail before saving/closing — nothing was added
    }
    linkUrl.setCustomValidity('');

    const name = linkName.value.trim().slice(0, 60) || safeUrl;
    savedLinks.push({ name, url: safeUrl });
    displayCustomLinks();
    saveUserData();

    closeModal('add-link-modal');
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

    savedLinks = (Array.isArray(links) ? links : [])
        .map(link => ({ name: String(link?.name ?? '').slice(0, 60), url: sanitizeBookmarkUrl(link?.url) }))
        .filter(link => link.url);

    displayCustomLinks();
    applyMasonryLayout();
}

loadAndApplyUserData();
