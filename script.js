import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ==========================================================================
   1. DOM ELEMENT SELECTORS & GLOBAL CONFIGURATION
   ========================================================================== */

// Resource grid container
const grid = document.getElementById('resources-grid');

// Tray bookmark elements
const bookmarkForm = document.getElementById('bookmark-form');
const linkName = document.getElementById('link-name');
const linkUrl = document.getElementById('link-url');
const customLinksList = document.getElementById('custom-links-list');

// Auth elements
const loginBtn = document.getElementById('login-btn');
const userProfileContainer = document.getElementById('user-profile');
const profileTrigger = document.getElementById('profile-trigger');
const dropdownMenu = document.getElementById('dropdown-menu');
const userNameSpan = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// Calendar elements
const calendarDropdown = document.getElementById('calendar-dropdown');
const calendarTrigger = document.getElementById('calendar-trigger');
const calendarMenu = document.getElementById('calendar-menu');

// DIU Hub dropdown elements
const hubDropdown = document.getElementById('diu-hub-dropdown');
const hubTrigger = document.getElementById('hub-trigger');
const hubMenu = document.getElementById('hub-menu');

// Firebase Auth provider
const provider = new GoogleAuthProvider();

/**
 * Custom favicon overrides for domains where Google's favicon service
 * returns a low-quality or incorrect icon.
 */
const CUSTOM_ICON_MAP = {
    "docs.google.com": "https://img.icons8.com/?size=100&id=hHRwFYjODaR4&format=png&color=000000",
    "sheets.google.com": "https://img.icons8.com/?size=100&id=qrAVeBIrsjod&format=png&color=000000",
    "slides.google.com": "https://img.icons8.com/?size=100&id=joSAjc9l7dOp&format=png&color=000000",
    "drive.google.com": "https://img.icons8.com/?size=100&id=eKDChMKt75eu&format=png&color=000000",
    "www.gmail.com": "https://img.icons8.com/?size=100&id=qyRpAggnV0zH&format=png&color=000000",
    "github.com": "https://img.icons8.com/?size=100&id=YSWCDCSF4H3N&format=png&color=FFFFFF",
    "web.whatsapp.com": "https://img.icons8.com/?size=100&id=AltfLkFSP7XN&format=png&color=000000",
    "passwords.google.com": "https://img.icons8.com/?size=100&id=KeCyyDy6KmOt&format=png&color=000000",
    "claude.ai": "https://img.icons8.com/?size=100&id=zQjzFjPpT2Ek&format=png&color=000000",
    "www.leetcode.com": "https://img.icons8.com/?size=100&id=wDGo581Ea5Nf&format=png&color=000000",
    "www.evernote.com": "https://img.icons8.com/?size=100&id=HsV0BZAmh5Qy&format=png&color=000000",
};

// In-memory tray bookmark store; populated from localStorage or Firestore.
let savedLinks = [];

/* ==========================================================================
   2. HELPER UTILITIES
   ========================================================================== */

/**
 * Returns the best available favicon URL for a given domain.
 * Falls back to Google's favicon service when no custom override exists.
 *
 * @param {string} domain - The hostname of the target URL.
 * @returns {string} A URL pointing to the favicon image.
 */
