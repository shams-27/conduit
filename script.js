import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ==========================================================================
   1. DOM ELEMENT SELECTORS & GLOBAL CONFIGURATION
   ========================================================================== */

// Resource & Bookmark Elements
const resourceCards = document.querySelectorAll('.card');
const bookmarkForm = document.getElementById('bookmark-form');
const linkName = document.getElementById('link-name');
const linkUrl = document.getElementById('link-url');
const customLinksList = document.getElementById('custom-links-list');

// Auth Elements
const loginBtn = document.getElementById('login-btn');
const userProfileContainer = document.getElementById('user-profile');
const profileTrigger = document.getElementById('profile-trigger');
const dropdownMenu = document.getElementById('dropdown-menu');
const userNameSpan = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// Calendar Elements
const calendarDropdown = document.getElementById('calendar-dropdown');
const calendarTrigger = document.getElementById('calendar-trigger');
const calendarMenu = document.getElementById('calendar-menu');

// DIU Hub Dropdown Elements
const hubDropdown = document.getElementById('diu-hub-dropdown');
const hubTrigger = document.getElementById('hub-trigger');
const hubMenu = document.getElementById('hub-menu');

// Firebase Auth Provider
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
};

// In-memory bookmark store; populated from localStorage or Firestore on load.
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
 * Closes all open navigation dropdowns and removes their active state.
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
   3. NAVIGATION DROPDOWN CONTROLLERS
   ========================================================================== */

/**
 * Toggles a target dropdown while closing all others.
 * Prevents click events from bubbling up to the document listener.
 *
 * @param {Event}    e              - The originating click event.
 * @param {Element}  menuToToggle   - The menu element to show/hide.
 * @param {Element}  triggerParent  - The container to mark as active.
 */
function toggleDropdown(e, menuToToggle, triggerParent) {
    e.stopPropagation();
    closeAllDropdowns();
    menuToToggle.classList.toggle('show');
    triggerParent.classList.toggle('active');
}

// Profile dropdown
profileTrigger.addEventListener('click', (e) => {
    toggleDropdown(e, dropdownMenu, userProfileContainer);
});

// DIU Hub dropdown
hubTrigger.addEventListener('click', (e) => {
    toggleDropdown(e, hubMenu, hubDropdown);
});

// Calendar dropdown
calendarTrigger.addEventListener('click', (e) => {
    toggleDropdown(e, calendarMenu, calendarDropdown);
});

// Prevent clicks inside any open menu from propagating to the document
[calendarMenu, hubMenu, dropdownMenu].forEach(menu => {
    menu.addEventListener('click', (e) => e.stopPropagation());
});

// Close all menus when clicking anywhere outside them
document.addEventListener('click', closeAllDropdowns);

/* ==========================================================================
   4. CALENDAR WIDGET
   ========================================================================== */

const monthYearDisplay = document.getElementById('calendar-month-year');
const calendarDaysContainer = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Tracks which month/year is currently displayed in the calendar widget
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
        year: 'numeric'
    });

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Empty offset cells to align day 1 to the correct weekday column
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
   5. STATIC LINK ENHANCEMENTS (ICONS & SORTING)
   ========================================================================== */

/**
 * Alphabetically sorts all items in the DIU Hub dropdown menu by their
 * visible link text.
 */
function sortHubMenu() {
    const menu = document.getElementById('hub-menu');
    if (!menu) return;

    Array.from(menu.querySelectorAll('.hub-item'))
        .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
        .forEach(item => menu.appendChild(item));
}

/**
 * Alphabetically sorts the links within every resource card by their
 * anchor text.
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
 * Wraps each static link in a `.link-wrapper` div and prepends its
 * favicon image. Skips the custom bookmarks card to avoid duplication
 * (custom links handle their own icon injection via `displayCustomLinks`).
 */
