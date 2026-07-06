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

// Ghost card (add new custom card trigger)
const ghostCard = document.getElementById('ghost-add-card');

// New card modal elements
const newCardModal = document.getElementById('new-card-modal');
const newCardForm = document.getElementById('new-card-form');
const newCardName = document.getElementById('new-card-name');

// Edit card modal elements
const editCardModal = document.getElementById('edit-card-modal');
const renameCardForm = document.getElementById('rename-card-form');
const editCardNameInput = document.getElementById('edit-card-name');
const editCardLinksList = document.getElementById('edit-card-links-list');
const addCardLinkForm = document.getElementById('add-card-link-form');
const cardLinkName = document.getElementById('card-link-name');
const cardLinkUrl = document.getElementById('card-link-url');
const deleteCardBtn = document.getElementById('delete-card-btn');

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
};

// In-memory tray bookmark store; populated from localStorage or Firestore.
let savedLinks = [];

/**
 * In-memory custom card store.
 * Each entry: { id: string, title: string, links: [{ name, url }] }
 * Persisted to Firestore (authenticated) or localStorage (guest).
 */
let customCards = [];

// Tracks which custom card is open in the edit modal.
let editingCardId = null;

// Built-in card IDs in their original DOM order — used as the source of
// truth when restoring a saved grid order on load.
const BUILTIN_CARD_IDS = [
    'ai-assistants',
    'learning-media',
    'google-tools',
    'toolbox',
    'communication',
    'career',
];

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
 * Generates a short unique ID for new custom cards.
 * Prefixed with 'custom-' so they can be distinguished from built-in cards.
 *
 * @returns {string} A unique string ID.
 */
