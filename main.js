/* ==========================================================================
   CORE / SHARED UTILITIES
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. FAVICON HELPER
   -------------------------------------------------------------------------- */

/**
 * Resolves the favicon URL for a domain.
 * @param {string} domain
 * @returns {string}
 */
function getFaviconUrl(domain) {
    return CUSTOM_ICON_MAP[domain] ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/* --------------------------------------------------------------------------
   2. MODAL HELPERS
   -------------------------------------------------------------------------- */

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

// Close the currently-open modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openOverlay = document.querySelector('.modal-overlay.show');
    if (openOverlay) closeModal(openOverlay.id);
});

/* --------------------------------------------------------------------------
   3. NAVIGATION DROPDOWN CONTROLLER
   -------------------------------------------------------------------------- */

// Registry of open/close-able nav dropdowns. Modules (hub-menu.js,
// calendar.js, etc.) add their own trigger/menu/container via
// registerDropdown().
const openDropdowns = [];

// Closes all open navigation dropdowns.
function closeAllDropdowns() {
    openDropdowns.forEach(({ menu, container }) => {
        menu.classList.remove('show');
        container.classList.remove('active');
    });
}

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

/**
 * Wires up a trigger/menu/container as a toggleable nav dropdown and adds
 * it to the closeAllDropdowns() registry. Used by hub-menu.js for the DIU
 * Hub menu and by calendar.js for the calendar widget.
 * @param {Element} trigger
 * @param {Element} menu
 * @param {Element} container
 */
function registerDropdown(trigger, menu, container) {
    openDropdowns.push({ menu, container });
    trigger.addEventListener('click', (e) => toggleDropdown(e, menu, container));
    // Prevent clicks inside the open menu from bubbling to the document
    menu.addEventListener('click', (e) => e.stopPropagation());
}
window.registerDropdown = registerDropdown;

document.addEventListener('click', closeAllDropdowns);