function injectStaticLinkIcons() {
    const staticLinks = document.querySelectorAll(
        '.card:not([data-category="custom personal favorites"]) .link-list a'
    );

    staticLinks.forEach(link => {
        let domain = '';
        try {
            domain = new URL(link.href).hostname;
        } catch {
            return; // Skip malformed URLs
        }

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

// Run all static enhancements on startup
sortHubMenu();
sortResourceCardLinks();
injectStaticLinkIcons();

/* ==========================================================================
   6. CUSTOM BOOKMARKS MANAGEMENT
   ========================================================================== */

/**
 * Re-renders the bookmark tray in the header from the `savedLinks` array.
 * Each entry displays a favicon icon linked to its URL, with a delete button.
 * Clears and rebuilds the list on every call to stay in sync with state.
 */
function displayCustomLinks() {
    customLinksList.innerHTML = '';

    if (savedLinks.length === 0) return;

    savedLinks.forEach((link, index) => {
        let domain = '';
        try {
            domain = new URL(link.url).hostname;
        } catch {
            domain = '';
        }

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
 * Removes the bookmark at the given index from `savedLinks`, updates the
 * display, and persists the change to the cloud (if authenticated).
 *
 * Exposed on `window` so inline `onclick` attributes in the tray HTML can
 * reach it without a module import.
 *
 * @param {number} index - The zero-based position of the link to remove.
 */
window.deleteLink = function (index) {
    savedLinks.splice(index, 1);
    displayCustomLinks();
    saveUserDataToCloud();
};

// Add new bookmark on form submission
bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savedLinks.push({ name: linkName.value, url: linkUrl.value });
    displayCustomLinks();
    saveUserDataToCloud();
    linkName.value = '';
    linkUrl.value = '';
});

// Initial render (covers guest-mode data already in memory)
displayCustomLinks();

/* ==========================================================================
   7. CATEGORY FILTER
   ========================================================================== */

const menuItems = document.querySelectorAll('#category-menu li');

/**
 * Shows only the resource card matching `targetId`, or all cards when
 * `targetId` is `'all'`.
 *
 * @param {string} targetId - The `id` attribute of the card to display, or `'all'`.
 */
function applyCategoryFilter(targetId) {
    resourceCards.forEach(card => {
        card.style.display = (targetId === 'all' || card.id === targetId) ? 'block' : 'none';
    });
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        applyCategoryFilter(item.getAttribute('data-target'));
    });
});

/* ==========================================================================
   8. CLOUD DATA SYNCHRONIZATION (FIREBASE AUTH & FIRESTORE)
   ========================================================================== */

/**
 * Writes the current `savedLinks` array to the authenticated user's
 * Firestore document. No-ops silently when no user is signed in.
 */
async function saveUserDataToCloud() {
    if (!window.auth.currentUser) return;

    try {
        await setDoc(doc(window.db, "users", window.auth.currentUser.uid), {
            links: savedLinks,
            updatedAt: new Date()
        });
        console.log("Cloud sync successful.");
    } catch (error) {
        console.error("Cloud sync failed:", error);
    }
}

/**
 * Responds to Firebase auth state changes.
 *
 * - Signed in:  Shows the user profile, loads bookmarks from Firestore.
 * - Signed out: Shows the login button, clears the bookmark tray.
 */
onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        // Update header UI to reflect the signed-in user
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

        // Fetch bookmarks from Firestore; create a blank doc for new users
        const docRef = doc(window.db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            savedLinks = docSnap.data().links ?? [];
        } else {
            savedLinks = [];
            await saveUserDataToCloud();
        }

        displayCustomLinks();

    } else {
        // Reset header to signed-out state
        loginBtn.style.display = 'block';
        userProfileContainer.style.display = 'none';
        userNameSpan.textContent = '';

        savedLinks = [];
        displayCustomLinks();
    }
});

// Auth action handlers
loginBtn.onclick = () => signInWithPopup(window.auth, provider);
logoutBtn.onclick = () =>
    signOut(window.auth)
        .then(closeAllDropdowns)
        .catch((error) => console.error("Logout error:", error));

/* ==========================================================================
   9. BOOKMARK MODAL
   ========================================================================== */

const modal = document.getElementById('add-link-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

/** Opens the Add Bookmark modal. */
function openModal() { modal.classList.add('show'); }

/** Closes the Add Bookmark modal. */
function closeModal() { modal.classList.remove('show'); }

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

// Close on backdrop click
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Close and reset form after a successful submission
bookmarkForm.addEventListener('submit', () => {
    closeModal();
    setTimeout(() => bookmarkForm.reset(), 100);
});

/* ==========================================================================
   10. MASONRY GRID LAYOUT
   ========================================================================== */

/**
 * Calculates and applies `grid-row-end: span N` to each card so the CSS
 * masonry grid can pack cards tightly without fixed row heights.
 * Must be re-run whenever card content changes or the viewport is resized.
 */
function applyMasonryLayout() {
    document.querySelectorAll('.card').forEach(card => {
        card.style.gridRowEnd = 'auto';
        card.style.gridRowEnd = `span ${Math.ceil(card.offsetHeight + 16)}`;
    });
}

window.addEventListener('load', applyMasonryLayout);
window.addEventListener('resize', applyMasonryLayout);
applyMasonryLayout();