function generateCardId() {
    return 'custom-' + Math.random().toString(36).slice(2, 9);
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
    document.querySelectorAll('.resources-grid .card:not(.custom-card)').forEach(card => {
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
 * Only targets built-in cards; custom cards manage their own icon injection.
 */
function injectStaticLinkIcons() {
    const staticLinks = document.querySelectorAll('.card:not(.custom-card) .link-list a');

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
   8. CUSTOM CARD RENDERING
   ========================================================================== */

/**
 * Builds and returns a DOM element for a single custom card.
 * Includes a pencil edit button visible on hover and injects favicons
 * for each link in the card.
 *
 * @param {{ id: string, title: string, links: Array<{name: string, url: string}> }} card
 * @returns {HTMLElement} The fully constructed card section element.
 */
function buildCustomCardElement(card) {
    const section = document.createElement('section');
    section.className = 'card custom-card';
    section.id = card.id;
    section.draggable = true;
    section.dataset.customId = card.id;

    // Edit button (pencil icon — visible on hover via CSS)
    const editBtn = document.createElement('button');
    editBtn.className = 'card-edit-btn';
    editBtn.title = 'Edit card';
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`;
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditCardModal(card.id);
    });

    // Card heading
    const h3 = document.createElement('h3');
    h3.textContent = card.title;

    // Link list
    const ul = document.createElement('ul');
    ul.className = 'link-list';

    card.links.forEach(link => {
        let domain = '';
        try { domain = new URL(link.url).hostname; } catch { /* leave empty */ }

        const li = document.createElement('li');
        const wrapper = document.createElement('div');
        wrapper.className = 'link-wrapper';

        const img = document.createElement('img');
        img.src = getFaviconUrl(domain);
        img.className = 'favicon';
        img.alt = '';
        img.setAttribute('onerror', "this.style.display='none'");

        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.textContent = link.name;

        wrapper.appendChild(img);
        wrapper.appendChild(a);
        li.appendChild(wrapper);
        ul.appendChild(li);
    });

    section.appendChild(editBtn);
    section.appendChild(h3);
    section.appendChild(ul);

    return section;
}

/**
 * Renders all custom cards into the grid in their stored order.
 * Removes any previously rendered custom cards first to avoid duplication.
 * The ghost card is always kept at the very end.
 */
function renderCustomCards() {
    // Remove all previously rendered custom cards
    grid.querySelectorAll('.custom-card').forEach(el => el.remove());

    // Insert each card before the ghost card
    customCards.forEach(card => {
        const el = buildCustomCardElement(card);
        grid.insertBefore(el, ghostCard);
    });

    // Re-attach drag listeners to include new custom cards
    initDragAndDrop();
    applyMasonryLayout();
}

/**
 * Replaces only the single custom card DOM element for `card` in the grid,
 * preserving the positions of all other cards.  Used for link add/delete so
 * we never have to tear down and re-attach drag listeners on every card.
 *
 * @param {{ id: string, title: string, links: Array<{name:string,url:string}> }} card
 */
function rebuildCustomCard(card) {
    const existing = grid.querySelector(`#${CSS.escape(card.id)}`);
    const newEl = buildCustomCardElement(card);

    // Attach drag listeners directly — no cloneNode needed here
    newEl.addEventListener('dragstart', handleDragStart);
    newEl.addEventListener('dragover', handleDragOver);
    newEl.addEventListener('dragleave', handleDragLeave);
    newEl.addEventListener('drop', handleDrop);
    newEl.addEventListener('dragend', handleDragEnd);

    if (existing) {
        grid.replaceChild(newEl, existing);
    } else {
        grid.insertBefore(newEl, ghostCard);
    }

    applyMasonryLayout();
}



/**
 * Temporary link buffer for the "new card" modal.
 * Links accumulate here and are flushed into the card on creation.
 * @type {Array<{name: string, url: string}>}
 */
let newCardPendingLinks = [];

const newCardLinksList = document.getElementById('new-card-links-list');
const newCardLinkCount = document.getElementById('new-card-link-count');
const newCardAddLinkBtn = document.getElementById('new-card-add-link-btn');
const newCardLinkNameInput = document.getElementById('new-card-link-name');
const newCardLinkUrlInput = document.getElementById('new-card-link-url');

/** Re-renders the pending links list inside the new card modal. */
function renderNewCardLinkList() {
    newCardLinkCount.textContent = `(${newCardPendingLinks.length})`;
    newCardLinksList.innerHTML = '';

    if (newCardPendingLinks.length === 0) {
        newCardLinksList.innerHTML = '<li class="edit-links-empty">No links yet — add some below.</li>';
        return;
    }

    newCardPendingLinks.forEach((link, index) => {
        const li = document.createElement('li');
        li.className = 'edit-link-row';
        li.innerHTML = `
            <span class="edit-link-name">${link.name}</span>
            <a href="${link.url}" target="_blank" class="edit-link-url" title="${link.url}">${link.url}</a>
            <button type="button" class="delete-link-btn" aria-label="Remove link">×</button>
        `;
        li.querySelector('.delete-link-btn').addEventListener('click', () => {
            newCardPendingLinks.splice(index, 1);
            renderNewCardLinkList();
        });
        newCardLinksList.appendChild(li);
    });
}

// Ghost card click — open the new card modal
ghostCard.addEventListener('click', () => {
    newCardName.value = '';
    newCardPendingLinks = [];
    renderNewCardLinkList();
    openModal('new-card-modal');
    setTimeout(() => newCardName.focus(), 50);
});

function addPendingLink() {
    const name = newCardLinkNameInput.value.trim();
    const url = newCardLinkUrlInput.value.trim();
    if (!name || !url) return;

    newCardPendingLinks.push({ name, url });
    renderNewCardLinkList();
    newCardLinkNameInput.value = '';
    newCardLinkUrlInput.value = '';
    newCardLinkNameInput.focus();
}

newCardAddLinkBtn.addEventListener('click', addPendingLink);

// Allow pressing Enter in either input field to add the link
[newCardLinkNameInput, newCardLinkUrlInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addPendingLink(); }
    });
});

// Create card — flushes all pending links into the new card
newCardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = newCardName.value.trim();
    if (!title) return;

    const newCard = { id: generateCardId(), title, links: [...newCardPendingLinks] };
    customCards.push(newCard);
    renderCustomCards();
    saveUserData();
    closeModal('new-card-modal');
    newCardForm.reset();
    newCardPendingLinks = [];
});

/* ==========================================================================
   10. CUSTOM CARD EDITING
   ========================================================================== */

/**
 * Opens the edit modal pre-populated with the data of the given card.
 *
 * @param {string} cardId - The ID of the custom card to edit.
 */
function openEditCardModal(cardId) {
    const card = customCards.find(c => c.id === cardId);
    if (!card) return;

    editingCardId = cardId;
    editCardNameInput.value = card.title;
    renderEditCardLinks(card);
    cardLinkName.value = '';
    cardLinkUrl.value = '';
    openModal('edit-card-modal');
}

/**
 * Populates the link list inside the edit modal for the given card.
 * Each row shows the link name and a delete button.
 *
 * @param {{ links: Array<{name: string, url: string}> }} card
 */