function getFaviconUrl(domain) {
    return CUSTOM_ICON_MAP[domain] ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/**
 * Closes all open navigation dropdowns and removes their active states.
 * Called on any outside click to reset the header to its default state.
 */
function closeAllDropdowns() {
    dropdownMenu.classList.remove('show');
    userProfileContainer.classList.remove('active');
    hubMenu.classList.remove('show');
    hubDropdown.classList.remove('active');
    calendarMenu.classList.remove('show');
    calendarDropdown.classList.remove('active');
}

/* ==========================================================================
   3. MODAL HELPERS
   ========================================================================== */

/**
 * Opens a modal overlay by ID.
 * @param {string} id - The element ID of the modal overlay.
 */
function openModal(id) {
    document.getElementById(id)?.classList.add('show');
}

/**
 * Closes a modal overlay by ID.
 * @param {string} id - The element ID of the modal overlay.
 */
function closeModal(id) {
    document.getElementById(id)?.classList.remove('show');
}

// Generic close-button handler — any button with data-close="<modal-id>"
// will close that modal without needing individual event listeners.
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

// Close on backdrop click for all modals
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

/* ==========================================================================
   4. NAVIGATION DROPDOWN CONTROLLERS
   ========================================================================== */

/**
 * Toggles a target dropdown while closing all others first.
 * Prevents click events from bubbling up to the document close listener.
 *
 * @param {Event}   e             - The originating click event.
 * @param {Element} menuToToggle  - The menu element to show/hide.
 * @param {Element} triggerParent - The container to mark as active.
 */
function toggleDropdown(e, menuToToggle, triggerParent) {
    e.stopPropagation();
    const wasOpen = menuToToggle.classList.contains('show');
    closeAllDropdowns();
    if (!wasOpen) {
        menuToToggle.classList.add('show');
        triggerParent.classList.add('active');
    }
}

profileTrigger.addEventListener('click', (e) => toggleDropdown(e, dropdownMenu, userProfileContainer));
hubTrigger.addEventListener('click', (e) => toggleDropdown(e, hubMenu, hubDropdown));
calendarTrigger.addEventListener('click', (e) => toggleDropdown(e, calendarMenu, calendarDropdown));

// Prevent clicks inside open menus from bubbling to the document
[calendarMenu, hubMenu, dropdownMenu].forEach(menu => {
    menu.addEventListener('click', (e) => e.stopPropagation());
});

document.addEventListener('click', closeAllDropdowns);

/* ==========================================================================
   5. CALENDAR WIDGET
   ========================================================================== */

const monthYearDisplay = document.getElementById('calendar-month-year');
const calendarDaysContainer = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Tracks which month/year is currently displayed in the calendar widget.
let calendarDate = new Date();

/**
 * Renders the calendar grid for the month stored in `calendarDate`.
 * Highlights today's date and pads the grid with empty cells to align
 * the first day to the correct weekday column.
 */
function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const today = new Date();

    monthYearDisplay.textContent = calendarDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let html = '<div class="calendar-day empty"></div>'.repeat(firstDayOfWeek);

    for (let day = 1; day <= totalDays; day++) {
        const isToday = (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">${day}</div>`;
    }

    calendarDaysContainer.innerHTML = html;
}

prevMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();

/* ==========================================================================
   6. STATIC LINK ENHANCEMENTS (ICONS & SORTING)
   ========================================================================== */

/**
 * Alphabetically sorts all items in the DIU Hub dropdown by visible text.
 */
function sortHubMenu() {
    const menu = document.getElementById('hub-menu');
    if (!menu) return;
    Array.from(menu.querySelectorAll('.hub-item'))
        .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
        .forEach(item => menu.appendChild(item));
}

/**
 * Alphabetically sorts the links within every built-in resource card.
 */
function sortResourceCardLinks() {
    document.querySelectorAll('.resources-grid .card').forEach(card => {
        const list = card.querySelector('.link-list');
        if (!list) return;
        Array.from(list.querySelectorAll('li'))
            .sort((a, b) => {
                const textA = a.querySelector('a')?.textContent.trim() ?? '';
                const textB = b.querySelector('a')?.textContent.trim() ?? '';
                return textA.localeCompare(textB);
            })
            .forEach(item => list.appendChild(item));
    });
}

/**
 * Wraps each static link in a `.link-wrapper` div and prepends its favicon.
 */
function injectStaticLinkIcons() {
    const staticLinks = document.querySelectorAll('.card .link-list a');

    staticLinks.forEach(link => {
        // Skip links already wrapped (e.g. after a re-render)
        if (link.parentElement.classList.contains('link-wrapper')) return;

        let domain = '';
        try { domain = new URL(link.href).hostname; } catch { return; }

        const wrapper = document.createElement('div');
        wrapper.className = 'link-wrapper';

        const img = document.createElement('img');
        img.src = getFaviconUrl(domain);
        img.className = 'favicon';
        img.alt = '';
        img.setAttribute('onerror', "this.style.display='none'");

        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(img);
        wrapper.appendChild(link);
    });
}

// Run all static enhancements once on startup
sortHubMenu();
sortResourceCardLinks();
injectStaticLinkIcons();

/* ==========================================================================
   7. TRAY BOOKMARK MANAGEMENT
   ========================================================================== */

/**
 * Re-renders the bookmark tray from the `savedLinks` array.
 * Each entry displays a favicon linked to its URL with a delete button.
 */
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
 * Removes a tray bookmark at the given index, updates the display,
 * and persists the change.
 * Exposed on `window` for use in inline onclick attributes.
 *
 * @param {number} index - Zero-based index of the bookmark to remove.
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

/* ==========================================================================
   8. TRAY BOOKMARK MODAL
   ========================================================================== */

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

/* ==========================================================================
   9. CLOUD DATA SYNCHRONIZATION (FIREBASE AUTH & FIRESTORE)
   ========================================================================== */

/**
 * Writes `savedLinks` to the authenticated user's Firestore document.
 * No-ops silently when no user is signed in (guest data stays local).
 */
async function saveUserData() {
    if (!window.auth?.currentUser) return;

    try {
        await setDoc(doc(window.db, "users", window.auth.currentUser.uid), {
            links: savedLinks,
            updatedAt: new Date(),
        });
        console.log("Cloud sync successful.");
    } catch (error) {
        console.error("Cloud sync failed:", error);
    }
}

/**
 * Loads the user's bookmark tray links and applies them.
 * Prefers Firestore when signed in; guests get an empty tray.
 *
 * @param {import("firebase/auth").User|null} user
 */
async function loadAndApplyUserData(user) {
    let data = { links: [] };

    if (user) {
        // Signed in — fetch from Firestore
        const docRef = doc(window.db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const d = docSnap.data();
            data.links = d.links ?? [];
        } else {
            // First-time sign-in — seed with empty doc
            await saveUserData();
        }
    }

    savedLinks = data.links;

    displayCustomLinks();
    applyMasonryLayout();
}

/**
 * Responds to Firebase auth state changes.
 * Updates the header UI and triggers a full data load/unload.
 */
onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        userProfileContainer.style.display = 'flex';

        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        userNameSpan.textContent = `Hi, ${firstName}`;

        if (user.photoURL) {
            userAvatar.src = user.photoURL;
            userAvatar.style.display = 'block';
        } else {
            userAvatar.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'block';
        userProfileContainer.style.display = 'none';
        userNameSpan.textContent = '';
    }

    await loadAndApplyUserData(user);
});

