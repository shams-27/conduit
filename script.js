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

// Calendar elements
const calendarDropdown = document.getElementById('calendar-dropdown');
const calendarTrigger = document.getElementById('calendar-trigger');
const calendarMenu = document.getElementById('calendar-menu');

// DIU Hub dropdown elements
const hubDropdown = document.getElementById('diu-hub-dropdown');
const hubTrigger = document.getElementById('hub-trigger');
const hubMenu = document.getElementById('hub-menu');

// Favicon overrides for domains with poor default icons
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
    "www.codeforces.com": "https://img.icons8.com/?size=100&id=jldAN67IAsrW&format=png&color=000000",
    "onedrive.live.com": "https://img.icons8.com/?size=100&id=4SkJHbAlDawt&format=png&color=000000"
};

// In-memory bookmark store, synced with localStorage
let savedLinks = [];

/* ==========================================================================
   2. HELPER UTILITIES
   ========================================================================== */

/**
 * Resolves the favicon URL for a domain.
 * @param {string} domain
 * @returns {string}
 */
function getFaviconUrl(domain) {
    return CUSTOM_ICON_MAP[domain] ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/** Closes all open navigation dropdowns. */
function closeAllDropdowns() {
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
 * @param {string} id
 */
function openModal(id) {
    document.getElementById(id)?.classList.add('show');
}

/**
 * Closes a modal overlay by ID.
 * @param {string} id
 */
function closeModal(id) {
    document.getElementById(id)?.classList.remove('show');
}

// Closes a modal via any [data-close] button
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
 * Toggles a dropdown, closing all others first.
 * @param {Event} e
 * @param {Element} menuToToggle
 * @param {Element} triggerParent
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

hubTrigger.addEventListener('click', (e) => toggleDropdown(e, hubMenu, hubDropdown));
calendarTrigger.addEventListener('click', (e) => toggleDropdown(e, calendarMenu, calendarDropdown));

// Prevent clicks inside open menus from bubbling to the document
[calendarMenu, hubMenu].forEach(menu => {
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
const calendarCurrentDate = document.getElementById('calendar-current-date');

// Currently displayed calendar month
let calendarDate = new Date();

/** Renders today's date in the calendar trigger. */
function renderCurrentDateLabel() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    calendarCurrentDate.textContent = `${day}/${month}/${year}`;
}

renderCurrentDateLabel();

/** Renders the calendar grid for the active month. */
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

/** Sorts DIU Hub items alphabetically. */
function sortHubMenu() {
    const menu = document.getElementById('hub-menu');
    if (!menu) return;
    Array.from(menu.querySelectorAll('.hub-item'))
        .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
        .forEach(item => menu.appendChild(item));
}

/** Sorts each resource card's links alphabetically. */
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

/** Adds favicons to static resource links. */
function injectStaticLinkIcons() {
    const staticLinks = document.querySelectorAll('.card .link-list a');

    staticLinks.forEach(link => {
        // Skip already-wrapped links
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

/** Re-renders the bookmark tray from savedLinks. */
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
   9. LOCAL BOOKMARK PERSISTENCE (localStorage)
   ========================================================================== */

const LINKS_STORAGE_KEY = 'conduit.customLinks';

/** Persists savedLinks to localStorage. */
function saveUserData() {
    try {
        localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(savedLinks));
    } catch (error) {
        console.error("Local save failed:", error);
    }
}

/** Loads bookmarks from localStorage. */
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

/* ==========================================================================
   10. MASONRY GRID LAYOUT
   ========================================================================== */

/** Places each card into the shortest column for a balanced masonry layout. */
function applyMasonryLayout() {
    const cards = Array.from(grid.querySelectorAll('.card'));
    if (cards.length === 0) return;

    // Reset placement to measure natural height
    cards.forEach(card => {
        card.style.gridColumn = '';
        card.style.gridRow = '';
    });

    const columnCount = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const columnHeights = new Array(columnCount).fill(0);
    const ROW_GAP = 24; // vertical spacing between stacked cards in a column

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