function renderEditCardLinks(card) {
    editCardLinksList.innerHTML = '';

    if (card.links.length === 0) {
        editCardLinksList.innerHTML = '<li class="edit-links-empty">No links yet.</li>';
        return;
    }

    card.links.forEach((link, index) => {
        const li = document.createElement('li');
        li.className = 'edit-link-row';
        li.innerHTML = `
            <span class="edit-link-name">${link.name}</span>
            <a href="${link.url}" target="_blank" class="edit-link-url" title="${link.url}">${link.url}</a>
            <button class="delete-link-btn" aria-label="Remove link">×</button>
        `;
        li.querySelector('.delete-link-btn').addEventListener('click', () => {
            deleteCardLink(editingCardId, index);
        });
        editCardLinksList.appendChild(li);
    });
}

// Rename card form submission
renameCardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const card = customCards.find(c => c.id === editingCardId);
    if (!card) return;

    card.title = editCardNameInput.value.trim();
    renderCustomCards();
    saveUserData();
    closeModal('edit-card-modal');
});

// Add link to card form submission
addCardLinkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const card = customCards.find(c => c.id === editingCardId);
    if (!card) return;

    const name = cardLinkName.value.trim();
    const url = cardLinkUrl.value.trim();
    if (!name || !url) return;

    card.links.push({ name, url });
    renderEditCardLinks(card);   // update modal list
    saveUserData();               // persist
    rebuildCustomCard(card);      // patch just this card in the grid
    cardLinkName.value = '';
    cardLinkUrl.value = '';
    cardLinkName.focus();
});

/**
 * Removes a link from a custom card by index, then re-renders
 * both the grid card and the edit modal link list.
 *
 * @param {string} cardId - The ID of the owning custom card.
 * @param {number} index  - Zero-based index of the link to remove.
 */
function deleteCardLink(cardId, index) {
    const card = customCards.find(c => c.id === cardId);
    if (!card) return;

    card.links.splice(index, 1);
    renderEditCardLinks(card);
    saveUserData();
    rebuildCustomCard(card);
}

// Delete entire card button
deleteCardBtn.addEventListener('click', () => {
    if (!editingCardId) return;
    customCards = customCards.filter(c => c.id !== editingCardId);
    renderCustomCards();
    saveUserData();
    closeModal('edit-card-modal');
    editingCardId = null;
});

/* ==========================================================================
   11. DRAG-AND-DROP GRID REORDERING
   ========================================================================== */

/** @type {HTMLElement|null} The card element currently being dragged. */
let dragSrcEl = null;

/** Tracks which cards already have drag listeners so we never double-attach. */
const dragListenersAttached = new WeakSet();

/**
 * Attaches HTML5 drag-and-drop listeners to all draggable cards in the grid.
 * Re-called after any card is added or removed so new cards are included.
 * Uses a WeakSet guard so listeners are never attached twice (avoids the
 * cloneNode approach that was stripping edit-button click handlers).
 */
function initDragAndDrop() {
    grid.querySelectorAll('.card[draggable="true"]').forEach(card => {
        if (dragListenersAttached.has(card)) return;
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('dragleave', handleDragLeave);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);
        dragListenersAttached.add(card);
    });
}

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.id);
    setTimeout(() => this.classList.add('card--dragging'), 0);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('card--drag-over');
}