// Auth action handlers
loginBtn.onclick = () => signInWithPopup(window.auth, provider);
logoutBtn.onclick = () =>
    signOut(window.auth)
        .then(closeAllDropdowns)
        .catch((error) => console.error("Logout error:", error));

/* ==========================================================================
   10. MASONRY GRID LAYOUT
   ========================================================================== */

/**
 * Arranges all cards into a balanced masonry layout: each card is placed
 * into whichever column currently has the least content, so column
 * heights stay even instead of one column towering over its neighbors
 * (the browser's default grid auto-placement only avoids overlaps, it
 * doesn't try to balance column heights).
 * Re-run whenever card content changes or the viewport is resized.
 */
function applyMasonryLayout() {
    const cards = Array.from(grid.querySelectorAll('.card'));
    if (cards.length === 0) return;

    // Clear previous placement so each card's natural height is measured
    cards.forEach(card => {
        card.style.gridColumn = '';
        card.style.gridRow = '';
    });

    const columnCount = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const columnHeights = new Array(columnCount).fill(0);
    const ROW_GAP = 16; // vertical spacing between stacked cards in a column

    cards.forEach(card => {
        // Find the currently shortest column
        let col = 0;
        for (let i = 1; i < columnCount; i++) {
            if (columnHeights[i] < columnHeights[col]) col = i;
        }

        const rowStart = Math.round(columnHeights[col]) + 1;
        const height = card.offsetHeight;

        card.style.gridColumn = String(col + 1);
        card.style.gridRow = `${rowStart} / span ${Math.ceil(height)}`;

        columnHeights[col] += height + ROW_GAP;
    });
}

window.addEventListener('load', applyMasonryLayout);
window.addEventListener('resize', applyMasonryLayout);
applyMasonryLayout();