function handleDragLeave() {
    this.classList.remove('card--drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    this.classList.remove('card--drag-over');

    if (dragSrcEl === this) return;

    // Swap DOM positions
    const allCards = [...grid.querySelectorAll('.card:not(.ghost-card)')];
    const srcIdx = allCards.indexOf(dragSrcEl);
    const tgtIdx = allCards.indexOf(this);

    if (srcIdx < tgtIdx) {
        grid.insertBefore(dragSrcEl, this.nextSibling);
    } else {
        grid.insertBefore(dragSrcEl, this);
    }

    // Persist the new order and re-run masonry
    persistGridOrder();
    applyMasonryLayout();
}

function handleDragEnd() {
    this.classList.remove('card--dragging');
    grid.querySelectorAll('.card').forEach(c => c.classList.remove('card--drag-over'));
}

/**
 * Reads the current DOM card order and saves it to userData so it can
 * be restored on next page load.
 */
function persistGridOrder() {
    const order = [...grid.querySelectorAll('.card:not(.ghost-card)')].map(c => c.id);
    saveUserData({ cardOrder: order });
}

/**
 * Restores the saved card order by re-inserting cards into the grid
 * in the order stored in `userData.cardOrder`.
 * Cards not present in the saved order (e.g. newly added built-ins)
 * are appended after the ordered ones.
 *
 * @param {string[]} cardOrder - Array of card element IDs in desired order.
 */
function applyGridOrder(cardOrder) {
    if (!cardOrder || cardOrder.length === 0) return;

    const placed = new Set();

    cardOrder.forEach(id => {
        const el = grid.querySelector(`#${CSS.escape(id)}`);
        if (el && el !== ghostCard) {
            grid.insertBefore(el, ghostCard);
            placed.add(id);
        }
    });

    // Any built-in card not in the saved order gets appended after the ordered ones
    BUILTIN_CARD_IDS.forEach(id => {
        if (placed.has(id)) return;
        const el = grid.querySelector(`#${CSS.escape(id)}`);
        if (el && el !== ghostCard) {
            grid.insertBefore(el, ghostCard);
        }
    });
}

// Initialise drag listeners on the built-in cards at startup
initDragAndDrop();

/* ==========================================================================
   12. TRAY BOOKMARK MODAL
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
   13. CLOUD DATA SYNCHRONIZATION (FIREBASE AUTH & FIRESTORE)
   ========================================================================== */

/**
 * Writes `savedLinks`, `customCards`, and the current grid order to
 * the authenticated user's Firestore document.
 * No-ops silently when no user is signed in (guest data stays local).
 *
 * @param {Partial<{cardOrder: string[]}>} [extra={}] - Optional extra fields to merge.
 */
async function saveUserData(extra = {}) {
    // Always persist locally for guest sessions
    const cardOrder = extra.cardOrder ??
        [...grid.querySelectorAll('.card:not(.ghost-card)')].map(c => c.id);

    localStorage.setItem('conduit_customCards', JSON.stringify(customCards));
    localStorage.setItem('conduit_cardOrder', JSON.stringify(cardOrder));

    if (!window.auth?.currentUser) return;

    try {
        await setDoc(doc(window.db, "users", window.auth.currentUser.uid), {
            links: savedLinks,
            customCards,
            cardOrder,
            updatedAt: new Date(),
        });
        console.log("Cloud sync successful.");
    } catch (error) {
        console.error("Cloud sync failed:", error);
    }
}

/**
 * Loads user data (bookmarks, custom cards, grid order) and applies it.
 * Prefers Firestore when signed in; falls back to localStorage for guests.
 *
 * @param {import("firebase/auth").User|null} user
 */
async function loadAndApplyUserData(user) {
    let data = { links: [], customCards: [], cardOrder: [] };

    if (user) {
        // Signed in — fetch from Firestore
        const docRef = doc(window.db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const d = docSnap.data();
            data.links = d.links ?? [];
            data.customCards = d.customCards ?? [];
            data.cardOrder = d.cardOrder ?? [];
        } else {
            // First-time sign-in — seed with empty doc
            await saveUserData();
        }
    } else {
        // Guest — load from localStorage
        try { data.customCards = JSON.parse(localStorage.getItem('conduit_customCards') || '[]'); } catch { /* ignore */ }
        try { data.cardOrder = JSON.parse(localStorage.getItem('conduit_cardOrder') || '[]'); } catch { /* ignore */ }
    }

    savedLinks = data.links;
    customCards = data.customCards;

    displayCustomLinks();
    renderCustomCards();
    applyGridOrder(data.cardOrder);
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
   14. MASONRY GRID LAYOUT
   ========================================================================== */

/**
 * Calculates and applies `grid-row-end: span N` to each card so the CSS
 * masonry grid packs cards tightly without fixed row heights.
 * Re-run whenever card content changes or the viewport is resized.
 */
function applyMasonryLayout() {
    grid.querySelectorAll('.card:not(.ghost-card)').forEach(card => {
        card.style.gridRowEnd = 'auto';
        card.style.gridRowEnd = `span ${Math.ceil(card.offsetHeight + 16)}`;
    });
    // Ghost card gets a fixed small span so it never creates a blank gap
    const ghost = document.getElementById('ghost-add-card');
    if (ghost) ghost.style.gridRowEnd = 'span 80';
}

window.addEventListener('load', applyMasonryLayout);
window.addEventListener('resize', applyMasonryLayout);
applyMasonryLayout();